import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';

@Injectable()
export class FileService {

  constructor(
    @InjectRepository(File) private readonly fileRepository: Repository<File>
  ) { }

  create(createFileDto: CreateFileDto) {
    return this.fileRepository.save(createFileDto);
  }

  findAll() {
    return this.fileRepository.find();
  }

  findOne(id: number) {
    return this.fileRepository.findOneBy({ id });
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

  getDownloadLink() {
    // Placeholder implementation
  }

}
