import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IGenericRepository } from '@abstracts';
import { ActionResult, sortOptions } from '@types';

/**
 * Generic Prisma repository implementation
 * Implements only the methods defined in IGenericRepository interface
 * and those actually used in the application use-cases
 */
@Injectable()
export class PrismaRepository<T> implements IGenericRepository<T> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly model: string,
  ) {}

  /**
   * Get all records with optional pagination and sorting
   */
  async getAll(
    limit?: number,
    page?: number,
    sortOptions?: sortOptions<T>,
  ): Promise<{ items: T[]; total: number }> {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    const [items, total] = await Promise.all([
      (this.prisma as any)[this.model].findMany({
        skip,
        take,
        orderBy: sortOptions,
      }),
      (this.prisma as any)[this.model].count(),
    ]);

    return { items, total };
  }

  /**
   * Get a single record by criteria
   */
  async getOneBy(findOptions: Partial<T>): Promise<T> {
    return (this.prisma as any)[this.model].findFirst({
      where: findOptions,
    });
  }

  /**
   * Get all records matching criteria with pagination and sorting
   */
  async getAllBy(
    findOptions: Partial<T>,
    limit: number,
    page: number,
    sortOptions?: sortOptions<T>,
  ): Promise<{ items: T[]; total: number }> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      (this.prisma as any)[this.model].findMany({
        where: findOptions,
        skip,
        take: limit,
        orderBy: sortOptions,
      }),
      (this.prisma as any)[this.model].count({
        where: findOptions,
      }),
    ]);

    return { items, total };
  }

  /**
   * Create a new record
   */
  async create(item: T): Promise<T> {
    return (this.prisma as any)[this.model].create({
      data: item,
    });
  }

  /**
   * Update records matching criteria
   */
  async update(
    findOptions: Partial<T>,
    updates: Partial<T>,
  ): Promise<ActionResult> {
    const result = await (this.prisma as any)[this.model].updateMany({
      where: findOptions,
      data: updates,
    });

    return {
      success: result.count > 0,
      message: result.count > 0 ? 'Record updated successfully' : 'Record not updated',
      data: result.count,
    };
  }

  /**
   * Get count of records matching criteria
   */
  async getCount(whereOptions?: Partial<T>): Promise<number> {
    return (this.prisma as any)[this.model].count({
      where: whereOptions,
    });
  }
}
