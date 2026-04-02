import { IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';

export class AddCourseDto {
  @IsString()
  @MaxLength(255)
  collegeName: string;

  @IsString()
  @MaxLength(100)
  country: string;

  @IsString()
  @MaxLength(255)
  courseName: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsNumber()
  @Min(0)
  tuitionFees: number;

  @IsNumber()
  @Min(0)
  seatsAvailable: number;
}
