"use client";

import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User, X } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName?: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  className?: string;
}

interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  format: string;
  category: string;
}

export function AvatarUpload({ 
  currentAvatar, 
  userName = "User",
  onAvatarUpdate,
  className 
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUploadComplete = (files: UploadedFile[]) => {
    if (files.length > 0) {
      const newAvatar = files[0];
      setPreviewUrl(newAvatar.url);
      onAvatarUpdate?.(newAvatar.url);
      toast.success('Profile picture updated successfully!');
    }
    setIsUploading(false);
  };

  const handleUploadError = (error: string) => {
    setIsUploading(false);
    toast.error(`Failed to upload profile picture: ${error}`);
  };

  const removeAvatar = async () => {
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      if (response.ok) {
        setPreviewUrl(null);
        onAvatarUpdate?.('');
        toast.success('Profile picture removed');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to remove profile picture');
      }
    } catch (error) {
      toast.error('Failed to remove profile picture');
    }
  };

  const displayAvatar = previewUrl || currentAvatar;
  const initials = userName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={className}>
      <Card className="p-6">
        <div className="space-y-6">
          {/* Current Avatar Preview */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg">
                <AvatarImage 
                  src={displayAvatar} 
                  alt={`${userName}'s profile picture`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {displayAvatar && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Profile Picture
              </h3>
              <p className="text-sm text-gray-500">
                Upload a new profile picture to personalize your account
              </p>
            </div>
          </div>

          {/* Upload Interface */}
          <div className="space-y-4">
            <FileUpload
              category="avatar"
              multiple={false}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              disabled={isUploading}
              className="max-w-md mx-auto"
            />

            {/* Upload Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Camera className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-blue-800">
                    Photo Guidelines
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use a clear, high-quality image</li>
                    <li>• Show your face clearly (no sunglasses or hats)</li>
                    <li>• Keep it professional and appropriate</li>
                    <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                    <li>• Maximum file size: 5MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}