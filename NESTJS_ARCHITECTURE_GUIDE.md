# NestJS Architecture Guide

This document provides a comprehensive guide for setting up and structuring NestJS projects following best practices. It outlines the layered architecture pattern, module organization, and key libraries used in modern NestJS applications.

## Table of Contents

1. [Overview](#overview)
2. [Layer Architecture](#layer-architecture)
3. [Module Organization](#module-organization)
4. [Database Module Setup](#database-module-setup)
5. [Configuration Module](#configuration-module)
6. [Transactional Support](#transactional-support)
7. [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
8. [Authentication](#authentication)
9. [TypeScript Configuration](#typescript-configuration)
10. [Libraries and Dependencies](#libraries-and-dependencies)

---

## Overview

NestJS is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. This guide demonstrates a **layered architecture** pattern that separates concerns across multiple layers, ensuring maintainability, testability, and scalability.

### Core Principles

- **Separation of Concerns**: Each layer has a specific responsibility
- **Controllers → Use Cases Only**: Controllers never call services directly; all business logic flows through use cases
- **Dependency Injection**: NestJS's built-in DI container manages dependencies
- **Modularity**: Features are organized into self-contained modules
- **Type Safety**: Full TypeScript support throughout the application
- **Testability**: Clear boundaries enable easy unit and integration testing
- **User vs Person**: Separate User (authentication) from Person (domain entity)
- **RBAC + Permissions**: Implement both role-based and permission-based access control

---

## Layer Architecture

The application follows a **5-layer architecture** pattern:

```
┌─────────────────────────────────────────────────┐
│         1. Presentation Layer                    │
│            (Controllers)                         │
│  - Handle HTTP requests/responses                │
│  - Route handling and validation                 │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         2. Application Layer                     │
│            (Use Cases)                           │
│  - Business logic orchestration                  │
│  - Coordinate multiple services                  │
│  - Transaction management                        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         3. Domain Layer                          │
│            (Services)                            │
│  - Domain-specific business logic                │
│  - CRUD operations                               │
│  - Data manipulation                             │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         4. Data Access Layer                     │
│            (Repositories & Entities)             │
│  - Database interactions                         │
│  - Entity definitions                            │
│  - Query building                                │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         5. Infrastructure Layer                  │
│    (Config, DTOs, Guards, Mappers, etc.)        │
│  - Cross-cutting concerns                        │
│  - Utilities and helpers                         │
└─────────────────────────────────────────────────┘
```

### 1. Presentation Layer (Controllers)

Controllers handle incoming HTTP requests and return responses to the client.

**Responsibilities:**
- Route HTTP requests to appropriate handlers
- Parse and validate request data using DTOs
- **Always call use cases to handle business logic (never call services directly)**
- Return HTTP responses with appropriate status codes
- API documentation (Swagger annotations)

**Important Rule: Controllers → Use Cases → Services**

Controllers should **never** call services directly. All business logic should be orchestrated through use cases. This ensures:
- Consistent transaction management
- Proper separation of concerns
- Easier testing and maintenance
- Centralized business logic coordination

**Example:**

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ArticleUseCase } from './article.use-case';
import { CreateArticleDto, UpdateArticleDto } from './dto/create-article.dto';

@Controller('article')
export class ArticleController {
  constructor(
    private readonly articleUseCase: ArticleUseCase
  ) {}

  @Post()
  async create(@Body() createArticleDto: CreateArticleDto) {
    // Controller only calls use case, never services directly
    return this.articleUseCase.createArticle(createArticleDto);
  }

  @Get()
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.articleUseCase.getAllArticles(
      page ? +page : 1,
      limit ? +limit : 10
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleUseCase.getArticleById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleUseCase.updateArticle(+id, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleUseCase.deleteArticle(+id);
  }
}
```

### 2. Application Layer (Use Cases)

Use cases encapsulate complex business workflows that involve multiple services or transactions.

**Responsibilities:**
- Orchestrate complex business operations
- Coordinate multiple domain services
- Manage transactions across multiple entities
- Handle cross-cutting concerns
- Map between entities and DTOs

**When to use Use Cases:**
- Complex workflows involving multiple services
- Operations requiring transactions
- Business logic that spans multiple domains
- Authentication and authorization workflows
- **All controller actions (controllers should never call services directly)**

**Example:**

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { ArticleService } from '../article/article.service';
import { CategoryService } from '../category/category.service';
import { PersonService } from '../person/person.service';
import { CreateArticleDto } from '../dto/request/create-article.dto';
import { UpdateArticleDto } from '../dto/request/update-article.dto';
import { Mapper } from '../mapper/mapper';

@Injectable()
export class ArticleUseCase {
  constructor(
    private readonly articleService: ArticleService,
    private readonly categoryService: CategoryService,
    private readonly personService: PersonService,
    private readonly mapper: Mapper
  ) {}

  @Transactional()
  async createArticle(dto: CreateArticleDto) {
    // Use case coordinates multiple services
    const author = await this.personService.findOne(dto.author);
    const categories = await Promise.all(
      dto.categories.map(category => 
        this.categoryService.findOrCreate(category)
      )
    );

    const article = await this.articleService.create({
      title: dto.title,
      content: dto.content,
      categories,
      author
    });

    return this.mapper.toArticleDTO(article);
  }

  async getAllArticles(page: number, limit: number) {
    const result = await this.articleService.findAll(page, limit);
    result.content = result.content.map(article => 
      this.mapper.toArticleDTO(article)
    );
    return result;
  }

  async getArticleById(id: number) {
    const article = await this.articleService.findOne(id);
    return this.mapper.toArticleDTO(article);
  }

  @Transactional()
  async updateArticle(id: number, dto: UpdateArticleDto) {
    await this.articleService.update(id, dto);
    const updated = await this.articleService.findOne(id);
    return this.mapper.toArticleDTO(updated);
  }

  @Transactional()
  async deleteArticle(id: number) {
    await this.articleService.remove(id);
  }
}
```

**Complex Use Case Example:**

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { EventService } from '../event/event.service';
import { LocationService } from '../location/location.service';
import { TopicService } from '../topic/topic.service';
import { PersonService } from '../person/person.service';
import { CategoryService } from '../category/category.service';
import { FileService } from '../file/file.service';
import { Mapper } from '../mapper/mapper';
import { CreateEventDto } from '../dto/request/create-event.dto';
import { Topic } from '../topic/entities/topic.entity';

@Injectable()
export class EventsUseCase {
  constructor(
    private readonly eventService: EventService,
    private readonly locationService: LocationService,
    private readonly topicService: TopicService,
    private readonly personService: PersonService,
    private readonly categoryService: CategoryService,
    private readonly fileService: FileService,
    private readonly mapper: Mapper
  ) {}

  @Transactional()
  async createEvent(dto: CreateEventDto) {
    // Create related entities
    const location = await this.locationService.create(dto.location);
    
    const topics: Topic[] = [];
    for (const topicDto of dto.topics) {
      const speakers = await Promise.all(
        topicDto.speakers.map(speaker => 
          this.personService.create(speaker)
        )
      );
      const topic = await this.topicService.create({
        name: topicDto.name,
        speakers
      });
      topics.push(topic);
    }

    const categories = await Promise.all(
      dto.categories.map(cat => this.categoryService.create(cat))
    );

    // Create main entity with all relationships
    const event = await this.eventService.create({
      name: dto.name,
      date: dto.date,
      location,
      topics,
      categories
    });

    // Handle optional file upload
    if (dto.cover) {
      const cover = await this.fileService.create(
        event.id.toString(), 
        dto.cover
      );
      event.cover = cover;
    }

    return this.mapper.toEventBasicDTO(event);
  }
}
```

### 3. Domain Layer (Services)

Services contain domain-specific business logic and data manipulation operations.

**Responsibilities:**
- Implement CRUD operations
- Enforce domain business rules
- Query and manipulate data through repositories
- Perform data validation
- Handle domain-specific logic

**Example:**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) 
    private readonly articleRepository: Repository<Article>
  ) {}

  create(createArticle: ICreateArticle) {
    return this.articleRepository.save(createArticle);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<IPage<Article>> {
    const [results, total] = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.categories', 'categories')
      .leftJoinAndSelect('article.author', 'author')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      content: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    };
  }

  findOne(id: number) {
    return this.articleRepository.findOne({
      where: { id },
      relations: {
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
```

### 4. Data Access Layer (Repositories & Entities)

This layer manages database interactions using TypeORM.

**Components:**
- **Entities**: TypeORM entities with decorators defining database schema
- **Repositories**: TypeORM repositories for data access

**Example Entity:**

```typescript
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToMany, 
  ManyToOne,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Category } from '../category/entities/category.entity';
import { Person } from '../person/entities/person.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => Person)
  author: Person;

  @ManyToMany(() => Category)
  @JoinTable()
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 5. Infrastructure Layer

Cross-cutting concerns and utilities used throughout the application.

**Components:**
- Configuration modules
- DTOs and validation
- Guards and middleware
- Mappers
- Interfaces and enums
- External service integrations

---

## Module Organization

NestJS uses modules to organize the application into cohesive units of functionality.

### Module Structure

Each feature module encapsulates:
- Controllers
- Services
- Entities
- DTOs
- Related components

### Example Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { Article } from './entities/article.entity';
import { CategoryModule } from '../category/category.module';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]), // Register entity
    CategoryModule,                       // Import related modules
    PersonModule
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService]               // Export service for other modules
})
export class ArticleModule {}
```

### Module Dependencies

- **Imports**: Other modules this module depends on
- **Controllers**: HTTP endpoints exposed by this module
- **Providers**: Services and other injectables
- **Exports**: Services made available to other modules

### Root Module

The root `AppModule` aggregates all feature modules:

```typescript
import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { AppConfigModule } from './config/app-config.module';
import { ArticleModule } from './article/article.module';
import { EventModule } from './event/event.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    DbModule,           // Database configuration
    AppConfigModule,    // Global configuration (JWT, etc.)
    ArticleModule,
    EventModule,
    UserModule,
    // ... other feature modules
  ]
})
export class AppModule {}
```

---

## Database Module Setup

The database module configures TypeORM and manages database connections.

### Database Module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Make config available globally
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT!, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev
      entities: [
        // Register all entities
        Article,
        Category,
        Event,
        User,
        // ... other entities
      ]
    })
  ]
})
export class DbModule {}
```

### Key Configuration Points

1. **Database Type**: PostgreSQL (can be MySQL, SQLite, etc.)
2. **Environment Variables**: Configuration from `.env` file
3. **Synchronize**: Auto-create/update tables (disable in production)
4. **Entities**: Array of all TypeORM entities

### Using Repositories in Services

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>
  ) {}

  // Use repository methods
  findAll() {
    return this.articleRepository.find();
  }

  // Use query builder for complex queries
  async findWithRelations() {
    return this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.categories', 'categories')
      .getMany();
  }
}
```

---

## Configuration Module

The configuration module manages application settings and secrets.

### Configuration Module Setup

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,                         // Make JWT available globally
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' }
    })
  ]
})
export class AppConfigModule {}
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=infohub

