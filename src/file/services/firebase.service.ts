import { InternalServerErrorException } from "@nestjs/common";
import { File } from "file/entities/file.entity";
import { initializeApp } from "firebase-admin";
import { App } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import { IAppFilesStorageService } from "interfaces/app-files-storage-service.interface";

export class FirebaseService implements IAppFilesStorageService {

    private app: App;
    private storage: Storage;

    constructor() {
        const apiKey = process.env.FIREBASE_API_KEY;
        const authDomain = process.env.FIREBASE_AUTH_DOMAIN;
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
        const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
        const appId = process.env.FIREBASE_APP_ID;
        const measurementId = process.env.FIREBASE_MEASUREMENT_ID;

        const firebaseConfig = {
            apiKey: apiKey,
            authDomain: authDomain,
            projectId: projectId,
            storageBucket: storageBucket,
            messagingSenderId: messagingSenderId,
            appId: appId,
            measurementId: measurementId
        }
        this.app = initializeApp(firebaseConfig);
        this.storage = getStorage(this.app);
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