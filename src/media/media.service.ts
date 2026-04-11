import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brochure, Banner } from './media.entity';
import { S3Service } from './s3.service';
import { CacheService } from './cache.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Brochure)
    private readonly brochureRepository: Repository<Brochure>,
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    private readonly s3Service: S3Service,
    private readonly cacheService: CacheService,
  ) {}

  // Brochure Operations
  async uploadBrochure(file: any, uploadBrochureDto: any): Promise<Brochure> {
    // Upload to S3
    const s3Result = await this.s3Service.uploadFile(file, 'brochures');
    
    // Generate signed URL for immediate access
    const signedUrl = await this.s3Service.getPublicUrl(s3Result.key);
    
    // Save to database
    const brochure = this.brochureRepository.create({
      title: uploadBrochureDto.title,
      description: uploadBrochureDto.description || '',
      fileName: file.originalname,
      s3Key: s3Result.key,
      s3Url: signedUrl, // Use signed URL instead of direct URL
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    const savedBrochure = await this.brochureRepository.save(brochure);
    
    // Comprehensive cache invalidation after upload
    this.cacheService.invalidate('brochures:all');
    this.cacheService.invalidatePattern('brochures');
    console.log('🗑️ Brochure cache invalidated after upload');
    
    return savedBrochure;
  }

  async getAllBrochures(): Promise<Brochure[]> {
    const cacheKey = 'brochures:all';
    
    // Try to get from cache first
    const cachedBrochures = this.cacheService.get<Brochure[]>(cacheKey);
    if (cachedBrochures) {
      console.log('📦 Serving brochures from cache');
      return cachedBrochures;
    }
    
    // Fetch from database
    const brochures = await this.brochureRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
    
    // Cache for 50 minutes
    this.cacheService.set(cacheKey, brochures, 50);
    console.log('🔄 Fetched brochures from database and cached');
    
    return brochures;
  }

  async getBrochureById(id: string): Promise<Brochure | null> {
    return await this.brochureRepository.findOne({ where: { id } });
  }

  async updateBrochure(id: string, updateData: any): Promise<Brochure | null> {
    await this.brochureRepository.update(id, updateData);
    
    // Invalidate cache after update
    this.cacheService.invalidate('brochures:all');
    console.log('🗑️ Brochure cache invalidated');
    
    return await this.getBrochureById(id);
  }

  async deleteBrochure(id: string): Promise<boolean> {
    const brochure = await this.getBrochureById(id);
    if (!brochure) {
      return false;
    }

    // Delete from S3
    await this.s3Service.deleteFile(brochure.s3Key);
    
    // Delete from database
    const result = await this.brochureRepository.delete(id);
    
    // Invalidate cache after deletion
    this.cacheService.invalidate('brochures:all');
    console.log('🗑️ Brochure cache invalidated');
    
    return result.affected > 0;
  }

  // Banner Operations
  async uploadBanner(file: any, uploadBannerDto: any): Promise<Banner> {
    // Upload to S3
    const s3Result = await this.s3Service.uploadFile(file, 'banners');
    
    // Generate signed URL for immediate access
    const signedUrl = await this.s3Service.getPublicUrl(s3Result.key);
    
    // Save to database
    const banner = this.bannerRepository.create({
      title: uploadBannerDto.title,
      description: uploadBannerDto.description || '',
      fileName: file.originalname,
      s3Key: s3Result.key,
      s3Url: signedUrl, // Use signed URL instead of direct URL
      fileSize: file.size,
      mimeType: file.mimetype,
      displayOrder: uploadBannerDto.displayOrder || 0,
      startDate: uploadBannerDto.startDate,
      endDate: uploadBannerDto.endDate,
    });

    const savedBanner = await this.bannerRepository.save(banner);
    
    // Comprehensive cache invalidation after upload
    this.cacheService.invalidate('banners:all');
    this.cacheService.invalidate('banners:current');
    this.cacheService.invalidatePattern('banners');
    console.log('🗑️ Banner cache invalidated after upload');
    
    return savedBanner;
  }

  async getActiveBanner(): Promise<Banner | null> {
    const now = new Date();
    
    return await this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.isActive = :isActive', { isActive: true })
      .andWhere('(banner.startDate IS NULL OR banner.startDate <= :now)', { now })
      .andWhere('(banner.endDate IS NULL OR banner.endDate >= :now)', { now })
      .orderBy('banner.displayOrder', 'ASC')
      .addOrderBy('banner.createdAt', 'DESC')
      .getOne();
  }

  async getAllBanners(): Promise<Banner[]> {
    const cacheKey = 'banners:all';
    
    // Try to get from cache first
    const cachedBanners = this.cacheService.get<Banner[]>(cacheKey);
    if (cachedBanners) {
      console.log('📦 Serving banners from cache');
      return cachedBanners;
    }
    
    // Fetch from database
    const banners = await this.bannerRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
    
    // Cache for 50 minutes
    this.cacheService.set(cacheKey, banners, 50);
    console.log('🔄 Fetched banners from database and cached');
    
    return banners;
  }

  async getBannerById(id: string): Promise<Banner | null> {
    return await this.bannerRepository.findOne({ where: { id } });
  }

  async updateBanner(id: string, updateData: any): Promise<Banner | null> {
    await this.bannerRepository.update(id, updateData);
    
    // Invalidate cache after update
    this.cacheService.invalidate('banners:all');
    this.cacheService.invalidate('banners:current');
    console.log('🗑️ Banner cache invalidated');
    
    return await this.getBannerById(id);
  }

  async deleteBanner(id: string): Promise<boolean> {
    const banner = await this.getBannerById(id);
    if (!banner) {
      return false;
    }

    // Delete from S3
    await this.s3Service.deleteFile(banner.s3Key);
    
    // Delete from database
    const result = await this.bannerRepository.delete(id);
    
    // Invalidate cache after deletion
    this.cacheService.invalidate('banners:all');
    this.cacheService.invalidate('banners:current');
    console.log('🗑️ Banner cache invalidated');
    
    return result.affected > 0;
  }

  // Utility method to get current active banner (for rotation)
  async getCurrentBanner(): Promise<{ banner: Banner | null; nextRotation?: Date } | null> {
    const cacheKey = 'banners:current';
    
    // Try to get from cache first
    const cachedCurrentBanner = this.cacheService.get<{ banner: Banner | null; nextRotation?: Date; timestamp: number }>(cacheKey);
    
    // Check if cache exists and is less than 1 hour old
    if (cachedCurrentBanner && cachedCurrentBanner.timestamp) {
      const cacheAge = Date.now() - cachedCurrentBanner.timestamp;
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      
      if (cacheAge < oneHour) {
        console.log(`📦 Serving current banner from cache (${Math.round(cacheAge / (60 * 1000))} minutes old)`);
        return {
          banner: cachedCurrentBanner.banner,
          nextRotation: cachedCurrentBanner.nextRotation,
        };
      } else {
        console.log('⏰ Current banner cache expired (> 1 hour)');
        this.cacheService.invalidate(cacheKey);
      }
    }
    
    const activeBanner = await this.getActiveBanner();
    
    // Always return a response structure, even if no banner
    let nextRotation;
    if (activeBanner && activeBanner.endDate) {
      nextRotation = activeBanner.endDate;
    }

    const result = {
      banner: activeBanner,
      nextRotation: nextRotation,
      timestamp: Date.now(), // Add timestamp for age tracking
    };
    
    // Cache for 1 hour maximum
    this.cacheService.set(cacheKey, result, 60);
    console.log('🔄 Fetched current banner from database and cached (1 hour max)');

    return result;
  }
}
