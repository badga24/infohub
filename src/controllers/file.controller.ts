import { Controller, Get, Param, Put } from "@nestjs/common";
import { FileUseCase } from "use-case/file.use-case";

@Controller("file")
export class FileController {

    constructor(
        private readonly fileUseCase: FileUseCase,
    ) {}

    @Get(":id/upload-url")
    getUploadSignedUrl(@Param("id") id: number) {
        return this.fileUseCase.getUploadSignedUrl(id);
    }

    @Get(":id/download-url")
    getDownloadUrl(@Param("id") id: number) {
        return this.fileUseCase.getDownloadUrl(id);
    }

    @Put(":id/confirm-upload")
    confirmUpload(@Param("id") id: number) {
        return this.fileUseCase.confirmUpload(id);
    }

}