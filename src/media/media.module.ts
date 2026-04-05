import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { S3Service } from './s3.service';
import { S3TestService } from './s3-test.service';
import { CacheService } from './cache.service';
import { Brochure, Banner } from './media.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brochure, Banner]),
  ],
  controllers: [MediaController],
  providers: [MediaService, S3Service, S3TestService, CacheService],
  exports: [MediaService, S3Service, CacheService],
})
export class MediaModule {}
