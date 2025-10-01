import { ActionResult, sortOptions } from "@types";

export abstract class IGenericRepository<T> {
  abstract getAll(
    limit?: number,
    page?: number,
    sortOptions?: sortOptions<T>,
  ): Promise<{ items: T[]; total: number }>;
  abstract getOneBy(findOptions: Partial<T>): Promise<T>;
  abstract getAllBy(
    findOptions: Partial<T>,
    limit: number,
    page: number,
    sortOptions?: sortOptions<T>,
  ): Promise<{ items: T[]; total: number }>;
  abstract create(item: T): Promise<T>;
  abstract update(
    findOptions: Partial<T>,
    updates: Partial<T>,
  ): Promise<ActionResult>;
  abstract getCount(whereOptions?: Partial<T>): Promise<number>;
}