# Application
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here
```

### Using Configuration

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SomeService {
  constructor(private configService: ConfigService) {}

  getPort() {
    return this.configService.get<number>('PORT');
  }

  getDatabaseUrl() {
    return this.configService.get<string>('DATABASE_URL');
  }
}
```

---

## Transactional Support

Transactions ensure data consistency when multiple database operations must succeed or fail together.

### Setup

Install the library:

```bash
npm install typeorm-transactional
```

### Configure in `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext, addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

async function bootstrap() {
  // Initialize transactional context
  initializeTransactionalContext();
  
  const app = await NestFactory.create(AppModule);
  
  // Add data source for transaction management
  addTransactionalDataSource(app.get(DataSource));
  
  await app.listen(3000);
}
bootstrap();
```

### Using Transactions

Use the `@Transactional()` decorator on methods that require transactional behavior:

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class EventsUseCase {
  constructor(
    private readonly eventService: EventService,
    private readonly locationService: LocationService,
    private readonly fileService: FileService
  ) {}

  @Transactional()
  async createEvent(dto: CreateEventDto) {
    // All operations within this method will be part of a single transaction
    const location = await this.locationService.create(dto.location);
    const event = await this.eventService.create({
      ...dto,
      location
    });
    
    if (dto.cover) {
      await this.fileService.create(event.id.toString(), dto.cover);
    }
    
    // If any operation fails, all changes will be rolled back
    return event;
  }

  @Transactional()
  async deleteEvent(id: number) {
    const event = await this.eventService.findOne(id);
    
    // Delete related entities first
    if (event?.cover) {
      await this.fileService.remove(event.cover);
    }
    
    // Then delete the main entity
    await this.eventService.remove(id);
  }
}
```

