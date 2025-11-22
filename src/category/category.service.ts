import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { IPage } from 'interfaces/page.interface';

@Injectable()
export class CategoryService {

  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.categoryRepository.save(createCategoryDto);
  }

  async findOrCreate(createCategoryDto: CreateCategoryDto) {
    return this.categoryRepository.findOne({ where: { name: createCategoryDto.name } })
      .then(category => {
        if (category) {
          return category;
        }
        return this.categoryRepository.save(createCategoryDto);
      });
  }

  findAll() {
    return this.categoryRepository.find();
  }

  findOne(id: number) {
    return this.categoryRepository.findOneBy({ id });
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.categoryRepository.update(id, updateCategoryDto);
  }

  remove(id: number) {
    return this.categoryRepository.delete(id);
  }

  async search(query: string, page: number = 1, limit: number = 10): Promise<IPage<Category>> {
    const [results, total] = await this.categoryRepository
      .createQueryBuilder('category')
      .where('LOWER(category.name) LIKE :query', { query: `%${query.toLowerCase()}%` })
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
    };
  }
  
}
