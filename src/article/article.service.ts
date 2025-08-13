import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';
import { ICreateArticle } from './interfaces/create-article.interface';
import { IUpdateArticle } from './interfaces/update-article.interface';

@Injectable()
export class ArticleService {

  constructor(
    @InjectRepository(Article) private readonly articleRepository: Repository<Article>
  ) { }

  create(createArticle: ICreateArticle) {
    return this.articleRepository.save(createArticle);
  }

  findAll() {
    return this.articleRepository.find();
  }

  findOne(id: number) {
    return this.articleRepository.findOne({
      where: { id }, relations: {
        categories: true,
        author: true
      }
    });
  }

  update(id: number, updateArticle: IUpdateArticle) {
    return this.articleRepository.update(id, updateArticle);
  }

  remove(id: number) {
    return this.articleRepository.delete(id);
  }
}