### When to Use Transactions

- Creating entities with multiple related entities
- Updating multiple entities that must stay consistent
- Deleting entities with cascading deletions
- Any operation where partial completion would leave data in an inconsistent state

---

## Data Transfer Objects (DTOs)

DTOs define the shape of data for API requests and responses, providing validation and type safety.

### DTO Structure

Organize DTOs in a dedicated folder:

```
src/
  dto/
    request/           # Input DTOs
      create-article.dto.ts
      update-article.dto.ts
      register.dto.ts
    responses/         # Output DTOs
      article.dto.ts
      user.dto.ts
```

### Request DTOs with Validation

Use `class-validator` for input validation:

```typescript
import { IsNotEmpty, IsString, MinLength, IsArray } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsNotEmpty()
  categories: string[];

  @IsString()
  @IsNotEmpty()
  author: string;
}
```

### Enable Global Validation

In `main.ts`:

```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
}
bootstrap();
```

### Validation Options

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip properties not in DTO
  forbidNonWhitelisted: true, // Throw error if extra properties
  transform: true,            // Auto-transform types
  transformOptions: {
    enableImplicitConversion: true
  }
}));
```

### Response DTOs

Use response DTOs to control what data is exposed:

```typescript
export class UserBasicDto {
  id: number;
  username: string;
  // Don't expose password or sensitive data
}

