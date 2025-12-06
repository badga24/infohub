import { Injectable, Param } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { IAppFilesStorageService } from 'interfaces/app-files-storage-service.interface';
import { FirebaseService } from 'file/services/firebase.service';

@Injectable()
export class FileService {
  private app: IAppFilesStorageService;

  constructor(
    @InjectRepository(File) private readonly fileRepository: Repository<File>
  ) {
    const type = process.env.FILES_STORAGE_TYPE;
    if (type) {
      if (type === "firebase") {
        this.app = new FirebaseService()
        return;
      }
      throw new Error("Please set the necessary environment variables.");
    }
  }

  async getUploadSignedUrl(id: number) {
    const file = await this.findOne(id);
    return await this.app.uploadSignedUrl(file);
  }

  async getDownloadLink(id: number) {
    const file = await this.findOne(id);
    return await this.app.downloadSignedUrl(file);
  }

  create(createFileDto: CreateFileDto) {
    return this.fileRepository.save(createFileDto);
  }

  findAll() {
    return this.fileRepository.find();
  }

  async findOne(id: number) {
    const result = await this.fileRepository.findOneBy({ id });
    if(result === null) {
      throw new Error("File not found");
    }
    return result;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return this.fileRepository.update(id, updateFileDto);
  }

  remove(id: number) {
    return this.fileRepository.delete(id);
  }

  confirmUpload(id: number) {
    return this.fileRepository.update(id, { isUploaded: true });
  }

}
