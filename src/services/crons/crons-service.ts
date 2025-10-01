import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  CronLogRefPrefix,
  CronLogStatus,
  CronLogType,
} from '@enums';
import {
  CronLogUseCases,
} from '@useCases';
import { ConfigService } from '@config';
import { CronLogResult } from '@types';

@Injectable()
export class CronsService {
  private readonly logger = new Logger(CronsService.name);
  private readonly MAX_RETRIES = 2;

  /**
   * Constructor for CronsService
   * @param cronLogUseCases Use cases for cron logs
   * @param slackService Service for Slack notifications
   */
  constructor(
    private readonly cronLogUseCases: CronLogUseCases,
  ) {}

  /**
   * Cron job to aggregate product data from all providers
   */
  @Cron('*/30 * * * * *')
  async productAggregationCron() {
    const cronLogType = CronLogType.PRODUCT_AGGREGATION;
    const logId = `${CronLogRefPrefix.PRODUCT_AGGREGATION}_${new Date().toISOString()}`;
    
    try {
      await this.processCronJob(cronLogType, null, logId);
      this.logger.log('Product aggregation completed successfully');
    } catch (error) {
      this.logger.error('Product aggregation failed', error);
    }
  }

  /**
   * Processes a cron job
   * @param cronLogType Type of cron log
   * @param jobInput Input for the cron job
   * @param logId ID of the cron log
   */
  async processCronJob(
    cronLogType: CronLogType,
    jobInput: any,
    logId: string,
  ): Promise<{
    result: CronLogResult;
    isExhausted: boolean;
  }> {
    const existingLog = await this.cronLogUseCases.getOne(logId);
    const retryCount = existingLog?.retryCount || 0;
    if (this.maxRetriesExceeded(retryCount)) {
      return {
        result: existingLog?.result as any,
        isExhausted: true,
      };
    }

    const input = jobInput || (existingLog?.result as any)?.input;
    let result: CronLogResult;
    if (existingLog) {
      if (existingLog?.status === CronLogStatus.SUCCESS) return;
      result = await this.cronLogUseCases.delegateToProcessor(
        cronLogType,
        input,
        existingLog.id,
        retryCount,
      );
      return { result, isExhausted: false };
    }
    result = await this.cronLogUseCases.delegateToProcessor(
      cronLogType,
      jobInput,
      logId,
      retryCount,
    );
    return { result, isExhausted: false };
  }

  /**
   * Checks if the retry count has exceeded the maximum allowed retries
   * @param retryCount Retry count for the cron job
   * @returns True if the retry count has exceeded the maximum allowed retries, false otherwise
   */
  maxRetriesExceeded(retryCount: number): boolean {
    return retryCount >= this.MAX_RETRIES;
  }
}
