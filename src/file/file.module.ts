import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [],
  providers: [FileService],
})
export class FileModule { }