export class LoggedInDto {
  accessToken: string;
}
```

### Mappers

Create mapper services to convert entities to DTOs:

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class Mapper {
  toUserBasicDTO(user: User): UserBasicDto {
    return {
      id: user.id,
      username: user.username
    };
  }

  toArticleDTO(article: Article): ArticleDto {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      author: this.toUserBasicDTO(article.author),
      categories: article.categories.map(c => c.name)
    };
  }
}
```

### Common Validation Decorators

```typescript
import {
  IsString,
  IsNumber,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  Matches,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class CompleteExampleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  age: number;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsBoolean()
  isActive: boolean;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsEnum(['admin', 'user', 'guest'])
  role: string;

  @Matches(/^[a-zA-Z0-9_-]+$/)
  username: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

---

## Authentication

Authentication is implemented using JWT (JSON Web Tokens) and bcrypt for password hashing.

### Required Libraries

```bash
npm install @nestjs/jwt bcrypt
npm install -D @types/bcrypt
```

### User Entity with Password Hashing

**Important: User vs Person Distinction**

- **User Entity**: Contains only authentication-related data (username, password, roles)
- **Person Entity**: Contains actual person information (name, bio, profile, etc.)

A User account may be linked to a Person entity, but they serve different purposes:
- User: For authentication and authorization
- Person: For representing an individual in the domain (authors, speakers, etc.)

```typescript
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Person } from '../person/entities/person.entity';
import { Role } from '../role/entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  // Direct permissions assigned to this specific user (extra privileges)
  // These are in addition to permissions inherited from roles
  @ManyToMany(() => Permission)
  @JoinTable()
  permissions: Permission[];

  // Optional: Link to Person entity if this user represents a person in the system
  @ManyToOne(() => Person, { nullable: true })
  person?: Person;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
```

**User Permissions Model:**
- **Role-based permissions**: Users inherit permissions from their assigned roles
- **Extra/individual privileges**: Users can have additional permissions directly assigned to them
- This allows for flexible authorization where a user can have:
  1. Standard permissions from their role (e.g., 'moderator' role)
  2. Extra specific privileges (e.g., permission to manage a particular resource)


### Role and Permission Entities

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from '../permission/entities/permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // e.g., 'admin', 'moderator', 'user'

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Permission)
  @JoinTable()
  permissions: Permission[];
}

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // e.g., 'articles.create', 'events.delete', 'users.manage'

  @Column({ nullable: true })
  description: string;

  @Column()
  resource: string; // e.g., 'articles', 'events', 'users'

  @Column()
  action: string; // e.g., 'create', 'read', 'update', 'delete'
}
```

### Person Entity (Separate from User)

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  avatarUrl: string;

  // Person represents domain entities like authors, speakers, etc.
  // Separate from User which handles authentication
}
```

### User Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(username: string, password: string): Promise<User> {
    const user = this.userRepository.create({ username, password });
    return this.userRepository.save(user);
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { username },
      relations: ['roles', 'permissions'] 
    });
  }

  async findByIdWithPermissions(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions', 'permissions']
    });
  }

  async validateUserPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { username } });
    return count > 0;
  }

  async assignExtraPermission(userId: number, permissionId: number): Promise<User> {
    const user = await this.findByIdWithPermissions(userId);
    const permission = await this.permissionRepository.findOne({ where: { id: permissionId } });
    
    if (!user.permissions) {
      user.permissions = [];
    }
    
    if (!user.permissions.find(p => p.id === permissionId)) {
      user.permissions.push(permission);
    }
    
    return this.userRepository.save(user);
  }

  async revokeExtraPermission(userId: number, permissionId: number): Promise<User> {
    const user = await this.findByIdWithPermissions(userId);
    user.permissions = user.permissions.filter(p => p.id !== permissionId);
    return this.userRepository.save(user);
  }
}
```

