/**
 * Abstract base class for all provider services
 * Defines the contract that all provider services must implement
 */
export abstract class ProviderService {
  /**
   * Fetches products from the provider
   * @returns Promise that resolves to an array of products
   */
  abstract getProducts(): Promise<any[]>;

  /**
   * Performs a health check on the provider
   * @returns Promise that resolves to true if provider is healthy, false otherwise
   */
  abstract healthCheck(): Promise<boolean>;
}
