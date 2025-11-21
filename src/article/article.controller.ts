import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CategoryService } from 'src/category/category.service';
import { PersonService } from 'src/person/person.service';
import { ICreateArticle } from './interfaces/create-article.interface';

@Controller('article')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly categoryService: CategoryService,
    private readonly personService: PersonService
  ) { }

  @Post()
  async create(@Body() createArticleDto: CreateArticleDto) {
    const author = await this.personService.findOne(createArticleDto.author);
    const categories = await Promise.all(
      createArticleDto.categories.map(async category => await this.categoryService.findOrCreate(category))
    );

    const articleData: ICreateArticle = {
      title: createArticleDto.title,
      content: createArticleDto.content,
      categories,
      author: author!
    }

    return this.articleService.create(articleData);
  }

  @Get()
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.articleService.findAll(
      page ? +page : 1,
      limit ? +limit : 10
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(+id, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(+id);
  }
}
