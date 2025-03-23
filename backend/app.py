
import os
import io
import json
import base64
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ExifTags
from ultralytics import YOLO
import cv2
import numpy as np
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the YOLOv8 model
MODEL_PATH = os.getenv("MODEL_PATH", "./models/ecobot.pt")
model = None

def load_model():
    global model
    try:
        model = YOLO(MODEL_PATH)
        print(f"Model loaded successfully from {MODEL_PATH}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

# Extract GPS data from image EXIF metadata
def extract_gps(img):
    try:
        exif_data = {}
        img_exif = img._getexif()
        if img_exif is not None:
            for tag, value in img_exif.items():
                if tag in ExifTags.TAGS:
                    exif_data[ExifTags.TAGS[tag]] = value
            
            if 'GPSInfo' in exif_data:
                gps_info = exif_data['GPSInfo']
                
                # Extract latitude
                if 2 in gps_info:
                    lat_data = gps_info[2]
                    lat_ref = gps_info.get(1, 'N')
                    lat = (lat_data[0][0] / lat_data[0][1] +
                           lat_data[1][0] / lat_data[1][1] / 60 +
                           lat_data[2][0] / lat_data[2][1] / 3600)
                    if lat_ref == 'S':
                        lat = -lat
                
                    # Extract longitude
                    lon_data = gps_info[4]
                    lon_ref = gps_info.get(3, 'E')
                    lon = (lon_data[0][0] / lon_data[0][1] +
                           lon_data[1][0] / lon_data[1][1] / 60 +
                           lon_data[2][0] / lon_data[2][1] / 3600)
                    if lon_ref == 'W':
                        lon = -lon
                    
                    return {"latitude": lat, "longitude": lon}
    except Exception as e:
        print(f"Error extracting GPS data: {e}")
    
    return None

# Process image with YOLOv8 model
def process_image(image_bytes):
    try:
        # Open the image with PIL
        img = Image.open(io.BytesIO(image_bytes))
        
        # Extract GPS coordinates if available
        gps_coordinates = extract_gps(img)
        
        # Convert to OpenCV format for processing
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        
        # Run inference with YOLOv8
        results = model(img_cv)
        
        # Process results to get bounding boxes, confidence, etc.
        processed_result = results[0]
        detected_objects = []
        
        for box in processed_result.boxes:
            # Get class ID, confidence, and coordinates
            cls_id = int(box.cls.item())
            confidence = float(box.conf.item())
            
            # Get coordinates (xmin, ymin, xmax, ymax)
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            
            detected_objects.append({
                "class_id": cls_id,
                "class_name": processed_result.names[cls_id],
                "confidence": confidence,
                "bbox": [x1, y1, x2, y2]
            })
        
        # Draw bounding boxes on the image
        result_img = processed_result.plot()
        
        # Convert back to PIL and then to base64 for transfer
        result_pil = Image.fromarray(cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB))
        buffered = io.BytesIO()
        result_pil.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # Return the processed image and metadata
        return {
            "success": True,
            "image": f"data:image/jpeg;base64,{img_str}",
            "detections": detected_objects,
            "gps_coordinates": gps_coordinates,
            "count": len(detected_objects),
            "average_confidence": sum(obj["confidence"] for obj in detected_objects) / len(detected_objects) if detected_objects else 0
        }
    
    except Exception as e:
        print(f"Error processing image: {e}")
        return {"success": False, "error": str(e)}

@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH
    })

@app.route("/api/detect", methods=["POST"])
def detect():
    if model is None:
        success = load_model()
        if not success:
            return jsonify({
                "success": False,
                "error": "Failed to load model"
            }), 500
            
    if 'image' not in request.files:
        return jsonify({
            "success": False,
            "error": "No image file provided"
        }), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({
            "success": False,
            "error": "No image selected"
        }), 400
        
    # Read the image file
    image_bytes = file.read()
    
    # Process the image
    result = process_image(image_bytes)
    return jsonify(result)

if __name__ == "__main__":
    # Load the model on startup
    load_model()
    debug_mode = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    app.run(debug=debug_mode, host="0.0.0.0", port=5000)
