import { DataSourceOptions } from "typeorm";
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
import { SeederOptions } from "typeorm-extension";

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
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
    ],
    seeds: [
        
    ]
}