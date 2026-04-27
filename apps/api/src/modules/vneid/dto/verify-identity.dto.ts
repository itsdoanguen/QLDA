import { IsOptional, IsString, Matches } from 'class-validator';

export class VerifyIdentityDto {
  @IsString()
  @Matches(/^\d{12}$/)
  cccd!: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
