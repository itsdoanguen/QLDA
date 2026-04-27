import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class AuthLoginRequest {
  @ApiProperty({ example: '123456789012' })
  @IsString()
  @Matches(/^\d{12}$/, { message: 'nationalId must be 12 digits' })
  nationalId: string;
}

export class AuthLoginResponse {
  @ApiProperty()
  @IsString()
  challengeId: string;

  @ApiProperty()
  @IsString()
  expiresAt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  _testOtp?: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  person?: {
    nationalId: string;
    fullName: string;
    dateOfBirth: string;
  };
}

export class AuthVerifyOtpRequest {
  @ApiProperty()
  @IsString()
  challengeId: string;

  @ApiProperty()
  @IsString()
  @Length(6, 6)
  otp: string;
}

export class AuthVerifyOtpResponse {
  @ApiProperty()
  @IsString()
  accessToken: string;

  @ApiProperty()
  @IsString()
  tokenType: string;

  @ApiProperty()
  expiresIn: number;
}

export class AuthSendOtpRequest {
  @ApiProperty()
  @IsString()
  challengeId: string;
}

export class AuthSendOtpResponse {
  @ApiProperty()
  @IsString()
  challengeId: string;

  @ApiProperty()
  @IsString()
  expiresAt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  _testOtp?: string;

  @ApiProperty()
  @IsString()
  message: string;
}

export class AuthLogoutRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sandboxJti?: string;
}
