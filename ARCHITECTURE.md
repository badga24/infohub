# InfoHub Architecture

## Overview

InfoHub is a **NestJS** backend application designed to manage blog articles and events. The application follows a **layered architecture** pattern with clear separation of concerns, built on top of TypeScript and TypeORM for database management.

## Architecture Layers

The application is structured in a **5-layer architecture**:

### 1. **Presentation Layer** (API/Controllers)

This layer handles HTTP requests and responses, exposing RESTful endpoints to external clients.

**Components:**
- **Controllers** (`src/controllers/`, `src/*/\*.controller.ts`)
  - `UsersController` - User authentication and registration endpoints
  - `EventsController` - Events management endpoints
  - `FileController` - File upload/download endpoints
  - Domain-specific controllers (ArticleController, CategoryController, etc.)

**Responsibilities:**
- Route HTTP requests to appropriate handlers
- Parse and validate request data using DTOs (Data Transfer Objects)
- Return HTTP responses
- API documentation via Swagger
- Global prefix: `/api`
- CORS enabled for cross-origin requests

**Example:** `src/controllers/users.controller.ts`, `src/article/article.controller.ts`

### 2. **Application/Use Case Layer**

This layer contains business logic orchestration and coordinates interactions between multiple domain services.

**Components:**
- **Use Cases** (`src/use-case/`)
  - `UsersUseCase` - Handles user registration and authentication workflows
  - `EventsUseCase` - Manages event-related business logic
  - `FileUseCase` - Orchestrates file operations

**Responsibilities:**
- Implement complex business workflows
- Coordinate multiple services
- Handle cross-cutting concerns (authentication, authorization)
- Orchestrate transactions
- Map between domain entities and DTOs

**Key Pattern:** Use cases act as a facade, simplifying complex operations that involve multiple services.

**Example:** `src/use-case/users.use-case.ts` coordinates UserService and JwtService for authentication

### 3. **Domain/Service Layer**

This layer contains domain-specific business logic and data manipulation operations.

**Components:**
- **Services** (`src/*/\*.service.ts`)
  - `ArticleService` - Article CRUD operations
  - `EventService` - Event management
  - `UserService` - User management
  - `FileService` - File storage operations
  - `CategoryService`, `LocationService`, `TopicService`, `PersonService`

**Responsibilities:**
- Implement domain-specific business rules
- Perform CRUD operations on entities
- Query and manipulate data through repositories
- Validate business constraints
- Handle domain logic

**Example:** `src/article/article.service.ts` manages article creation, pagination, and relationships

### 4. **Data Access Layer**

This layer manages database interactions and data persistence.

**Components:**
- **Entities** (`src/*/entities/\*.entity.ts`)
  - TypeORM entities with decorators defining database schema
  - Relationships: ManyToMany, ManyToOne, OneToMany
  - Primary entities: Article, Event, User, Person, Category, Location, Topic, File
  
- **Repositories** (TypeORM Repository Pattern)
  - Injected via `@InjectRepository`
  - Provide database abstraction
  
- **Database Module** (`src/db/`)
  - `DbModule` - Configures TypeORM and database connection
  - `data-source.ts` - TypeORM data source configuration
  - `SeedService` - Database seeding for development

**Database:**
- **PostgreSQL** (TypeORM configured for Postgres)
- Connection configuration via environment variables
- Auto-synchronization in non-production environments
- Transactional support via `typeorm-transactional`

**Example:** `src/article/entities/article.entity.ts` defines the Article table structure

### 5. **Infrastructure/Cross-Cutting Layer**

This layer provides common utilities and infrastructure services used across the application.

**Components:**

- **Configuration** (`src/config/`)
  - `AppConfigModule` - JWT and global configuration
  - `swagger.ts` - API documentation setup
  - Environment-based configuration via `.env`

- **DTOs (Data Transfer Objects)** (`src/dto/`)
  - `request/` - Input DTOs for API requests
  - `responses/` - Output DTOs for API responses
  - Validation using `class-validator`

- **Guards** (`src/guards/`)
  - `AuthGuard` - JWT authentication guard

- **Mapper** (`src/mapper/`)
  - Maps between entities and DTOs
  - Reduces coupling between layers

- **Interfaces** (`src/interfaces/`)
  - Defines contracts for services
  - `IAppFilesStorageService` - File storage abstraction
  - `IPage` - Pagination interface

