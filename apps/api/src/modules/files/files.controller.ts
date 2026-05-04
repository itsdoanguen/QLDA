import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';

import { FilesService } from './files.service';
import { AuthGuard } from '../auth/auth.guard';
import { LandFileResponse } from '@land-registry/shared-types';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file to IPFS' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: LandFileResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)

  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file size (e.g. 5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File size too large (max 5MB)');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, and PDF are allowed.');
    }

    const userId = req.user.sub;
    const result = await this.filesService.uploadFile(file, userId);

    return {
      id: result.id,
      fileName: result.fileName,
      fileType: result.fileType,
      ipfsCid: result.ipfsCid,
      recordId: result.recordId,
      createdAt: result.createdAt.toISOString(),
    };
  }
}

