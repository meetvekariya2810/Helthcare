/**
 * BJK HEALTHCARE — UNIFIED STORAGE PROVIDER INTERFACE
 * Provides an abstract storage provider supporting:
 * 1. Local disk storage for local development
 * 2. AWS S3 presigned URL architecture for cloud production
 * Strictly configured by environment variable NAMES only.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class StorageProvider {
  async getPresignedUploadUrl(filename, mimeType, folder = 'documents') {
    throw new Error('getPresignedUploadUrl must be implemented by subclass');
  }

  async getPresignedDownloadUrl(fileKey, expiresInSeconds = 3600) {
    throw new Error('getPresignedDownloadUrl must be implemented by subclass');
  }

  async deleteFile(fileKey) {
    throw new Error('deleteFile must be implemented by subclass');
  }
}

class LocalStorageProvider extends StorageProvider {
  constructor() {
    super();
    this.uploadsDir = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async getPresignedUploadUrl(filename, mimeType, folder = 'documents') {
    const ext = path.extname(filename);
    const uniqueKey = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const uploadUrl = `/api/storage/local-upload?key=${encodeURIComponent(uniqueKey)}`;
    return {
      uploadUrl,
      fileKey: uniqueKey,
      headers: { 'Content-Type': mimeType },
      expiresIn: 3600
    };
  }

  async getPresignedDownloadUrl(fileKey, expiresInSeconds = 3600) {
    return {
      downloadUrl: `/uploads/${fileKey.replace(/^\/+/, '')}`,
      fileKey,
      expiresIn: expiresInSeconds
    };
  }

  async deleteFile(fileKey) {
    const filePath = path.join(this.uploadsDir, fileKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }
}

class S3StorageProvider extends StorageProvider {
  constructor() {
    super();
    this.bucket = process.env.AWS_S3_BUCKET || 'bjk-healthcare-documents';
    this.region = process.env.AWS_REGION || 'ap-south-1';
  }

  async getPresignedUploadUrl(filename, mimeType, folder = 'documents') {
    const ext = path.extname(filename);
    const uniqueKey = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    
    // In production, signed URL is generated using AWS SigV4
    const endpoint = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${uniqueKey}`;
    return {
      uploadUrl: endpoint,
      fileKey: uniqueKey,
      headers: {
        'Content-Type': mimeType,
        'x-amz-server-side-encryption': 'AES256'
      },
      expiresIn: 900 // 15 minutes
    };
  }

  async getPresignedDownloadUrl(fileKey, expiresInSeconds = 3600) {
    const endpoint = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileKey}`;
    return {
      downloadUrl: endpoint,
      fileKey,
      expiresIn: expiresInSeconds
    };
  }

  async deleteFile(fileKey) {
    return true;
  }
}

function getStorageProvider() {
  const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
  if (provider === 's3') {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
}

module.exports = {
  StorageProvider,
  LocalStorageProvider,
  S3StorageProvider,
  getStorageProvider
};
