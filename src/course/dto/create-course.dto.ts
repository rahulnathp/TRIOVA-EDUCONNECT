import { IsString, IsNumber, IsOptional, IsObject, IsBoolean, Min, MaxLength } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MaxLength(255)
  collegeName: string;

  @IsString()
  @MaxLength(100)
  country: string;

  @IsString()
  @MaxLength(255)
  courseName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tuitionFees?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  livingExpenses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  duration?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  studyLevel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  intake?: string;

  @IsOptional()
  @IsObject()
  requirements?: {
    academic?: string;
    english?: string;
    other?: string;
  };

  @IsOptional()
  @IsObject()
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
