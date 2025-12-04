import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { CategoryModule } from 'category/category.module';
import { PersonModule } from 'person/person.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), CategoryModule, PersonModule],
  controllers: [],
  providers: [ArticleService],
})
export class ArticleModule {}
