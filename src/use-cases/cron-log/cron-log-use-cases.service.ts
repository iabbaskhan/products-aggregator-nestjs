import { Injectable } from '@nestjs/common';
import { CronLogFactory } from './cron-log.factory';
import { CronLogStatus, CronLogType } from '@enums';
import { IDataServices } from '@abstracts';
import { CronLogResult } from '@types';
import { CronLog } from '@prisma/client';
import { ProductAggregatorUseCases } from '../product-aggregator/product-aggregator.use-cases.service';

@Injectable()
export class CronLogUseCases {

  constructor(
    private readonly dataServices: IDataServices,
    private readonly cronLogFactory: CronLogFactory,
    private readonly productAggregatorUseCases: ProductAggregatorUseCases,
  ) {}

  /**
   * Creates a new cron log in database
   * @param cronLog CronLog entity
   * @returns CronLog record from database
   */
  async create(cronLog: Partial<CronLog>): Promise<CronLog> {
    return this.dataServices.cronLog.create(cronLog as any);
  }

  /**
   * Searches and returns a `CronLog` record from database
   * @param id `id` of the `CronLog` to search for
   * @returns A promise which resolves to a `CronLog` record from database OR null
   */
  async getOne(id: string): Promise<CronLog> {
    return this.dataServices.cronLog.getOneBy({ id });
  }

  /**
   * Updates an existing cron log in database
   * @param id `id` of the cron log to update
   * @param updates Partial updates to be applied to the cron log
   * @returns A promise which resolves to the updated cron log record
   */
  async update(id: string, updates: Partial<CronLog>): Promise<any> {
    return this.dataServices.cronLog.update({ id }, updates);
  }

  /**
   * Searches for cron logs based on the provided search criteria.
   *
   * @param type - The type os the cron log to filter
   * @param status - The status of the cron log to filter.
   * @param limit - The maximum number of cron logs to retrieve.
   * @param page - The page number of the results.
   * @param orderBy - The order in which the results should be sorted. Defaults to 'DESC'.
   * @returns A promise that resolves to an object containing the retrieved cron logs and the total count.
   */
  async searchAll(
    type?: CronLogType,
    status?: CronLogStatus,
    limit?: number,
    page?: number,
    orderBy?: 'DESC' | 'ASC',
  ): Promise<{ items: CronLog[]; total: number }> {
    const filters: any = {};

    if (status) {
      filters.status = status;
    }

    if (type) {
      filters.type = type;
    }

    return this.dataServices.cronLog.getAllBy(filters, limit || 20, page || 1, {
      createdAt: orderBy === 'ASC' ? 'ASC' : 'DESC',
    });
  }

  /**
   * Processes a cron job by routing the provided `input` to it's correct processor based on `type`
   * @param type The type of the cron job, needed to route the input to correct processor
   * @param input The input for the cron job processor
   * @param logId `id` of the cron job (existing job or new one)
   * @param retryCount Number of times the cron job has been retried
   * @returns A promise which resolves to the newly created/updated cron log entry in database
   */
  async delegateToProcessor(
    type: CronLogType,
    input: any,
    logId?: string,
    retryCount?: number,
  ): Promise<CronLogResult> {
    const startTime = new Date();
    let result: CronLogResult;

    try {
      switch (type) {
        case CronLogType.PRODUCT_AGGREGATION:
          await this.productAggregatorUseCases.aggregateAllProviders();
          result = {
            success: true,
            message: 'Product aggregation completed successfully',
            data: null,
          };
          await this.saveCronResult(
            type,
            { ...result, input },
            startTime,
            logId,
            retryCount,
          );
          return result;
        default:
          throw new Error(`Invalid cron type provided: ${type}`);
      }
    } catch (err) {
      result = {
        success: false,
        message: `Cron job failed with error: ${err}`,
        data: null,
      };
      await this.saveCronResult(
        type,
        { ...result, input },
        startTime,
        logId,
        retryCount,
      );
      throw new Error(`Cron job failed with error: ${err}`);
    }
  }

  /**
   * Saves the result of a cron job by inserting/updating a cron log entry in database
   * @param cronType Type of cron
   * @param input Input provided to the cron processor e.g. overdue invoice data
   * @param jobResult Result returned by cron processor
   * @param startTime Time at which the cron job started processing
   * @param logId `id` of the cron job (existing job or new one)
   * @param retryCount Number of times the cron job has been retried
   */
  async saveCronResult(
    cronType: CronLogType,
    jobResult: CronLogResult,
    startTime: Date,
    logId?: string,
    retryCount?: number,
  ): Promise<CronLog> {
    const endTime = new Date();
    const jobStatus = this.getCronJobStatus(jobResult);
    const cronLog = this.cronLogFactory.generate(
      cronType,
      jobStatus,
      jobResult,
      startTime,
      endTime,
      logId,
      retryCount,
    );
    return this.create(cronLog);
  }

  /**
   * Returns the `status` of a cron log based on the `success` property in job's result
   * @param res Result of a job returned by a job's processor
   * @returns `CronLogStatus`
   */
  getCronJobStatus(res: CronLogResult): CronLogStatus {
    return res?.success ? CronLogStatus.SUCCESS : CronLogStatus.FAILED;
  }

  /**
   * Returns all failed product aggregation logs
   * @returns A promise that resolves to all failed product aggregation logs
   */
  async getAllFailedProductAggregations(): Promise<CronLog[]> {
    const queryResult = await this.dataServices.cronLog.getAllBy(
      {
        type: CronLogType.PRODUCT_AGGREGATION,
        status: CronLogStatus.FAILED,
      },
      500,
      1,
    );
    return queryResult.items;
  }
}
