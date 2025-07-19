"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Calendar,
  Award,
  CreditCard,
  Plus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  format: string;
  size: number;
  category: string;
  createdAt: string;
  metadata?: any;
  tags?: string[];
}

interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  format: string;
  category: string;
}

interface DocumentUploadProps {
  category: 'document' | 'certificate' | 'bankSlip';
  title: string;
  description: string;
  className?: string;
  maxFiles?: number;
}

const categoryConfig = {
  document: {
    icon: FileText,
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  certificate: {
    icon: Award,
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  bankSlip: {
    icon: CreditCard,
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  }
};

export function DocumentUpload({ 
  category, 
  title, 
  description, 
  className,
  maxFiles = 5 
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const config = categoryConfig[category];
  const Icon = config.icon;

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/upload?category=${category}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.files || []);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  // Fetch existing documents
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadComplete = (files: UploadedFile[]) => {
    toast.success(`${files.length} file(s) uploaded successfully!`);
    fetchDocuments(); // Refresh the list
    setShowUpload(false);
  };

  const handleUploadError = (error: string) => {
    toast.error(`Upload failed: ${error}`);
  };

  const handleDownload = (document: Document) => {
    window.open(document.url, '_blank');
  };

  const handlePreview = (document: Document) => {
    // For images and PDFs, open in new tab
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'].includes(document.format.toLowerCase())) {
      window.open(document.url, '_blank');
    } else {
      // For other formats, trigger download
      handleDownload(document);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setDeletingId(documentId);
      const response = await fetch(`/api/upload/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Document deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete document');
      }
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (format: string) => {
    const lowerFormat = format.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(lowerFormat)) {
      return '🖼️';
    }
    if (lowerFormat === 'pdf') {
      return '📄';
    }
    if (['doc', 'docx'].includes(lowerFormat)) {
      return '📝';
    }
    return '📎';
  };

  return (
    <div className={className}>
      <Card className="overflow-hidden">
        {/* Header */}
        <div className={`${config.bgColor} ${config.borderColor} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${config.bgColor} rounded-lg`}>
                <Icon className={`w-5 h-5 ${config.textColor}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${config.textColor}`}>
                  {title}
                </h3>
                <p className={`text-sm ${config.textColor} opacity-75`}>
                  {description}
                </p>
              </div>
            </div>

            {documents.length < maxFiles && (
              <Button
                onClick={() => setShowUpload(!showUpload)}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Files</span>
              </Button>
            )}
          </div>
        </div>

        {/* Upload Interface */}
        {showUpload && (
          <div className="p-6 border-b bg-gray-50">
            <FileUpload
              category={category}
              multiple={category !== 'bankSlip'}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              maxFiles={maxFiles - documents.length}
            />
          </div>
        )}

        {/* Documents List */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No documents uploaded
              </h4>
              <p className="text-gray-500 mb-4">
                Upload your {category === 'bankSlip' ? 'payment proof' : `${category}s`} to get started
              </p>
              {!showUpload && (
                <Button
                  onClick={() => setShowUpload(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload {category === 'bankSlip' ? 'Bank Slip' : 'Documents'}</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  Uploaded Files ({documents.length})
                </h4>
                <Badge variant="outline" className="text-xs">
                  {documents.length}/{maxFiles} files
                </Badge>
              </div>

              <div className="space-y-3">
                {documents.map((document) => (
                  <Card key={document.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                          {getFileIcon(document.format)}
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {document.originalName}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-xs text-gray-500">
                                {formatFileSize(document.size)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {document.format.toUpperCase()}
                              </Badge>
                              <p className="text-xs text-gray-500 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(document.createdAt)}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(document)}
                              className="p-2 h-8 w-8"
                              title="Preview"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(document)}
                              className="p-2 h-8 w-8"
                              title="Download"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(document.id)}
                              disabled={deletingId === document.id}
                              className="p-2 h-8 w-8 text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              {deletingId === document.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}