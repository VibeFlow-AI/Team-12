import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export interface UploadOptions {
  folder: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  format?: string;
  transformation?: any[];
  tags?: string[];
  maxSize?: number; // in bytes
  allowedFormats?: string[];
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  secureUrl?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: string;
}

class FileUploadService {
  // Default configurations for different file types
  private static configs = {
    avatar: {
      folder: 'eduvibe/avatars',
      resourceType: 'image' as const,
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    },
    document: {
      folder: 'eduvibe/documents',
      resourceType: 'raw' as const,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['pdf', 'doc', 'docx', 'txt', 'rtf']
    },
    certificate: {
      folder: 'eduvibe/certificates',
      resourceType: 'image' as const,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    },
    bankSlip: {
      folder: 'eduvibe/bank-slips',
      resourceType: 'auto' as const,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'pdf']
    }
  };

  // Upload file to Cloudinary
  static async uploadFile(
    file: File,
    category: keyof typeof FileUploadService.configs,
    userId: string,
    customOptions?: Partial<UploadOptions>
  ): Promise<UploadResult> {
    try {
      const config = this.configs[category];
      
      // Validate file size
      if (file.size > config.maxSize) {
        return {
          success: false,
          error: `File size exceeds ${Math.round(config.maxSize / (1024 * 1024))}MB limit`
        };
      }

      // Validate file format
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !config.allowedFormats.includes(fileExtension)) {
        return {
          success: false,
          error: `Invalid file format. Allowed formats: ${config.allowedFormats.join(', ')}`
        };
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Prepare upload options
      const uploadOptions: any = {
        resource_type: config.resourceType,
        folder: config.folder,
        public_id: `${userId}_${Date.now()}`,
        tags: [
          category,
          `user-${userId}`,
          `uploaded-${Date.now()}`,
          ...(customOptions?.tags || [])
        ],
        ...customOptions
      };

      // Add transformation if it exists
      if ('transformation' in config && config.transformation) {
        uploadOptions.transformation = config.transformation;
      }

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      };

    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(
    files: File[],
    category: keyof typeof FileUploadService.configs,
    userId: string,
    customOptions?: Partial<UploadOptions>
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await this.uploadFile(file, category, userId, customOptions);
      results.push(result);
    }
    
    return results;
  }

  // Delete file from Cloudinary
  static async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      
      return result.result === 'ok';
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  // Get file info
  static async getFileInfo(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get file info'
      };
    }
  }

  // Get user's uploaded files
  static async getUserFiles(
    userId: string,
    category?: string,
    limit: number = 20
  ): Promise<{
    success: boolean;
    files?: any[];
    error?: string;
  }> {
    try {
      const searchQuery = category 
        ? `folder:eduvibe/${category} AND tags:user-${userId}`
        : `tags:user-${userId}`;
      
      const result = await cloudinary.search
        .expression(searchQuery)
        .sort_by('created_at', 'desc')
        .max_results(limit)
        .execute();

      return {
        success: true,
        files: result.resources.map((resource: any) => ({
          publicId: resource.public_id,
          url: resource.secure_url,
          format: resource.format,
          size: resource.bytes,
          createdAt: resource.created_at,
          width: resource.width,
          height: resource.height,
          tags: resource.tags
        }))
      };
    } catch (error) {
      console.error('Error getting user files:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user files'
      };
    }
  }

  // Generate signed upload URL for client-side uploads
  static async generateSignedUploadUrl(
    folder: string,
    tags: string[] = [],
    transformation?: any[]
  ): Promise<{
    success: boolean;
    uploadUrl?: string;
    signature?: string;
    timestamp?: number;
    error?: string;
  }> {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      const params = {
        timestamp,
        folder,
        tags: tags.join(','),
        transformation: transformation ? JSON.stringify(transformation) : undefined
      };

      const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.CLOUDINARY_SECRET_KEY!
      );

      return {
        success: true,
        uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/auto/upload`,
        signature,
        timestamp
      };
    } catch (error) {
      console.error('Error generating signed upload URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate upload URL'
      };
    }
  }

  // Validate file before upload (client-side)
  static validateFile(
    file: File,
    category: keyof typeof FileUploadService.configs
  ): { valid: boolean; error?: string } {
    const config = this.configs[category];
    
    // Check file size
    if (file.size > config.maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(config.maxSize / (1024 * 1024))}MB limit`
      };
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !config.allowedFormats.includes(fileExtension)) {
      return {
        valid: false,
        error: `Invalid file format. Allowed formats: ${config.allowedFormats.join(', ')}`
      };
    }

    return { valid: true };
  }

  // Get upload configuration for a category
  static getUploadConfig(category: keyof typeof FileUploadService.configs) {
    return this.configs[category];
  }

  // Format file size for display
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default FileUploadService;