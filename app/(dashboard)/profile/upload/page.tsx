"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { DocumentUpload } from '@/components/profile/document-upload';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Award, CreditCard, Upload } from 'lucide-react';

export default function UploadPage() {
  const { data: session } = useSession();

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    console.log('Avatar updated:', newAvatarUrl);
    // You can update the session or trigger a refresh here
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              File Management
            </h1>
            <p className="text-gray-600">
              Upload and manage your profile picture, documents, and certificates
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Avatar Upload Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Profile Picture
          </h2>
          <p className="text-gray-600 mb-6">
            Upload a professional profile picture to help others recognize you
          </p>
          
          <AvatarUpload
            currentAvatar={(session?.user as any)?.avatar}
            userName={session?.user?.name || "User"}
            onAvatarUpdate={handleAvatarUpdate}
          />
        </div>

        <Separator />

        {/* Documents Section */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Document Management
            </h2>
            <p className="text-gray-600 mb-6">
              Upload and organize your important documents, certificates, and payment proofs
            </p>
          </div>

          {/* General Documents */}
          <DocumentUpload
            category="document"
            title="General Documents"
            description="Upload your important documents, resumes, and files"
            maxFiles={10}
          />

          {/* Certificates */}
          <DocumentUpload
            category="certificate"
            title="Certificates & Credentials"
            description="Upload your educational certificates, professional credentials, and achievements"
            maxFiles={8}
          />

          {/* Bank Slips */}
          <DocumentUpload
            category="bankSlip"
            title="Payment Proofs"
            description="Upload bank slips and payment confirmation documents"
            maxFiles={5}
          />
        </div>
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900">
              File Upload Guidelines
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Profile Pictures:</strong> JPG, PNG, GIF, WebP up to 5MB</p>
              <p>• <strong>Documents:</strong> PDF, DOC, DOCX, TXT, RTF up to 10MB</p>
              <p>• <strong>Certificates:</strong> JPG, PNG, PDF up to 10MB</p>
              <p>• <strong>Bank Slips:</strong> JPG, PNG, PDF up to 10MB</p>
              <p>• All uploaded files are securely stored and encrypted</p>
              <p>• You can preview, download, or delete files at any time</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}