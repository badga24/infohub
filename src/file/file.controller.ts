import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Get(':id/download')
  getDownloadLink(@Param('id') id: number) {
    return this.fileService.getDownloadLink(id);
  }

  @Get(':id/upload')
  getUploadSignedUrl(@Param('id') id: number) {
    return this.fileService.getUploadSignedUrl(id);
  }

}