### Authentication Use Case

```typescript
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto } from '../dto/request';

@Injectable()
export class AuthUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    if (await this.userService.existsByUsername(registerDto.username)) {
      throw new ConflictException('Username already exists');
    }
    
    const user = await this.userService.create(
      registerDto.username,
      registerDto.password
    );
    
    return {
      id: user.id,
      username: user.username
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByUsername(
      loginDto.username
    );
    
    if (!user || !(await this.userService.validateUserPassword(user, loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles?.map(r => r.name) || []
    };
    
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
    
    return { 
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username
      }
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const accessToken = await this.jwtService.signAsync({
        username: payload.username,
        sub: payload.sub,
        roles: payload.roles
      });
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

### User Management Use Case (Separate from Auth)

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UpdateUserDto, AssignRoleDto, AssignPermissionDto } from '../dto/request';

@Injectable()
export class UserManagementUseCase {
  constructor(
    private readonly userService: UserService
  ) {}

  async getAllUsers(page: number, limit: number) {
    return this.userService.findAll(page, limit);
  }

  async getUserById(id: number) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    await this.userService.update(id, dto);
    return this.getUserById(id);
  }

  async deleteUser(id: number) {
    await this.userService.remove(id);
  }

  async assignRole(userId: number, dto: AssignRoleDto) {
    return this.userService.assignRole(userId, dto.roleId);
  }

  async revokeRole(userId: number, roleId: number) {
    return this.userService.revokeRole(userId, roleId);
  }

  // Extra/individual privilege management
  async assignExtraPermission(userId: number, dto: AssignPermissionDto) {
    return this.userService.assignExtraPermission(userId, dto.permissionId);
  }

  async revokeExtraPermission(userId: number, permissionId: number) {
    return this.userService.revokeExtraPermission(userId, permissionId);
  }
}
```

### Separate Controllers: Authentication vs User Management

**Authentication Controller** - Handles login, register, refresh token:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthUseCase } from '../use-case/auth.use-case';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../dto/request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authUseCase.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authUseCase.login(loginDto);
  }

  @Post('refresh')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authUseCase.refreshToken(refreshTokenDto.refreshToken);
  }
}
```

**User Management Controller** - Handles user CRUD operations:

```typescript
import { Controller, Get, Put, Delete, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UserManagementUseCase } from '../use-case/user-management.use-case';
import { UpdateUserDto, AssignRoleDto, AssignPermissionDto } from '../dto/request';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userManagementUseCase: UserManagementUseCase) {}

  @Get()
  @Roles('admin', 'moderator')
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.userManagementUseCase.getAllUsers(
      page ? +page : 1,
      limit ? +limit : 10
    );
  }

  @Get(':id')
  @Roles('admin', 'moderator')
  findOne(@Param('id') id: string) {
    return this.userManagementUseCase.getUserById(+id);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userManagementUseCase.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.userManagementUseCase.deleteUser(+id);
  }

  @Post(':id/roles')
  @Roles('admin')
  assignRole(@Param('id') id: string, @Body() assignRoleDto: AssignRoleDto) {
    return this.userManagementUseCase.assignRole(+id, assignRoleDto);
  }

  @Delete(':id/roles/:roleId')
  @Roles('admin')
  revokeRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return this.userManagementUseCase.revokeRole(+id, +roleId);
  }

  // Extra/individual privilege management
  @Post(':id/permissions')
  @Roles('admin')
  assignExtraPermission(@Param('id') id: string, @Body() assignPermissionDto: AssignPermissionDto) {
    return this.userManagementUseCase.assignExtraPermission(+id, assignPermissionDto);
  }

  @Delete(':id/permissions/:permissionId')
  @Roles('admin')
  revokeExtraPermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return this.userManagementUseCase.revokeExtraPermission(+id, +permissionId);
  }
}
```

### Auth Guard

Create a guard to protect routes:

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException();
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### Using the Auth Guard

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';

@Controller('protected')
export class ProtectedController {
  @Get('resource')
  @UseGuards(AuthGuard)
  getProtectedResource() {
    return { message: 'This is a protected resource' };
  }
}
```

