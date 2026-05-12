import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Compliance')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('disputes/:tokenId')
  @ApiOperation({ summary: 'Get disputes for a specific NFT token' })
  getDisputes(@Param('tokenId') tokenId: string) {
    return this.complianceService.getDisputes(tokenId);
  }

  @Get('mortgages/:tokenId')
  @ApiOperation({ summary: 'Get mortgages for a specific NFT token' })
  getMortgages(@Param('tokenId') tokenId: string) {
    return this.complianceService.getMortgages(tokenId);
  }

  @Get('planning-zones')
  @ApiOperation({ summary: 'Get all planning zones' })
  getPlanningZones() {
    return this.complianceService.getPlanningZones();
  }
}
