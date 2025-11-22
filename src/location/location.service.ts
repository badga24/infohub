import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { IPage } from 'interfaces/page.interface';

@Injectable()
export class LocationService {

  constructor(
    @InjectRepository(Location) private readonly locationRepository: Repository<Location>
  ) {}

  create(createLocationDto: CreateLocationDto) {
    return this.locationRepository.save(createLocationDto);
  }

  async search(query: string, page: number = 1, limit: number = 10): Promise<IPage<Location>> {
    
    const [results, total] = await this.locationRepository
      .createQueryBuilder('location')
      .where('LOWER(location.address) LIKE :query', { query: `%${query.toLowerCase()}%` })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

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

  findAll() {
    return this.locationRepository.find();
  }

  findOne(id: number) {
    const result = this.locationRepository.findOne({
      where: { id },
      relations: ['events'],
    });
    if (!result) {
      throw new Error(`Location with ID ${id} not found`);
    }
    return result;
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    return this.locationRepository.update(id, updateLocationDto);
  }

  remove(id: number) {
    return this.locationRepository.delete(id);
  }
}