### Role-Based Access Control (RBAC) and Permission-Based Authorization

NestJS supports both **Role-Based Access Control (RBAC)** and **Permission-Based Access Control** for fine-grained authorization.

#### Roles Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

#### Permissions Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);
```

#### Roles Guard (RBAC)

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // No roles required
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // user.roles should be populated from JWT token
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

#### Permissions Guard (Fine-Grained Control)

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserService } from '../user/user.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );
    
    if (!requiredPermissions) {
      return true; // No permissions required
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Load user with roles and permissions from database
    const fullUser = await this.userService.findByIdWithPermissions(user.sub);
    
    if (!fullUser) {
      throw new ForbiddenException('User not found');
    }
    
    // Extract permissions from user's roles
    const rolePermissions = fullUser.roles
      .flatMap(role => role.permissions)
      .map(permission => permission.name);
    
    // Extract extra/individual permissions directly assigned to user
    const extraPermissions = fullUser.permissions?.map(permission => permission.name) || [];
    
    // Combine both role-based and extra permissions
    const allUserPermissions = [...new Set([...rolePermissions, ...extraPermissions])];
    
    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission =>
      allUserPermissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }
    
    return true;
  }
}
```

#### Using RBAC and Permissions Together

```typescript
import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from '../decorators/roles.decorator';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { ArticleUseCase } from '../use-case/article.use-case';
import { CreateArticleDto } from '../dto/request/create-article.dto';

@Controller('articles')
@UseGuards(AuthGuard) // All routes require authentication
export class ArticlesController {
  constructor(private readonly articleUseCase: ArticleUseCase) {}

  @Get()
  // Public read access for authenticated users
  findAll() {
    return this.articleUseCase.getAllArticles(1, 10);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator', 'author') // Role-based: any of these roles can create
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleUseCase.createArticle(createArticleDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('articles.delete') // Permission-based: specific permission required
  remove(@Param('id') id: string) {
    return this.articleUseCase.deleteArticle(+id);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'moderator') // Must have one of these roles
  @RequirePermissions('articles.publish') // AND this specific permission
  publish(@Param('id') id: string) {
    return this.articleUseCase.publishArticle(+id);
  }
}
```

#### Best Practices for RBAC and Permissions

1. **Use Roles for broad categories**: admin, moderator, user, guest
2. **Use Permissions for specific actions**: `articles.create`, `articles.delete`, `users.manage`
3. **Permission naming convention**: `resource.action` (e.g., `events.publish`, `users.delete`)
4. **Combine both**: Roles contain groups of permissions, making management easier
5. **Extra/Individual Privileges**: Users can have permissions directly assigned to them in addition to role-based permissions
   - **Use case**: A regular 'user' role member needs temporary access to a specific resource
   - **Example**: User with 'moderator' role + extra permission 'articles.featured.manage'
6. **Hierarchy**: Admin role typically has all permissions
7. **Store in JWT payload**: Include roles in JWT for quick checks, load full permissions when needed
8. **Database-driven**: Store roles and permissions in database for flexibility
9. **Permission Resolution**: When checking permissions, combine both role-based and extra user permissions

### Authentication and Authorization Flow

```
1. User Registration:
   POST /api/auth/register
   → AuthUseCase.register()
   → UserService.create()
   → Password hashed via @BeforeInsert hook
   → User saved to database

2. User Login:
   POST /api/auth/login
   → AuthUseCase.login()
   → UserService.findOneByUsername()
   → Validate password with bcrypt.compare()
   → JwtService.signAsync() creates tokens with roles
   → Return { accessToken, refreshToken }

3. Token Refresh:
   POST /api/auth/refresh
   → AuthUseCase.refreshToken()
   → Verify refresh token
   → Issue new access token
   → Return { accessToken }

4. Protected Route Access with RBAC and Extra Permissions:
   GET /api/articles
   Headers: { Authorization: 'Bearer <token>' }
   → AuthGuard.canActivate() - verifies JWT
   → RolesGuard.canActivate() - checks user roles
   → PermissionsGuard.canActivate() - checks permissions (role-based + extra)
   → Permission resolution combines:
      * Permissions from user's roles
      * Extra permissions directly assigned to user
   → Access granted if all guards pass

5. User Management (Separate from Auth):
   GET /api/users (admin only)
   PUT /api/users/:id (admin only)
   DELETE /api/users/:id (admin only)
   POST /api/users/:id/roles (admin - assign role)
   DELETE /api/users/:id/roles/:roleId (admin - revoke role)
   POST /api/users/:id/permissions (admin - assign extra permission)
   DELETE /api/users/:id/permissions/:permissionId (admin - revoke extra permission)
   → UsersController (separate from AuthController)
   → UserManagementUseCase handles business logic
   → Protected by AuthGuard + RolesGuard
```

