
import React, { useState, useCallback } from 'react';
import { Upload, X, FileImage, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    onImageSelected(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    toast({
      title: "Image uploaded",
      description: "Your image has been successfully uploaded.",
      variant: "default",
    });
  }, [onImageSelected, toast]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
  }, []);

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <div 
        className={cn(
          "w-full max-w-2xl h-64 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden",
          "glass-card border border-dashed",
          dragActive ? "border-primary scale-[1.01] border-2" : "border-border",
          preview ? "border-none" : "p-6"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemoveFile}
              className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-300"
              aria-label="Remove image"
            >
              <X size={18} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 py-2 px-4 bg-background/50 backdrop-blur-sm text-sm flex items-center">
              <Check size={16} className="text-primary mr-2" />
              <span className="truncate">{selectedFile?.name}</span>
            </div>
          </div>
        ) : (
          <>
            <input
              type="file"
              className="hidden"
              id="image-upload"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 rounded-full glass-button">
                <Upload size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Drag and drop your underwater image here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Or click to browse files (JPEG, PNG)
                </p>
              </div>
              <label
                htmlFor="image-upload"
                className="glass-button px-6 py-2.5 rounded-lg font-medium cursor-pointer"
              >
                Browse Files
              </label>
            </div>
          </>
        )}
      </div>
      
      {selectedFile && (
        <div className="animate-fade-up glass-card px-6 py-4 rounded-xl w-full max-w-md">
          <div className="flex items-center">
            <FileImage size={20} className="text-primary mr-3" />
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <span className="ml-4 flex items-center space-x-2">
              <Check size={16} className="text-primary" />
              <span className="text-xs text-primary">Ready</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
