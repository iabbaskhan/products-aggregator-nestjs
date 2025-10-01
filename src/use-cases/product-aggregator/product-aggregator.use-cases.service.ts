import { Injectable, Logger } from '@nestjs/common';
import { IDataServices } from '@abstracts';
import { ECommerceProviderService } from '@services/providers/e-commerce/e-commerce.service';
import { TicketingProviderService } from '@services/providers/ticketing/ticketing.service';
import { EventsProviderService } from '@services/providers/events/events.service';
import { ConfigService } from '@config';
import { 
  NormalizedProduct, 
  ECommerceProduct, 
  TicketingProduct, 
  EventProduct,
  ProductFilters,
  ProductWithHistory,
  PriceChange
} from '@types';
import { Product, Provider } from '@prisma/client';

@Injectable()
export class ProductAggregatorUseCases {
  private readonly logger = new Logger(ProductAggregatorUseCases.name);

  constructor(
    private readonly dataServices: IDataServices,
    private readonly eCommerceProvider: ECommerceProviderService,
    private readonly ticketingProvider: TicketingProviderService,
    private readonly eventsProvider: EventsProviderService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Aggregate data from all providers
   */
  async aggregateAllProviders(): Promise<void> {
    this.logger.log('Starting data aggregation from all providers');

    try {
      const providers = await this.dataServices.providers.getAll(100, 1);
      
      if (providers.items.length === 0) {
        this.logger.warn('No providers found');
        return;
      }

      const aggregationPromises = providers.items.map(provider => 
        this.aggregateProviderData(provider)
      );

      await Promise.all(aggregationPromises);
      
      this.logger.log('Data aggregation completed successfully');
    } catch (error) {
      this.logger.error('Data aggregation failed', error);
      throw error;
    }
  }

  /**
   * Aggregate data from a specific provider
   */
  async aggregateProviderData(provider: Provider): Promise<void> {
    this.logger.log(`Aggregating data from provider: ${provider.name}`);

    try {
      let products: NormalizedProduct[] = [];

      switch (provider.name.toLowerCase()) {
        case 'ecommerce':
          products = await this.fetchAndNormalizeECommerceProducts(provider.id);
          break;
        case 'ticketing':
          products = await this.fetchAndNormalizeTicketingProducts(provider.id);
          break;
        case 'events':
          products = await this.fetchAndNormalizeEventsProducts(provider.id);
          break;
        default:
          this.logger.warn(`Unknown provider: ${provider.name}`);
          return;
      }

      await this.storeProducts(products, provider.id);
      
      this.logger.log(`Successfully aggregated ${products.length} products from ${provider.name}`);
    } catch (error) {
      this.logger.error(`Failed to aggregate data from provider ${provider.name}`, error);
      throw error;
    }
  }

  /**
   * Fetch and normalize e-commerce products
   */
  private async fetchAndNormalizeECommerceProducts(providerId: string): Promise<NormalizedProduct[]> {
    const products = await this.eCommerceProvider.getProducts();

    return products.map((product: ECommerceProduct) => ({
      externalId: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      availability: product.availability,
      lastUpdated: new Date(product.lastUpdated),
      providerId,
    }));
  }

  /**
   * Fetch and normalize ticketing products
   */
  private async fetchAndNormalizeTicketingProducts(providerId: string): Promise<NormalizedProduct[]> {
    const products = await this.ticketingProvider.getProducts();

    return products.map((product: TicketingProduct) => ({
      externalId: product.ticketId,
      name: product.eventName,
      description: product.eventDescription,
      price: product.ticketPrice,
      currency: product.currency,
      availability: product.isAvailable,
      lastUpdated: new Date(product.lastModified),
      providerId,
    }));
  }

  /**
   * Fetch and normalize events products
   */
  private async fetchAndNormalizeEventsProducts(providerId: string): Promise<NormalizedProduct[]> {
    const products = await this.eventsProvider.getProducts();

    return products.map((product: EventProduct) => ({
      externalId: product.eventId,
      name: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      availability: product.available,
      lastUpdated: new Date(product.updatedAt),
      providerId,
    }));
  }

  /**
   * Store products in the database with price history tracking
   */
  private async storeProducts(products: NormalizedProduct[], providerId: string): Promise<void> {
    for (const productData of products) {
      try {
        const existingProduct = await this.dataServices.products.getOneBy({
          externalId: productData.externalId,
          providerId: providerId,
        } as any);

        if (existingProduct) {
          await this.updateExistingProduct(existingProduct, productData);
        } else {
          await this.createNewProduct(productData);
        }
      } catch (error) {
        this.logger.error(`Failed to store product ${productData.externalId}`, error);
      }
    }
  }

  /**
   * Update existing product and track price changes
   */
  private async updateExistingProduct(existingProduct: Product, productData: NormalizedProduct): Promise<void> {
    const hasPriceChanged = Number(existingProduct.price) !== productData.price;
    const hasAvailabilityChanged = existingProduct.availability !== productData.availability;

    if (hasPriceChanged || hasAvailabilityChanged) {
      await this.dataServices.products.update(
        { id: existingProduct.id },
        {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          currency: productData.currency,
          availability: productData.availability,
          lastUpdated: productData.lastUpdated,
        } as any
      );

      if (hasPriceChanged) {
        await this.dataServices.priceHistory.create({
          productId: existingProduct.id,
          price: productData.price,
          currency: productData.currency,
          timestamp: productData.lastUpdated,
        } as any);
      }

      this.logger.log(`Updated product ${existingProduct.id} with changes`);
    }
  }

  /**
   * Create new product
   */
  private async createNewProduct(productData: NormalizedProduct): Promise<void> {
    const newProduct = await this.dataServices.products.create({
      externalId: productData.externalId,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      currency: productData.currency,
      availability: productData.availability,
      lastUpdated: productData.lastUpdated,
      providerId: productData.providerId,
    } as any);

    await this.dataServices.priceHistory.create({
      productId: newProduct.id,
      price: productData.price,
      currency: productData.currency,
      timestamp: productData.lastUpdated,
    } as any);

    this.logger.log(`Created new product ${newProduct.id}`);
  }

  /**
   * Get all products with optional filtering and pagination
   */
  async getAllProducts(
    filters: ProductFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: ProductWithHistory[]; total: number; page: number; limit: number }> {
    this.logger.log(`Fetching products with filters: ${JSON.stringify(filters)}`);

    const whereConditions: any = {};

    if (filters.name) {
      whereConditions.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      whereConditions.price = {};
      if (filters.minPrice !== undefined) {
        whereConditions.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        whereConditions.price.lte = filters.maxPrice;
      }
    }
    if (filters.availability !== undefined) {
      whereConditions.availability = filters.availability;
    }
    if (filters.providerId) {
      whereConditions.providerId = filters.providerId;
    }
    if (filters.currency) {
      whereConditions.currency = filters.currency;
    }

    const result = await this.dataServices.products.getAllBy(whereConditions, limit, page);

    return {
      items: result.items as ProductWithHistory[],
      total: result.total,
      page,
      limit,
    };
  }

  /**
   * Get a specific product by ID with price history
   */
  async getProductById(id: string): Promise<ProductWithHistory | null> {
    this.logger.log(`Fetching product with ID: ${id}`);

    const product = await this.dataServices.products.getOneBy({ id });
    
    if (!product) {
      this.logger.warn(`Product with ID ${id} not found`);
      return null;
    }

    return product as ProductWithHistory;
  }

  /**
   * Get products that have had price or availability changes within a specified timeframe
   */
  async getProductsWithChanges(
    startDate: Date,
    endDate: Date,
    limit: number = 100,
  ): Promise<PriceChange[]> {
    this.logger.log(`Fetching products with changes between ${startDate} and ${endDate}`);

    const priceHistory = await this.dataServices.priceHistory.getAllBy(
      {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      } as any,
      limit,
      1
    );

    const priceChanges: PriceChange[] = [];
    const productChanges = new Map<string, any[]>();

    priceHistory.items.forEach(history => {
      if (!productChanges.has(history.productId)) {
        productChanges.set(history.productId, []);
      }
      productChanges.get(history.productId)!.push(history);
    });

    for (const [productId, histories] of productChanges) {
      if (histories.length < 2) continue;

      histories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      for (let i = 0; i < histories.length - 1; i++) {
        const current = histories[i];
        const previous = histories[i + 1];

        if (Number(current.price) !== Number(previous.price)) {
          const changePercentage = ((Number(current.price) - Number(previous.price)) / Number(previous.price)) * 100;
          
          const product = await this.dataServices.products.getOneBy({ id: productId });
          const provider = await this.dataServices.providers.getOneBy({ id: product?.providerId });
          
          priceChanges.push({
            productId: current.productId,
            productName: product?.name || 'Unknown Product',
            providerName: provider?.name || 'Unknown Provider',
            oldPrice: Number(previous.price),
            newPrice: Number(current.price),
            currency: current.currency,
            changePercentage: Number(changePercentage.toFixed(2)),
            timestamp: current.timestamp,
          });
        }
      }
    }

    priceChanges.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    this.logger.log(`Found ${priceChanges.length} price changes`);
    return priceChanges;
  }

  /**
   * Get price history for a specific product
   */
  async getProductPriceHistory(productId: string, limit: number = 50): Promise<any[]> {
    this.logger.log(`Fetching price history for product: ${productId}`);

    const result = await this.dataServices.priceHistory.getAllBy(
      { productId },
      limit,
      1
    );

    return result.items;
  }

  /**
   * Search products by name or description
   */
  async searchProducts(
    query: string,
    filters: ProductFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: ProductWithHistory[]; total: number; page: number; limit: number }> {
    this.logger.log(`Searching products with query: ${query}`);

    const searchFilters = {
      ...filters,
      name: query,
    };

    return this.getAllProducts(searchFilters, page, limit);
  }

  /**
   * Get products by provider
   */
  async getProductsByProvider(
    providerId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: ProductWithHistory[]; total: number; page: number; limit: number }> {
    this.logger.log(`Fetching products for provider: ${providerId}`);

    return this.getAllProducts({ providerId }, page, limit);
  }

  /**
   * Get stale products (products that haven't been updated recently)
   */
  async getStaleProducts(): Promise<ProductWithHistory[]> {
    this.logger.log('Fetching stale products');

    const staleThresholdMinutes = this.configService.appSecrets.DATA_STALENESS_MINUTES;
    const staleThreshold = new Date(Date.now() - staleThresholdMinutes * 60 * 1000);

    this.logger.log(`Using stale threshold: ${staleThresholdMinutes} minutes`);

    const result = await this.dataServices.products.getAllBy({
      lastUpdated: { lt: staleThreshold },
    } as any, 1000, 1);

    return result.items as ProductWithHistory[];
  }

  /**
   * Get statistics about products
   */
  async getProductStatistics(): Promise<{
    totalProducts: number;
    availableProducts: number;
    unavailableProducts: number;
    providersCount: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
  }> {
    this.logger.log('Calculating product statistics');

    const [totalProducts, availableProducts, unavailableProducts, providers] = await Promise.all([
      this.dataServices.products.getCount(),
      this.dataServices.products.getCount({ availability: true } as any),
      this.dataServices.products.getCount({ availability: false } as any),
      this.dataServices.providers.getAll(100, 1),
    ]);

    const allProducts = await this.dataServices.products.getAll(1000, 1);
    const prices = allProducts.items.map(p => Number(p.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return {
      totalProducts,
      availableProducts,
      unavailableProducts,
      providersCount: providers.total,
      averagePrice: Number(averagePrice.toFixed(2)),
      priceRange: { min: minPrice, max: maxPrice },
    };
  }
}
