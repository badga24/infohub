import { InternalServerErrorException } from "@nestjs/common";
import { File } from "file/entities/file.entity";
import * as admin from "firebase-admin";
import { App } from "firebase-admin/app";
import { Storage } from "firebase-admin/storage";
import { IAppFilesStorageService } from "interfaces/app-files-storage-service.interface";

export class FirebaseService implements IAppFilesStorageService {

    private app: App;
    private storage: Storage;

    constructor(
        private readonly type: string,
        private readonly projectId: string,
        private readonly privateKeyId: string,
        private readonly privateKey: string,
        private readonly clientEmail: string,
        private readonly clientId: string,
        private readonly authUri: string,
        private readonly tokenUri: string,
        private readonly authProviderX509CertUrl: string,
        private readonly clientX509CertUrl: string,
        private readonly universeDomain: string,
        private readonly storageBucket: string,
    ) {
        const config = {
            type: this.type,
            projectId: this.projectId,
            privateKeyId: this.privateKeyId,
            privateKey: this.privateKey?.replace(/\\n/g, '\n'),
            clientEmail: this.clientEmail,
            clientId: this.clientId,
            authUri: this.authUri,
            tokenUri: this.tokenUri,
            authProviderX509CertUrl: this.authProviderX509CertUrl,
            clientX509CertUrl: this.clientX509CertUrl,
            universeDomain: this.universeDomain,
        } as admin.ServiceAccount
        const firebaseConfig = {
            credential: admin.credential.cert(config),
            storageBucket: this.storageBucket,
        }
        this.app = admin.initializeApp(firebaseConfig);
        this.storage = admin.storage(this.app);
    }

    async downloadSignedUrl(file: File): Promise<string> {
        try {
            const result = await this.storage.bucket().file(file.getPath()).getSignedUrl({
                action: 'read',
                expires: Date.now() + (Number(process.env.FILES_STORAGE_TTL_IN_SECONDS) ?? 3600),
            });
            return result[0];
        } catch (error) {
            throw new InternalServerErrorException("Error generating signed URL: " + error);
        }
    }

    async uploadSignedUrl(file: File): Promise<string> {
        try {
            const result = await this.storage.bucket().file(file.getPath()).getSignedUrl({
                action: 'write',
                expires: Date.now() + (Number(process.env.FILES_STORAGE_TTL_IN_SECONDS) ?? 3600),
                contentType: file.contentType,
            });
            return result[0];
        } catch (error) {
            throw new InternalServerErrorException("Error generating signed URL: " + error);
        }
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            await this.storage.bucket().file(filePath).delete();
        } catch (error) {
            throw new InternalServerErrorException("Error deleting file: " + error);
        }
    }
}