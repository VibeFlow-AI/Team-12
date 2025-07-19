"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  Award,
  CreditCard,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  category: 'avatar' | 'document' | 'certificate' | 'bankSlip';
  multiple?: boolean;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  format: string;
  category: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  result?: UploadedFile;
}

const categoryConfig = {
  avatar: {
    icon: Image,
    label: 'Profile Picture',
    accept: 'image/*',
    maxSize: '5MB',
    description: 'Upload your profile picture (JPG, PNG, GIF, WebP)',
    multiple: false
  },
  document: {
    icon: FileText,
    label: 'Document',
    accept: '.pdf,.doc,.docx,.txt,.rtf',
    maxSize: '10MB',
    description: 'Upload documents (PDF, DOC, DOCX, TXT, RTF)',
    multiple: true
  },
  certificate: {
    icon: Award,
    label: 'Certificate',
    accept: 'image/*,.pdf',
    maxSize: '10MB',
    description: 'Upload certificates (JPG, PNG, PDF)',
    multiple: true
  },
  bankSlip: {
    icon: CreditCard,
    label: 'Bank Slip',
    accept: 'image/*,.pdf',
    maxSize: '10MB',
    description: 'Upload payment proof (JPG, PNG, PDF)',
    multiple: false
  }
};

export function FileUpload({ 
  category, 
  multiple = false, 
  onUploadComplete, 
  onUploadError,
  className,
  accept,
  maxFiles = 5,
  disabled = false
}: FileUploadProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = categoryConfig[category];
  const Icon = config.icon;
  const actualAccept = accept || config.accept;
  const actualMultiple = multiple && config.multiple;

  const handleFileSelection = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    // Validate files
    for (const file of fileArray) {
      if (!actualMultiple && uploads.length + validFiles.length >= 1) {
        toast.error('Only one file allowed for this category');
        break;
      }

      if (actualMultiple && uploads.length + validFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        break;
      }

      // Validate file type (basic check)
      const validTypes = actualAccept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isValidType = validTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        return mimeType.startsWith(type.replace('*', ''));
      });

      if (!isValidType) {
        toast.error(`Invalid file type: ${file.name}`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Initialize upload progress for each file
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload files
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const uploadIndex = uploads.length + i;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();

        setUploads(prev => 
          prev.map((upload, index) => 
            index === uploadIndex 
              ? { 
                  ...upload, 
                  progress: 100, 
                  status: 'completed',
                  result: result.file
                }
              : upload
          )
        );

        toast.success(`${file.name} uploaded successfully`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setUploads(prev => 
          prev.map((upload, index) => 
            index === uploadIndex 
              ? { 
                  ...upload, 
                  status: 'error',
                  error: errorMessage
                }
              : upload
          )
        );

        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
        onUploadError?.(errorMessage);
      }
    }

    // Call completion callback with successful uploads
    const completedFiles = uploads
      .filter(upload => upload.status === 'completed' && upload.result)
      .map(upload => upload.result!);
    
    if (completedFiles.length > 0) {
      onUploadComplete?.(completedFiles);
    }
  }, [category, actualAccept, actualMultiple, maxFiles, uploads.length, disabled, onUploadComplete, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files);
    }
  }, [handleFileSelection, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelection(files);
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelection]);

  const removeUpload = useCallback((index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  }, []);

  const retryUpload = useCallback((index: number) => {
    const upload = uploads[index];
    if (upload && upload.status === 'error') {
      handleFileSelection(new DataTransfer().files);
    }
  }, [uploads, handleFileSelection]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors duration-200 cursor-pointer",
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className={cn(
              "p-4 rounded-full",
              isDragOver ? "bg-blue-100" : "bg-gray-100"
            )}>
              <Icon className={cn(
                "w-8 h-8",
                isDragOver ? "text-blue-500" : "text-gray-400"
              )} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload {config.label}
              </h3>
              <p className="text-sm text-gray-500">
                {config.description}
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Badge variant="outline" className="text-xs">
                  Max: {config.maxSize}
                </Badge>
                {actualMultiple && (
                  <Badge variant="outline" className="text-xs">
                    Up to {maxFiles} files
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Files</span>
              </Button>
              <span className="text-sm text-gray-500">or drag and drop</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={actualAccept}
        multiple={actualMultiple}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Upload Progress ({uploads.length})
          </h4>
          
          <div className="space-y-2">
            {uploads.map((upload, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <File className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {upload.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(upload.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUpload(index)}
                          className="p-1 h-6 w-6"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatFileSize(upload.file.size)}
                      </p>
                      
                      {upload.status === 'uploading' && (
                        <span className="text-xs text-blue-600">
                          {upload.progress}%
                        </span>
                      )}
                      
                      {upload.status === 'error' && upload.error && (
                        <span className="text-xs text-red-600">
                          {upload.error}
                        </span>
                      )}
                      
                      {upload.status === 'completed' && (
                        <span className="text-xs text-green-600">
                          Completed
                        </span>
                      )}
                    </div>
                    
                    {upload.status === 'uploading' && (
                      <Progress 
                        value={upload.progress} 
                        className="mt-2 h-1" 
                      />
                    )}
                    
                    {upload.status === 'error' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryUpload(index)}
                        className="mt-1 text-xs text-blue-600 p-0 h-auto"
                      >
                        Retry Upload
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}