import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  UseGuards, 
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';

@ApiTags('Staff')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @RequireRoles('ADMIN')
  @ApiOperation({ summary: 'Create a new staff account (Admin only)' })
  create(@Body() data: any) {
    return this.staffService.createStaff(data);
  }

  @Get()
  @RequireRoles('ADMIN')
  @ApiOperation({ summary: 'List all staff (Admin only)' })
  findAll(@Query() filters: any) {
    return this.staffService.listStaff(filters);
  }

  @Patch(':id/deactivate')
  @RequireRoles('ADMIN')
  @ApiOperation({ summary: 'Deactivate a staff account (Admin only)' })
  deactivate(@Param('id') id: number) {
    return this.staffService.deactivateStaff(id);
  }

  @Get(':id')
  @RequireRoles('ADMIN')
  @ApiOperation({ summary: 'Get staff details (Admin only)' })
  findOne(@Param('id') id: number) {
    return this.staffService.getStaffById(id);
  }
}
