import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SystemConfigService } from './system-config.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('System Config')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  @Get()
  @RequireRoles('ADMIN', 'LANH_DAO', 'CAN_BO')
  @ApiOperation({ summary: 'Get all system configs' })
  getAll() {
    return this.configService.getAll();
  }

  @Get('audits')
  @RequireRoles('ADMIN', 'LANH_DAO')
  @ApiOperation({ summary: 'Get audit logs for config changes' })
  getAudits() {
    return this.configService.getAudits();
  }

  @Post(':key')
  @RequireRoles('ADMIN', 'LANH_DAO')
  @ApiOperation({ summary: 'Update a system config value' })
  updateConfig(
    @Param('key') key: string,
    @Body('value') value: string,
    @CurrentUser() user: any,
  ) {
    return this.configService.updateConfig(key, value, user.sub);
  }
}
