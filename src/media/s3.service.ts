import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  private readonly s3: S3;

  constructor() {
    // AWS SDK will automatically use IAM role when running on EC2/ECS
    // No need for access keys when using IAM role
    this.s3 = new S3({
      region: process.env.AWS_REGION || 'eu-north-1',
      // If running locally, you can still use credentials from .env
      // But in production, IAM role will be used automatically
      ...(process.env.NODE_ENV === 'production' ? {} : {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      })
    });
  }

  async uploadFile(file: any, folder: string): Promise<{ key: string; location: string }> {
    const key = `${folder}/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Remove ACL to keep files private and use signed URLs
      CacheControl: 'max-age=31536000', // Cache for 1 year
      Metadata: {
        'original-name': file.originalname,
        'upload-time': new Date().toISOString(),
      }
    };

    try {
      const result = await this.s3.upload(params).promise();
      
      // Verify the file is accessible by attempting to get its metadata
      try {
        await this.s3.headObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key
        }).promise();
        console.log(`✅ File uploaded successfully: ${key}`);
      } catch (headError) {
        console.error(`❌ File upload verification failed: ${headError.message}`);
        throw new Error(`File uploaded but not accessible: ${headError.message}`);
      }
      
      return {
        key: result.Key,
        location: result.Location,
      };
    } catch (error) {
      console.error(`❌ S3 Upload Error: ${error.message}`);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async getFileUrl(key: string): Promise<string> {
    // Use signed URL for secure access
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour from now
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Expires: Math.floor(expiresAt.getTime() / 1000), // Convert to seconds
    };

    try {
      const result = await this.s3.getSignedUrlPromise('getObject', params);
      console.log(`🔗 Generated signed URL for ${key} (expires at ${expiresAt.toISOString()})`);
      return result;
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  // Method to generate long-lived signed URL (for frontend display)
  async getPublicUrl(key: string): Promise<string> {
    // Use future timestamp to ensure 1-hour validity
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour from now
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Expires: Math.floor(expiresAt.getTime() / 1000), // Convert to seconds
    };

    try {
      const result = await this.s3.getSignedUrlPromise('getObject', params);
      console.log(`🔗 Generated public URL for ${key} (expires at ${expiresAt.toISOString()})`);
      return result;
    } catch (error) {
      throw new Error(`Failed to generate public URL: ${error.message}`);
    }
  }

  async setPublicACL(key: string): Promise<void> {
    try {
      await this.s3.putObjectAcl({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        ACL: 'public-read'
      }).promise();
      console.log(`✅ ACL set to public-read for: ${key}`);
    } catch (error) {
      console.error(`❌ Failed to set ACL for ${key}: ${error.message}`);
      throw new Error(`Failed to set public ACL: ${error.message}`);
    }
  }

  async diagnoseS3Permissions(): Promise<{ success: boolean; details: any }> {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    try {
      // Test 1: Check bucket exists and is accessible
      const bucketInfo = await this.s3.headBucket({ Bucket: bucketName }).promise();
      
      // Test 2: Try to upload a test file (private)
      const testKey = 'test-signed-access.txt';
      await this.s3.putObject({
        Bucket: bucketName,
        Key: testKey,
        Body: 'Signed URL access test',
        ContentType: 'text/plain'
        // No ACL - keep private
      }).promise();
      
      // Test 3: Generate signed URL
      const signedUrl = await this.getFileUrl(testKey);
      console.log(`✅ Signed URL generated: ${signedUrl.substring(0, 100)}...`);
      
      // Test 4: Clean up test file
      await this.s3.deleteObject({ Bucket: bucketName, Key: testKey }).promise();
      
      return {
        success: true,
        details: {
          bucketAccessible: true,
          signedUrlGeneration: true,
          privateUpload: true,
          signedUrlExample: signedUrl.substring(0, 100) + '...',
          message: 'S3 configured for signed URL access',
          note: 'Files are private and accessed via signed URLs'
        }
      };
    } catch (error) {
      return {
        success: false,
        details: {
          error: error.message,
          bucketName,
          region: process.env.AWS_REGION,
          message: 'S3 permissions need to be configured for signed URL access'
        }
      };
    }
  }
}
