import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from 'dto/request';
import { UserRole } from './entities/role.entity';
import { EUserRole } from 'enums/user-role.enum';
import { compareSync, hash } from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole) private readonly userRoleRepository: Repository<UserRole>,
  ) { }

  findAll() {
    return `This action returns all user`;
  }

  validateUserPassword(user: User, password: string): boolean {
    return compareSync(password, user.password);
  }

  async createModerator(dto: RegisterDto) {
    let moderatorRole = await this.userRoleRepository.findOneByOrFail({ name: EUserRole.MODERATOR });
    moderatorRole = this.userRoleRepository.create({ name: EUserRole.MODERATOR });
    await this.userRoleRepository.save(moderatorRole);
    return this.create(dto, moderatorRole);
  }

  async create(dto: RegisterDto, role: UserRole) {
    const hashedPassword = await hash(dto.password, 10);
    const user = this.userRepository.create({ ...dto, password: hashedPassword, role });
    return this.userRepository.save(user);
  }

  async addAdminRole() {
    let adminRole = await this.userRoleRepository.findOneByOrFail({ name: EUserRole.ADMIN });
    adminRole = this.userRoleRepository.create({ name: EUserRole.ADMIN });
    await this.userRoleRepository.save(adminRole);
    return adminRole;
  }

  async createAdmin() {
    const adminRole = await this.userRoleRepository.findOneByOrFail({ name: EUserRole.ADMIN });
    if ((await this.userRepository.existsBy({ role: { name: EUserRole.ADMIN } }))) {
      this.logger.log(`Admin user already exists with username: ${process.env.SEED_ADMIN_USERNAME}`);
      return;
    }
    const admin = await this.create({
      username: process.env.SEED_ADMIN_USERNAME!,
      password: process.env.SEED_ADMIN_PASSWORD!
    }, adminRole);
    this.logger.log(`Admin user created with username: ${admin.username}`);
    return admin;
  }

  findOne(id: number) {
    const entity = this.userRepository.findOneBy({ id });
    if (entity === null || entity === undefined) {
      throw new Error(`User with id ${id} not found`);
    }
    return entity;
  }

  async findOneByUsername(username: string) {
    const entity = await this.userRepository.findOneBy({ username });
    if (entity === null || entity === undefined) {
      throw new Error(`User with username ${username} not found`);
    } else {
      return entity;
    }
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.userRepository.countBy({ username });
    return count > 0;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
