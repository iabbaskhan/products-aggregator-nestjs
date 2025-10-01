import { Product, Provider, PriceHistory, CronLog } from '@prisma/client';
import { IGenericRepository } from './generic-repository.abstract';

export abstract class IDataServices {
  abstract cronLog: IGenericRepository<CronLog>;
  abstract products: IGenericRepository<Product>;
  abstract providers: IGenericRepository<Provider>;
  abstract priceHistory: IGenericRepository<PriceHistory>;
}
