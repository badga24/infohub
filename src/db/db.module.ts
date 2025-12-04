import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { UserModule } from 'user/user.module';
import { SeedService } from './seed.service';

@Module({
    imports: [
        ConfigModule.forRoot({}),
        TypeOrmModule.forRoot(dataSourceOptions),
        UserModule,
    ],
    providers: [SeedService],
})
export class DbModule { }
