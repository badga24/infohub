import { Injectable } from "@nestjs/common";
import { CreateFileDto } from "file/dto/create-file.dto";
import { FileService } from "file/file.service";

@Injectable()
export class FileUseCase {
    constructor(
                private readonly fileService: FileService,
    ) {}


    create(partialPath: string, dto: CreateFileDto) {
        return this.fileService.create(partialPath, dto);
    }

    getUploadSignedUrl(id: number) {
        return this.fileService.getUploadSignedUrl(id);
    }

    getDownloadUrl(id: number) {
        return this.fileService.getDownloadLink(id);
    }

    confirmUpload(id: number) {
        return this.fileService.confirmUpload(id);
    }

}