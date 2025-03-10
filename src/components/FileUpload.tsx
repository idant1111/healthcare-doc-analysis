import React, { useRef, useEffect } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/toast-context";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onFileRemove,
  selectedFile,
  isLoading = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Reset file input when selectedFile changes
  useEffect(() => {
    if (!selectedFile && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check if the file is a PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF document",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    onFileRemove();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
        disabled={isLoading}
      />
      
      {!selectedFile ? (
        <Button 
          onClick={handleButtonClick} 
          className="w-full flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <Upload size={20} />
          Upload PDF Document
        </Button>
      ) : (
        <div className="flex items-center p-2 border rounded-md bg-secondary/10">
          <File size={20} className="text-primary mr-2" />
          <span className="text-sm truncate flex-1">{selectedFile.name}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemoveFile}
            disabled={isLoading}
            className="ml-2 h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 