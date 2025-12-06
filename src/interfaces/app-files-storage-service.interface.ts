import { File } from "file/entities/file.entity";

export interface IAppFilesStorageService {
    downloadSignedUrl(file: File): Promise<string>;
    uploadSignedUrl(file: File): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
}