- **Enums** (`src/enums/`)
  - Application-wide enumerations
  - `EAppContentType`, `UserRole`, `Permission`

- **External Services**
  - Firebase for file storage
  - JWT for authentication

## Module Organization

The application uses **NestJS modules** for dependency injection and encapsulation:

```
AppModule (Root)
├── DbModule - Database configuration
├── AppConfigModule - JWT and app config
├── Domain Modules:
│   ├── ArticleModule
│   ├── EventModule
│   ├── UserModule
│   ├── PersonModule
│   ├── CategoryModule
│   ├── LocationModule
│   ├── TopicModule
│   └── FileModule
```

**Module Pattern:**
- Each domain feature is a self-contained module
- Modules export services for use by other modules
- Controllers and providers are registered at module level

**Example:** `ArticleModule` imports `CategoryModule` and `PersonModule` to access their services

## Data Flow

### Typical Request Flow:

```
1. HTTP Request → Controller (Presentation Layer)
   ↓
2. Controller → Use Case (Application Layer)
   ↓
3. Use Case → Services (Domain Layer)
   ↓
4. Service → Repository → Entity (Data Access Layer)
   ↓
5. Database Query/Transaction
   ↓
6. Entity → Service → Use Case → Controller
   ↓
7. HTTP Response (mapped to DTO)
```

### Example: Creating an Article

```
POST /api/article
   ↓
ArticleController.create()
   ↓
ArticleService.create()
   ├── PersonService.findOne() (author)
   └── CategoryService.findOrCreate() (categories)
   ↓
ArticleRepository.save()
   ↓
PostgreSQL Database
```

## Key Architectural Patterns

### 1. **Layered Architecture**
- Clear separation between presentation, business logic, and data access
- Each layer only depends on the layer below it
- Promotes maintainability and testability

### 2. **Repository Pattern**
- Abstracts data access through TypeORM repositories
- Services interact with repositories, not direct database queries
- Enables easier testing and database switching

### 3. **Dependency Injection**
- NestJS built-in DI container
- Services injected via constructors
- Loose coupling between components

### 4. **DTO Pattern**
- Separate DTOs for requests and responses
- Input validation using `class-validator`
- Protection against over-posting

### 5. **Module Pattern**
- Feature-based modularization
- Encapsulation of domain logic
- Reusable and composable modules

### 6. **Use Case Pattern**
- Business logic orchestration
- Coordinates multiple services
- Transaction management

### 7. **Strategy Pattern**
- File storage abstraction (`IAppFilesStorageService`)
- Supports multiple storage backends (currently Firebase)

## Security

- **Authentication:** JWT-based authentication
- **Authorization:** Role-based access control with UserRole and Permission entities
- **Guards:** NestJS guards protect routes
- **Validation:** Input validation via DTOs and `ValidationPipe`
- **Password Hashing:** bcrypt for password security
- **CORS:** Configured to allow cross-origin requests

## Testing

The application includes:
- **Unit Tests:** `*.spec.ts` files for services and controllers
- **E2E Tests:** Integration tests in `test/` directory
- **Jest:** Testing framework
- Test coverage configuration

## Development & Deployment

- **Development:** `npm run start:dev` with hot-reload
- **Production:** `npm run build` → `npm run start:prod`
- **Docker Support:** Dockerfile and docker-compose.yaml for containerization
- **Database Seeding:** `npm run seed` for development data

## Environment Configuration

Configuration managed through environment variables:
- Database connection (PostgreSQL)
- JWT secret
- Firebase credentials (for file storage)
- Application port

## API Documentation

- **Swagger/OpenAPI** documentation available at `/swagger`
- Automatic generation from decorators and DTOs

## Summary

The InfoHub architecture follows **best practices** for NestJS applications:

1. **Clear Layering:** Separation of concerns across 5 distinct layers
2. **Modularity:** Feature-based modules for scalability
3. **Testability:** Dependency injection and clear boundaries enable easy testing
4. **Maintainability:** Consistent patterns and organization
5. **Scalability:** Modular design allows easy addition of new features
6. **Type Safety:** Full TypeScript support throughout
7. **Database Agnostic:** TypeORM abstraction allows database flexibility

This architecture supports the application's core features (blog articles and events management) while remaining flexible for future enhancements.
