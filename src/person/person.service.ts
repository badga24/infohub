import { Injectable } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PersonService {

  constructor(
    @InjectRepository(Person) private readonly personRepository: Repository<Person>
  ) {}

  create(createPersonDto: CreatePersonDto) {
    return this.personRepository.save(createPersonDto);
  }

  findAll() {
    return this.personRepository.find();
  }

  findOne(id: number) {
    return this.personRepository.findOneBy({ id });
  }

  update(id: number, updatePersonDto: UpdatePersonDto) {
    return this.personRepository.update(id, updatePersonDto);
  }

  remove(id: number) {
    return this.personRepository.delete(id);
  }
}
