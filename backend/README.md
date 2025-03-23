
# Underwater Plastic Detection Backend

This is the Flask backend for the Underwater Plastic Detection application. It uses YOLOv8 to detect plastic waste in underwater images.

## Setup

1. Place your pretrained model file (`ecobot.pt`) in the `models` directory
2. Create a virtual environment and install the dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and adjust the settings if needed

## Running the server

```bash
python app.py
```

The server will start on http://localhost:5000

## API Endpoints

- `GET /`: Status check
- `POST /api/detect`: Upload an image for plastic detection
    - Request: Form data with 'image' file
    - Response: JSON with detection results, processed image, and GPS coordinates if available
