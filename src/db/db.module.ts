import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { UserModule } from 'user/user.module';
import { SeedService } from './seed.service';

import { Article } from 'article/entities/article.entity';
import { Category } from 'category/entities/category.entity';
import { Event } from 'event/entities/event.entity';
import { File } from 'file/entities/file.entity';
import { Location } from 'location/entities/location.entity';
import { Person } from 'person/entities/person.entity';
import { Topic } from 'topic/entities/topic.entity';
import { User } from 'user/entities/user.entity';
import { UserRole } from "user/entities/role.entity";
import { Permission } from "user/entities/permission.entity";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT!, 10),
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            synchronize: process.env.NODE_ENV !== 'production',
            entities: [
                Person,
                Category,
                Article,
                Location,
                Topic,
                Event,
                File,
                User,
                UserRole,
                Permission
            ]
        }),
        UserModule,
    ],
    providers: [SeedService],
})
export class DbModule { }
