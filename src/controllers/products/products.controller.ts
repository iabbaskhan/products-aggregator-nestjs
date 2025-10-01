import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  UseGuards, 
  ParseIntPipe, 
  ParseBoolPipe,
  DefaultValuePipe,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtGuard, ApiKeyGuard } from '@auth';
import { ProductAggregatorUseCases } from '../../use-cases/product-aggregator/product-aggregator.use-cases.service';
import { ProductFilters, ProductWithHistory, PriceChange } from '@types';

@ApiTags('Products')
@Controller('api/products')
@UseGuards(JwtGuard, ApiKeyGuard)
@ApiBearerAuth()
@ApiSecurity('api-key')
export class ProductsController {
  constructor(private readonly productAggregatorUseCases: ProductAggregatorUseCases) {}

  @Get('changes/stream')
  @ApiOperation({ summary: 'Stream product changes in real-time using Server-Sent Events' })
  @ApiResponse({ status: 200, description: 'SSE stream started successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async streamProductChanges(@Res() res: Response): Promise<void> {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    res.write('data: {"type":"connected","message":"Connected to product changes stream"}\n\n');

    const interval = setInterval(async () => {
      try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 30 * 1000);
        
        const changes = await this.productAggregatorUseCases.getProductsWithChanges(startDate, endDate, 50);
        
        if (changes.length > 0) {
          changes.forEach(change => {
            const eventData = {
              type: 'price_change',
              data: change,
              timestamp: new Date().toISOString(),
            };
            res.write(`data: ${JSON.stringify(eventData)}\n\n`);
          });
        }

        const heartbeat = {
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
        };
        res.write(`data: ${JSON.stringify(heartbeat)}\n\n`);
      } catch (error) {
        const errorData = {
          type: 'error',
          message: 'Failed to fetch product changes',
          timestamp: new Date().toISOString(),
        };
        res.write(`data: ${JSON.stringify(errorData)}\n\n`);
      }
    }, 5000);

    res.on('close', () => {
      clearInterval(interval);
    });

    res.on('error', (error) => {
      clearInterval(interval);
      console.error('SSE connection error:', error);
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with optional filtering and pagination' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by product name' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum price filter' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum price filter' })
  @ApiQuery({ name: 'availability', required: false, type: Boolean, description: 'Filter by availability' })
  @ApiQuery({ name: 'providerId', required: false, type: String, description: 'Filter by provider ID' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Filter by currency' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProducts(
    @Query('name') name?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('availability') availability?: string,
    @Query('providerId') providerId?: string,
    @Query('currency') currency?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ): Promise<{ items: ProductWithHistory[]; total: number; page: number; limit: number }> {
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const filters: ProductFilters = {};
    if (name) filters.name = name;
    if (minPrice !== undefined) {
      const parsedMinPrice = parseInt(minPrice, 10);
      if (!isNaN(parsedMinPrice)) {
        filters.minPrice = parsedMinPrice;
      }
    }
    if (maxPrice !== undefined) {
      const parsedMaxPrice = parseInt(maxPrice, 10);
      if (!isNaN(parsedMaxPrice)) {
        filters.maxPrice = parsedMaxPrice;
      }
    }
    if (availability !== undefined) {
      filters.availability = availability === 'true';
    }
    if (providerId) filters.providerId = providerId;
    if (currency) filters.currency = currency;

    return this.productAggregatorUseCases.getAllProducts(filters, page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name or description' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - missing search query' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchProducts(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ): Promise<{ items: ProductWithHistory[]; total: number; page: number; limit: number }> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query is required');
    }

    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    return this.productAggregatorUseCases.searchProducts(query.trim(), {}, page, limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get product statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatistics(): Promise<{
    totalProducts: number;
    availableProducts: number;
    unavailableProducts: number;
    providersCount: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
  }> {
    return this.productAggregatorUseCases.getProductStatistics();
  }

  @Get('stale')
  @ApiOperation({ summary: 'Get stale products (products that haven\'t been updated recently)' })
  @ApiResponse({ status: 200, description: 'Stale products retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStaleProducts(): Promise<ProductWithHistory[]> {
    return this.productAggregatorUseCases.getStaleProducts();
  }

  @Get('changes')
  @ApiOperation({ summary: 'Get products that have had price or availability changes within a specified timeframe' })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of changes to return (default: 100)' })
  @ApiResponse({ status: 200, description: 'Product changes retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid date format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProductsWithChanges(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number = 100,
  ): Promise<PriceChange[]> {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO string format.');
    }

    if (start >= end) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (limit < 1 || limit > 1000) {
      throw new BadRequestException('Limit must be between 1 and 1000');
    }

    return this.productAggregatorUseCases.getProductsWithChanges(start, end, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product by ID with price history' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProductById(@Param('id') id: string): Promise<ProductWithHistory | null> {
    return this.productAggregatorUseCases.getProductById(id);
  }

  @Get(':id/price-history')
  @ApiOperation({ summary: 'Get price history for a specific product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of history entries (default: 50)' })
  @ApiResponse({ status: 200, description: 'Price history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProductPriceHistory(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number = 50,
  ): Promise<any[]> {
    if (limit < 1 || limit > 200) {
      throw new BadRequestException('Limit must be between 1 and 200');
    }

    return this.productAggregatorUseCases.getProductPriceHistory(id, limit);
  }
}
