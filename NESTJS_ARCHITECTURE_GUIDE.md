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
- **Dependency Injection**: NestJS's built-in DI container manages dependencies
- **Modularity**: Features are organized into self-contained modules
- **Type Safety**: Full TypeScript support throughout the application
- **Testability**: Clear boundaries enable easy unit and integration testing

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
- Call use cases or services to process business logic
- Return HTTP responses with appropriate status codes
- API documentation (Swagger annotations)

**Example:**

```typescript
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('article')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly categoryService: CategoryService,
    private readonly personService: PersonService
  ) {}

  @Post()
  async create(@Body() createArticleDto: CreateArticleDto) {
    // Coordinate services to prepare data
    const author = await this.personService.findOne(createArticleDto.author);
    const categories = await Promise.all(
      createArticleDto.categories.map(category => 
        this.categoryService.findOrCreate(category)
      )
    );

    // Call service with prepared data
    return this.articleService.create({
      title: createArticleDto.title,
      content: createArticleDto.content,
      categories,
      author
    });
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

**Example:**

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

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

```typescript
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
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
    return this.userRepository.findOne({ where: { username } });
  }

  async validateUserPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { username } });
    return count > 0;
  }
}
```

### Authentication Use Case

```typescript
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class UsersUseCase {
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

  async authenticate(authenticateDto: AuthenticateUserDto) {
    const user = await this.userService.findOneByUsername(
      authenticateDto.username
    );
    
    if (!user || !(await this.userService.validateUserPassword(user, authenticateDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const accessToken = await this.jwtService.signAsync({
      username: user.username,
      sub: user.id
    });
    
    return { accessToken };
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

### Authentication Flow

```
1. User Registration:
   POST /api/user/register
   → UsersUseCase.register()
   → UserService.create()
   → Password hashed via @BeforeInsert hook
   → User saved to database

2. User Login:
   POST /api/user/authenticate
   → UsersUseCase.authenticate()
   → UserService.findOneByUsername()
   → Validate password with bcrypt.compare()
   → JwtService.signAsync() creates token
   → Return { accessToken }

3. Protected Route Access:
   GET /api/protected/resource
   Headers: { Authorization: 'Bearer <token>' }
   → AuthGuard.canActivate()
   → Extract and verify JWT token
   → Attach user payload to request
   → Allow access if valid
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
2. **Modular Design**: Self-contained feature modules
3. **Type Safety**: Full TypeScript support with proper configuration
4. **Robust Data Access**: TypeORM with PostgreSQL
5. **Secure Authentication**: JWT tokens with bcrypt password hashing
6. **Data Validation**: DTOs with class-validator
7. **Transaction Support**: Database consistency with typeorm-transactional
8. **Best Practices**: Industry-standard patterns and libraries

### Quick Start Checklist

- [ ] Set up TypeScript with proper configuration
- [ ] Install core NestJS dependencies
- [ ] Configure database module with TypeORM
- [ ] Set up configuration module for environment variables
- [ ] Create feature modules with controllers, services, and entities
- [ ] Implement DTOs with validation
- [ ] Add authentication with JWT and bcrypt
- [ ] Configure transactional support
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
