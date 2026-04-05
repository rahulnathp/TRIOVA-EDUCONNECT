import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UploadBrochureDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  tags?: string;
}

export class UpdateBrochureDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsOptional()
  isActive?: boolean;
}
