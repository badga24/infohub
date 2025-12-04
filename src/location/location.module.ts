import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  controllers: [],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