---

## TypeScript Configuration

Proper TypeScript configuration is crucial for type safety and developer experience.

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false,
    "paths": {
      "*": ["./src/*"]
    }
  }
}
```

### Key Configuration Options

#### Module System
- `"module": "nodenext"` - Use Node.js's native ESM support
- `"moduleResolution": "nodenext"` - Modern module resolution
- `"resolvePackageJsonExports": true` - Respect package.json exports field

#### Decorator Support (Required for NestJS)
- `"emitDecoratorMetadata": true` - Emit metadata for decorators
- `"experimentalDecorators": true` - Enable decorator syntax

#### Build Options
- `"target": "ES2023"` - Compile to modern JavaScript
- `"outDir": "./dist"` - Output directory for compiled code
- `"declaration": true` - Generate .d.ts files
- `"sourceMap": true` - Generate source maps for debugging
- `"incremental": true` - Enable incremental compilation for faster builds
- `"removeComments": true` - Remove comments from output

#### Type Checking
- `"strictNullChecks": true` - Strict null checking
- `"forceConsistentCasingInFileNames": true` - Enforce case sensitivity
- `"skipLibCheck": true` - Skip type checking of declaration files (faster builds)

#### Path Mapping
```json
"paths": {
  "*": ["./src/*"]
}
```
Allows clean imports: `import { User } from 'user/entities/user.entity'` instead of `import { User } from '../../user/entities/user.entity'`

### `tsconfig.build.json`

For production builds, exclude test files:

```json
{
  "extends": "./tsconfig.json",
  "exclude": [
    "node_modules",
    "test",
    "dist",
    "**/*spec.ts"
  ]
}
```

### Build Scripts in `package.json`

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main"
  }
}
```

---

## Libraries and Dependencies

### Core Dependencies

#### NestJS Core
```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express
```
- `@nestjs/common` - Core decorators and utilities
- `@nestjs/core` - NestJS framework core
- `@nestjs/platform-express` - Express adapter (or use fastify)

#### Configuration
```bash
npm install @nestjs/config
```
- Environment variable management
- Configuration service

#### Database (TypeORM)
```bash
npm install @nestjs/typeorm typeorm pg
npm install typeorm-transactional typeorm-extension
```
- `@nestjs/typeorm` - NestJS TypeORM integration
- `typeorm` - TypeORM ORM library
- `pg` - PostgreSQL driver (or `mysql2`, `sqlite3`, etc.)
- `typeorm-transactional` - Transaction support
- `typeorm-extension` - Additional TypeORM utilities

#### Authentication
```bash
npm install @nestjs/jwt bcrypt
npm install -D @types/bcrypt
```
- `@nestjs/jwt` - JWT token generation and validation
- `bcrypt` - Password hashing

#### Validation
```bash
npm install class-validator class-transformer
```
- `class-validator` - Decorator-based validation
- `class-transformer` - Object transformation

#### API Documentation
```bash
npm install @nestjs/swagger
```
- Automatic Swagger/OpenAPI documentation

#### Mapped Types
```bash
npm install @nestjs/mapped-types
```
- Utilities for creating DTOs (PartialType, PickType, OmitType)

### Development Dependencies

```bash
npm install -D @nestjs/cli @nestjs/schematics @nestjs/testing
npm install -D typescript ts-node ts-loader tsconfig-paths
npm install -D @types/node @types/express
npm install -D jest @types/jest ts-jest supertest @types/supertest
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier
```

