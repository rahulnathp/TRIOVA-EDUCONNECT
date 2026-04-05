import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { S3Service } from './s3.service';
import { S3TestService } from './s3-test.service';
import { CacheService } from './cache.service';
import { UploadBrochureDto, UpdateBrochureDto } from './dto/upload-brochure.dto';
import { UploadBannerDto, UpdateBannerDto } from './dto/upload-banner.dto';

interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly s3Service: S3Service,
    private readonly s3TestService: S3TestService,
    private readonly cacheService: CacheService,
  ) {}

  // Brochure Endpoints
  @Post('brochures')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBrochure(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB max
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|pdf)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: UploadedFileType,
    @Body() uploadBrochureDto: UploadBrochureDto,
  ) {
    try {
      const brochure = await this.mediaService.uploadBrochure(file, uploadBrochureDto);
      return {
        success: true,
        message: 'Brochure uploaded successfully',
        data: brochure,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Get('brochures')
  async getAllBrochures() {
    try {
      const brochures = await this.mediaService.getAllBrochures();
      return {
        success: true,
        message: 'Brochures retrieved successfully',
        data: brochures,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Get('brochures/:id')
  async getBrochureById(@Param('id') id: string) {
    try {
      const brochure = await this.mediaService.getBrochureById(id);
      if (!brochure) {
        return {
          success: false,
          message: 'Brochure not found',
          data: null,
        };
      }
      return {
        success: true,
        message: 'Brochure retrieved successfully',
        data: brochure,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Put('brochures/:id')
  async updateBrochure(
    @Param('id') id: string,
    @Body() updateData: UpdateBrochureDto,
  ) {
    try {
      const brochure = await this.mediaService.updateBrochure(id, updateData);
      if (!brochure) {
        return {
          success: false,
          message: 'Brochure not found',
          data: null,
        };
      }
      return {
        success: true,
        message: 'Brochure updated successfully',
        data: brochure,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Delete('brochures/:id')
  async deleteBrochure(@Param('id') id: string) {
    try {
      const success = await this.mediaService.deleteBrochure(id);
      return {
        success,
        message: success ? 'Brochure deleted successfully' : 'Brochure not found',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // Banner Endpoints
  @Post('banners')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBanner(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max for banners
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: UploadedFileType,
    @Body() uploadBannerDto: UploadBannerDto,
  ) {
    try {
      const banner = await this.mediaService.uploadBanner(file, uploadBannerDto);
      return {
        success: true,
        message: 'Banner uploaded successfully',
        data: banner,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Get('banners/current')
  async getCurrentBanner() {
    try {
      const currentBanner = await this.mediaService.getCurrentBanner();
      return {
        success: true,
        message: 'Current banner retrieved successfully',
        data: currentBanner,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Get('banners')
  async getAllBanners() {
    try {
      const banners = await this.mediaService.getAllBanners();
      return {
        success: true,
        message: 'Banners retrieved successfully',
        data: banners,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Get('banners/:id')
  async getBannerById(@Param('id') id: string) {
    try {
      const banner = await this.mediaService.getBannerById(id);
      if (!banner) {
        return {
          success: false,
          message: 'Banner not found',
          data: null,
        };
      }
      return {
        success: true,
        message: 'Banner retrieved successfully',
        data: banner,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Put('banners/:id')
  async updateBanner(
    @Param('id') id: string,
    @Body() updateData: UpdateBannerDto,
  ) {
    try {
      const banner = await this.mediaService.updateBanner(id, updateData);
      if (!banner) {
        return {
          success: false,
          message: 'Banner not found',
          data: null,
        };
      }
      return {
        success: true,
        message: 'Banner updated successfully',
        data: banner,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Delete('banners/:id')
  async deleteBanner(@Param('id') id: string) {
    try {
      const success = await this.mediaService.deleteBanner(id);
      return {
        success,
        message: success ? 'Banner deleted successfully' : 'Banner not found',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // S3 Testing Endpoints
  @Get('s3/test')
  async testS3Connection() {
    try {
      const result = await this.s3TestService.testS3Connection();
      return result;
    } catch (error) {
      return {
        success: false,
        message: `S3 test failed: ${error.message}`,
        data: null,
      };
    }
  }

  @Get('s3/info')
  async getS3Info() {
    try {
      const info = await this.s3TestService.getIAMRoleInfo();
      return {
        success: true,
        message: 'S3 configuration retrieved successfully',
        data: info,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get S3 info: ${error.message}`,
        data: null,
      };
    }
  }

  @Get('s3/diagnose')
  async diagnoseS3Permissions() {
    try {
      const diagnosis = await this.s3Service.diagnoseS3Permissions();
      return {
        success: diagnosis.success,
        message: diagnosis.success ? 'S3 permissions are correct' : 'S3 permissions need fixing',
        data: diagnosis.details,
      };
    } catch (error) {
      return {
        success: false,
        message: `S3 diagnosis failed: ${error.message}`,
        data: null,
      };
    }
  }

  // Cache Management Endpoints
  @Get('cache/stats')
  async getCacheStats() {
    try {
      const stats = this.cacheService.getCacheStats();
      return {
        success: true,
        message: 'Cache statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get cache stats: ${error.message}`,
        data: null,
      };
    }
  }

  @Post('cache/clear')
  async clearCache() {
    try {
      this.cacheService.clear();
      return {
        success: true,
        message: 'All cache cleared successfully',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to clear cache: ${error.message}`,
        data: null,
      };
    }
  }

  @Post('cache/invalidate/brochures')
  async invalidateBrochureCache() {
    try {
      this.cacheService.invalidatePattern('brochures');
      return {
        success: true,
        message: 'Brochure cache invalidated successfully',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to invalidate brochure cache: ${error.message}`,
        data: null,
      };
    }
  }

  @Post('cache/invalidate/banners')
  async invalidateBannerCache() {
    try {
      this.cacheService.invalidatePattern('banners');
      return {
        success: true,
        message: 'Banner cache invalidated successfully',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to invalidate banner cache: ${error.message}`,
        data: null,
      };
    }
  }
}
