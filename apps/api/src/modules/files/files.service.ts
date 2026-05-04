import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IPFS_CLIENT } from '../ipfs/ipfs.constants';
import { IpfsClient } from '../ipfs/ipfs.types';
import { LandFile } from '../database/entities/land-file.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @Inject(IPFS_CLIENT)
    private readonly ipfsClient: IpfsClient,
    @InjectRepository(LandFile)
    private readonly fileRepository: Repository<LandFile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    uploadedBy: number,
  ): Promise<LandFile> {
    this.logger.log(`Uploading file ${file.originalname} to IPFS...`);

    // 1. Upload to IPFS
    const uploadResult = await this.ipfsClient.upload({
      content: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });

    this.logger.log(
      `File ${file.originalname} uploaded to IPFS with CID: ${uploadResult.cid}`,
    );

    // 2. Save to database
    const landFile = this.fileRepository.create({
      fileName: file.originalname,
      fileType: file.mimetype.split('/')[1].toUpperCase(), // e.g. IMAGE/JPEG -> JPEG
      ipfsCid: uploadResult.cid,
      uploadedBy,
    });

    return this.fileRepository.save(landFile);
  }

  async getFileById(id: number): Promise<LandFile | null> {
    return this.fileRepository.findOne({
      where: { id },
      relations: ['record', 'uploader'],
    });
  }
}
