# Product Aggregator Service

A real-time digital product aggregation service built with NestJS that collects, normalizes, and serves pricing and availability data from multiple third-party providers.

For Postman related documentation pls refer to the POSTMAN_TESTING_GUIDE.md file in this repo.

Note: This ReadMe file was generated using Cursor and later modified for clarity. 

## 🚀 Features

- **Real-time Data Aggregation**: Continuously fetches and normalizes product data from multiple providers
- **Price History Tracking**: Maintains historical records of price changes with timestamps
- **RESTful API**: Complete API with filtering, pagination, and detailed product information
- **Real-time Visualization**: Live dashboard showing product changes via Server-Sent Events (SSE)
- **Centralized Secrets Management**: Uses Infisical for secure environment variable management
- **Docker Ready**: Fully containerized with Docker Compose for easy deployment
- **API Documentation**: Integrated Swagger/OpenAPI documentation

## 🏗️ Architecture

The service aggregates data from three simulated providers:
- **E-commerce Provider**: Digital products like software licenses and e-books
- **Ticketing Provider**: Event tickets and digital passes
- **Events Provider**: Digital courses and online events

Data is collected every 30 seconds, normalized into a consistent format, and stored in PostgreSQL with full price history tracking.

## 🛠️ Technology Stack

- **Backend**: NestJS (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + API Key authentication
- **Secrets Management**: Infisical
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Infisical account (for secrets management)

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd product-aggregator-service
   ```

2. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your Infisical credentials (the example env file is sufficient for testing):
   ```bash
   INFISICAL_MACHINE_IDENTITY_CLIENT_ID=your_machine_identity_client_id
   INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET=your_machine_identity_client_secret
   INFISICAL_PROJECT_ID=your_project_id
   INFISICAL_ENVIRONMENT=staging
   ```

3. **Start the services**
   ```bash
   docker compose up --build
   ```

4. **Access the application**
   - **Swagger Documentation**: http://localhost:3060/api
   - **Real-time Visualization**: http://localhost:3060/visualization

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up the database**
   ```bash
   pnpm run db:setup
   ```

3. **Start the application**
   ```bash
   pnpm run start:dev
   ```

## 🔐 Environment Configuration

The application uses **Infisical** for centralized secrets and environment variables management. The `env.example` file contains reference variables that can be used for testing and development.

### Required Environment Variables

- `INFISICAL_MACHINE_IDENTITY_CLIENT_ID`: Infisical machine identity client ID
- `INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET`: Infisical machine identity client secret
- `INFISICAL_PROJECT_ID`: Infisical project ID
- `INFISICAL_ENVIRONMENT`: Infisical environment (dev/staging/prod)

## 📚 API Documentation

### Authentication

All API endpoints require both JWT authentication and API key:
- **JWT Token**: Bearer token in `Authorization` header
- **API Key**: `X-API-Key` header

### Key Endpoints

- `GET /api/products` - List all products with filtering options
- `GET /api/products/:id` - Get specific product with price history
- `GET /api/products/changes` - Get products with recent price changes
- `GET /api/products/changes/stream` - Real-time SSE stream of product changes
- `GET /api/products/statistics` - Product statistics and analytics

### Query Parameters

- `name` - Filter by product name
- `minPrice` / `maxPrice` - Price range filtering
- `availability` - Filter by availability status
- `providerId` - Filter by specific provider
- `currency` - Filter by currency
- `page` / `limit` - Pagination

## 🧪 Testing

### Postman Collection

The project includes ready-to-use Postman collection and environment files:
- `Product_Aggregator_API.postman_collection.json` - Complete API collection
- `Product_Aggregator_Environment.postman_environment.json` - Environment variables
- `POSTMAN_TESTING_GUIDE.md` - Detailed testing instructions

### Generate JWT Token

Use the included script to generate a test JWT token:
```bash
node generate_jwt_simple.js
```

## 📊 Real-time Visualization

Access the live dashboard at `/visualization` to see:
- Real-time product price changes
- Statistics (total changes, price increases/decreases)
- Live updates via Server-Sent Events
- Product details with price history

## 🗄️ Database Schema

- **Products**: Normalized product data with provider relationships
- **Price History**: Historical price changes with timestamps
- **Providers**: External provider configuration
- **Cron Logs**: Aggregation job tracking and monitoring

## 🔄 Data Flow

1. **Collection**: Scheduled jobs fetch data from all providers concurrently
2. **Normalization**: Raw data is transformed into consistent format
3. **Storage**: Products are upserted with price history tracking
4. **Serving**: API endpoints provide filtered and paginated access
5. **Real-time**: SSE streams deliver live updates to clients

## 🐳 Docker Deployment

The application is fully containerized with:
- Multi-stage Docker build for optimization
- Automatic database setup and seeding
- Health checks and dependency management
- Production-ready configuration

See `DOCKER_SETUP.md` for detailed Docker deployment instructions.

## 🧪 Development

### Available Scripts

- `pnpm run start:dev` - Start in development mode with hot reload
- `pnpm run build` - Build the application
- `pnpm run db:setup` - Set up database with schema and seed data
- `pnpm run prisma:studio` - Open Prisma Studio for database management

### Project Structure

```
src/
├── controllers/     # API endpoints and request handling
├── services/        # Core services and third-party integrations
├── use-cases/       # Application use cases and orchestration
├── config/          # Configuration and secrets management
├── auth/            # Authentication and authorization
└── core/            # Shared types, DTOs, and utilities
```

## 📈 Monitoring & Logging

- Structured logging with Pino
- Cron job monitoring and retry logic
- Error tracking and graceful failure handling
- Performance metrics and health checks