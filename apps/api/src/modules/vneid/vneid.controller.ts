import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { DuplicateCheckDto } from './dto/duplicate-check.dto';
import { VerifyIdentityDto } from './dto/verify-identity.dto';
import { VneidService } from './vneid.service';

@Controller('vneid/mock')
export class VneidController {
  constructor(private readonly vneidService: VneidService) {}

  @Post('verify-identity')
  verifyIdentity(@Body() dto: VerifyIdentityDto): {
    cccd: string;
    isValid: boolean;
    matchScore: number;
    reason?: string;
  } {
    return this.vneidService.verifyIdentity(dto.cccd, dto.fullName);
  }

  @Post('duplicate-check')
  duplicateCheck(@Body() dto: DuplicateCheckDto): { cccd: string; isDuplicate: boolean } {
    return this.vneidService.checkDuplicate(dto.cccd);
  }

  @Get('profile/:cccd')
  getProfile(@Param('cccd') cccd: string): {
    cccd: string;
    fullName: string;
    dob: string;
    address: string;
  } {
    return this.vneidService.getProfile(cccd);
  }
}
