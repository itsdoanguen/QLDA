import { IsString, Matches } from 'class-validator';

export class DuplicateCheckDto {
  @IsString()
  @Matches(/^\d{12}$/)
  cccd!: string;
}
