import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { LandRecordService } from './land-record.service';
import { CreateLandRecordDto } from './dto/create-land-record.dto';
import { UpdateLandRecordDto } from './dto/update-land-record.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReviewLandRecordDto, UpdateGpsDto } from './dto/review-land-record.dto';

@ApiTags('Land Records')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('land-records')
export class LandRecordController {
  constructor(private readonly landRecordService: LandRecordService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new land record draft' })
  createDraft(@CurrentUser() user: any, @Body() dto: CreateLandRecordDto) {
    return this.landRecordService.createDraft(user.sub, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a land record draft' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: UpdateLandRecordDto,
  ) {
    return this.landRecordService.update(id, user.sub, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit land record for review and assign random staff' })
  submit(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.landRecordService.submit(id, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all land records of current user' })
  findAll(@CurrentUser() user: any) {
    return this.landRecordService.findAll(user.sub);
  }

  @Get('all')
  @RequireRoles('LANH_DAO', 'CAN_BO', 'ADMIN')
  @ApiOperation({ summary: 'Get all land records in the system' })
  findAllSystem() {
    return this.landRecordService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific land record' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.landRecordService.findOne(id);
  }

  @Get(':id/gps')
  @ApiOperation({ summary: 'Get GPS coordinates of a specific land record' })
  getGps(@Param('id', ParseIntPipe) id: number) {
    return this.landRecordService.getGps(id);
  }

  // Staff endpoints
  @Get('staff/tasks')
  @RequireRoles('CAN_BO')
  @ApiOperation({ summary: 'Get land records assigned to current staff' })
  getTasks(@CurrentUser() user: any) {
    return this.landRecordService.findAssignedRecords(user.sub);
  }

  @Get('staff/stats')
  @RequireRoles('CAN_BO')
  @ApiOperation({ summary: 'Get stats for land records assigned to current staff' })
  getStats(@CurrentUser() user: any) {
    return this.landRecordService.getStaffStats(user.sub);
  }

  @Post(':id/review')
  @RequireRoles('CAN_BO')
  @ApiOperation({ summary: 'Approve land record and freeze it' })
  review(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: ReviewLandRecordDto,
  ) {
    return this.landRecordService.review(id, user.sub, dto);
  }

  @Post(':id/reject')
  @RequireRoles('CAN_BO')
  @ApiOperation({ summary: 'Reject land record with reason' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: ReviewLandRecordDto,
  ) {
    return this.landRecordService.reject(id, user.sub, dto);
  }

  @Post(':id/request-supplement')
  @RequireRoles('CAN_BO')
  @ApiOperation({ summary: 'Request supplement for land record' })
  requestSupplement(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: ReviewLandRecordDto,
  ) {
    return this.landRecordService.requestSupplement(id, user.sub, dto);
  }

  @Put(':id/update-gps')
  @RequireRoles('CAN_BO')
  @ApiOperation({ summary: 'Update GPS coordinates for land record' })
  updateGps(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: UpdateGpsDto,
  ) {
    return this.landRecordService.updateGps(id, user.sub, dto);
  }
}
