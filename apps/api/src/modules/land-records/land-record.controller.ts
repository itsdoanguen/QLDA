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

@ApiTags('Land Records')
@ApiBearerAuth()
@UseGuards(AuthGuard)
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

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific land record' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.landRecordService.findOne(id);
  }
}
