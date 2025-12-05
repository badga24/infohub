import { Injectable } from '@nestjs/common';
import { UpdatePersonDto } from './dto/update-person.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { Repository } from 'typeorm';
import { IPage } from 'interfaces/page.interface';
import { CreatePersonDto } from 'dto/request/create-person.dto';

@Injectable()
export class PersonService {

  constructor(
    @InjectRepository(Person) private readonly personRepository: Repository<Person>
  ) { }

  create(createPersonDto: CreatePersonDto) {
    return this.personRepository.save(createPersonDto);
  }

  findAll() {
    return this.personRepository.find();
  }

  findOne(id: number) {
    const entity = this.personRepository.findOneBy({ id });
    if (entity === null || entity === undefined) {
      throw new Error(`Person with id ${id} not found`);
    }
    return entity;
  }

  update(id: number, updatePersonDto: UpdatePersonDto) {
    return this.personRepository.update(id, updatePersonDto);
  }

  remove(id: number) {
    return this.personRepository.delete(id);
  }

  async search(query: string, page: number = 1, limit: number = 10): Promise<IPage<Person>> {
    const [results, total] = await this.personRepository
      .createQueryBuilder('person')
      .where('LOWER(person.firstName) LIKE :query', { query: `%${query.toLowerCase()}%` })
      .orWhere('LOWER(person.lastName) LIKE :query', { query: `%${query.toLowerCase()}%` })
      .orWhere('LOWER(person.email) LIKE :query', { query: `%${query.toLowerCase()}%` })
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
