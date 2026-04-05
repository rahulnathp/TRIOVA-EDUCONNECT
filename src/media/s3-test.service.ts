import { Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';

@Injectable()
export class S3TestService {
  constructor(private readonly s3Service: S3Service) {}

  async testS3Connection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Testing S3 connection...');
      
      // Test 1: Check basic S3 connectivity
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      if (!bucketName) {
        return {
          success: false,
          message: 'AWS_S3_BUCKET_NAME environment variable is not set',
        };
      }

      console.log(`📁 Using bucket: ${bucketName}`);

      // Test 2: Test file upload (mock file)
      const mockFile = {
        originalname: 'test-file.txt',
        buffer: Buffer.from('S3 connection test'),
        mimetype: 'text/plain',
        size: 20,
      };

      const uploadResult = await this.s3Service.uploadFile(mockFile, 'test');
      console.log('✅ File upload test successful');

      // Test 3: Test file URL generation
      const fileUrl = await this.s3Service.getFileUrl(uploadResult.key);
      console.log('✅ URL generation test successful');

      // Test 4: Clean up test file
      await this.s3Service.deleteFile(uploadResult.key);
      console.log('✅ File deletion test successful');

      return {
        success: true,
        message: 'All S3 tests passed successfully',
        details: {
          bucket: bucketName,
          region: process.env.AWS_REGION || 'eu-north-1',
          testFileKey: uploadResult.key,
          testFileUrl: fileUrl,
        },
      };
    } catch (error) {
      console.error('❌ S3 test failed:', error);
      return {
        success: false,
        message: `S3 test failed: ${error.message}`,
        details: error,
      };
    }
  }

  async getIAMRoleInfo(): Promise<{ message: string; role?: string; bucket?: string }> {
    const region = process.env.AWS_REGION || 'eu-north-1';
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const nodeEnv = process.env.NODE_ENV;

    return {
      message: `Running in ${nodeEnv || 'development'} mode with region: ${region}`,
      role: nodeEnv === 'production' ? 'IAM Role (automatic)' : 'Environment Variables',
      bucket: bucket,
    };
  }
}
