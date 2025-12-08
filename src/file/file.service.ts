import { Injectable, Param } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { IAppFilesStorageService } from 'interfaces/app-files-storage-service.interface';
import { FirebaseService } from 'file/services/firebase.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  private app: IAppFilesStorageService;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(File) private readonly fileRepository: Repository<File>
  ) {
    const type = process.env.FILES_STORAGE_TYPE;
    if (type) {
      if (type === "firebase") {
        this.app = new FirebaseService(
          this.config.get<string>('FIREBASE_TYPE') ?? "",
          this.config.get<string>('FIREBASE_PROJECT_ID') ?? "",
          this.config.get<string>('FIREBASE_PRIVATE_KEY_ID') ?? "",
          this.config.get<string>('FIREBASE_PRIVATE_KEY') ?? "",
          this.config.get<string>('FIREBASE_CLIENT_EMAIL') ?? "",
          this.config.get<string>('FIREBASE_CLIENT_ID') ?? "",
          this.config.get<string>('FIREBASE_AUTH_URI') ?? "",
          this.config.get<string>('FIREBASE_TOKEN_URI') ?? "",
          this.config.get<string>('FIREBASE_AUTH_PROVIDER_X509_CERT_URL') ?? "",
          this.config.get<string>('FIREBASE_CLIENT_X509_CERT_URL') ?? "",
          this.config.get<string>('FIREBASE_UNIVERSE_DOMAIN') ?? "",
          this.config.get<string>('FIREBASE_STORAGE_BUCKET_NAME') ?? "",
        )
        return;
      }
      throw new Error("Please set the necessary environment variables.");
    }
  }

  async getUploadSignedUrl(id: number) {
    const file = await this.findOneNotUploaded(id);
    return await this.app.uploadSignedUrl(file);
  }

  async getDownloadLink(id: number) {
    const file = await this.findOneUploaded(id);
    return await this.app.downloadSignedUrl(file);
  }

  create(partialPath: string, createFileDto: CreateFileDto) {
    return this.fileRepository.save({
      ...createFileDto,
      partialPath: partialPath,
    });
  }

  findAll() {
    return this.fileRepository.find();
  }

  async findOneNotUploaded(id: number) {
    const result = await this.fileRepository.findOneBy({ id, isUploaded: false });
    if (result === null) {
      throw new Error("File not found or not uploaded yet");
    }
    return result;
  }

  async findOneUploaded(id: number) {
    const result = await this.fileRepository.findOneBy({ id, isUploaded: true });
    if (result === null) {
      throw new Error("File not found or already uploaded");
    }
    return result;
  }

  async findOne(id: number) {
    const result = await this.fileRepository.findOneBy({ id });
    if (result === null) {
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
