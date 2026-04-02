import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUniversityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}
