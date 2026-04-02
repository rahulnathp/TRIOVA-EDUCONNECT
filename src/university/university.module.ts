import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniversityController } from './university.controller';
import { UniversityService } from './university.service';
import { University } from './university.entity';

@Module({
  imports: [TypeOrmModule.forFeature([University])],
  controllers: [UniversityController],
  providers: [UniversityService],
  exports: [UniversityService],
})
export class UniversityModule {}
