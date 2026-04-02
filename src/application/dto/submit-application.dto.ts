import { IsString, IsOptional, IsEmail } from 'class-validator';

export class SubmitApplicationDto {
  @IsString()
  studentName: string;

  @IsEmail()
  studentEmail: string;

  @IsString()
  mobileNumber: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  courseId: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