### Essential package.json

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/config": "^4.0.2",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/typeorm": "^11.0.0",
    "@nestjs/jwt": "^11.0.1",
    "@nestjs/swagger": "^11.2.3",
    "@nestjs/mapped-types": "*",
    "typeorm": "^0.3.25",
    "typeorm-transactional": "^0.5.0",
    "pg": "^8.16.3",
    "bcrypt": "^6.0.0",
    "class-validator": "^0.14.2",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "@types/node": "^22.10.7",
    "@types/express": "^5.0.0",
    "@types/bcrypt": "^6.0.0",
    "@types/jest": "^30.0.0",
    "@types/supertest": "^6.0.2",
    "typescript": "^5.7.3",
    "ts-node": "^10.9.2",
    "ts-jest": "^29.2.5",
    "jest": "^30.0.0",
    "supertest": "^7.0.0",
    "eslint": "^9.18.0",
    "prettier": "^3.4.2"
  }
}
```

### Library Choices Explained

#### ORM: TypeORM
- **Why TypeORM**: Mature, well-documented, decorator-based ORM
- **Alternatives**: Prisma (schema-first), Sequelize (class-based), MikroORM
- **Features**: Entity decorators, query builder, migrations, multiple database support

#### Authentication: JWT + bcrypt
- **Why JWT**: Stateless, scalable authentication
- **Why bcrypt**: Industry-standard password hashing with salt
- **Alternatives**: Passport.js (for multiple strategies), Argon2 (newer hashing)

#### Validation: class-validator
- **Why class-validator**: Decorator-based, integrates seamlessly with NestJS DTOs
- **Features**: 100+ built-in validators, custom validators, nested validation
- **Alternatives**: Joi, Yup (schema-based)

#### Transaction Management: typeorm-transactional
- **Why**: Simple decorator-based transaction management
- **Features**: Automatic rollback on errors, nested transactions
- **Alternatives**: Manual transaction management with TypeORM's EntityManager

---

## Summary

This guide provides a comprehensive foundation for building NestJS applications with:

1. **Clear Layered Architecture**: Controllers → Use Cases → Services → Repositories
2. **Strict Separation**: Controllers always call use cases, never services directly
3. **Modular Design**: Self-contained feature modules
4. **Type Safety**: Full TypeScript support with proper configuration
5. **Robust Data Access**: TypeORM with PostgreSQL
6. **Secure Authentication**: JWT tokens with bcrypt password hashing
7. **RBAC and Permissions**: Role-based and permission-based access control with extra/individual privileges
8. **User vs Person Separation**: User entity for authentication, Person entity for domain
9. **Separate Controllers**: Authentication controller (login/register) and User management controller
10. **Data Validation**: DTOs with class-validator
11. **Transaction Support**: Database consistency with typeorm-transactional
12. **Best Practices**: Industry-standard patterns and libraries

### Key Architectural Rules

1. **Controllers → Use Cases Only**: Controllers must never call services directly. All business logic orchestration goes through use cases.

2. **User Entity Purpose**: The User table should only contain authentication-related data:
   - Username
   - Password (hashed)
   - Roles (for role-based permissions)
   - Extra/individual permissions (specific privileges beyond role)
   - Authentication metadata
   
3. **Person Entity Purpose**: The Person entity represents individuals in your domain:
   - Name, bio, email
   - Profile information
   - Business-related data
   - Can be linked to a User, but serves a different purpose

4. **Separate Controllers**:
   - **AuthController** (`/api/auth`): Handles register, login, refresh-token
   - **UsersController** (`/api/users`): Handles user management (CRUD, role assignment, extra permissions)

5. **Authorization Layers**:
   - **RBAC (Role-Based)**: Broad access categories (admin, moderator, user)
   - **Permissions**: Fine-grained control (articles.create, users.delete)
   - **Extra Privileges**: Individual permissions assigned directly to users beyond their roles
   - Combine both for flexible security

### Quick Start Checklist

- [ ] Set up TypeScript with proper configuration
- [ ] Install core NestJS dependencies
- [ ] Configure database module with TypeORM
- [ ] Set up configuration module for environment variables
- [ ] Create feature modules with controllers, use cases, services, and entities
- [ ] Implement DTOs with validation
- [ ] Add authentication with JWT and bcrypt (separate User and Person entities)
- [ ] Create separate AuthController and UsersController
- [ ] Implement RBAC with roles and permissions
- [ ] Add RolesGuard and PermissionsGuard
- [ ] Configure transactional support
- [ ] Ensure all controllers only call use cases, never services
- [ ] Set up API documentation with Swagger
- [ ] Configure global pipes and guards
- [ ] Write tests for critical functionality

### Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

*This guide is based on real-world NestJS application architecture patterns and represents current best practices as of 2024.*
