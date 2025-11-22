import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';
import { ICreateArticle } from './interfaces/create-article.interface';
import { IUpdateArticle } from './interfaces/update-article.interface';
import { IPage } from 'interfaces/page.interface';

@Injectable()
export class ArticleService {

  constructor(
    @InjectRepository(Article) private readonly articleRepository: Repository<Article>
  ) { }

  create(createArticle: ICreateArticle) {
    return this.articleRepository.save(createArticle);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<IPage<any>> {
    const [results, total] = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.categories', 'categories')
      .leftJoinAndSelect('article.author', 'author')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    }
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
