import { Injectable } from '@nestjs/common';
import { CronLogStatus, CronLogType } from '@enums';
import { CronLogResult } from '@types';
import { CronLog } from '@prisma/client';

@Injectable()
export class CronLogFactory {
  /**
   * Generates a cron log entry
   * @param type The type of cron job
   * @param status Status of the cron job
   * @param result Result of the cron job
   * @param startTime Start time of the cron job
   * @param endTime End time of the cron job
   * @param id `id` of the log
   * @param retryCount Number of times the cron job has been retried
   * @param error error (if any)
   */
  generate(
    type: CronLogType,
    status: CronLogStatus,
    result: CronLogResult,
    startTime: Date,
    endTime: Date,
    id: string,
    retryCount?: number,
    error?: any,
  ): Partial<CronLog> {
    const cronRecord: Partial<CronLog> = {
      id: id,
      type: type,
      startTime: startTime,
      status: status,
      result: result as any,
      endTime: endTime,
      retryCount: retryCount,
      slackNotified: false,
    };
    
    if (result.success) {
      cronRecord.error = null;
    } else {
      cronRecord.error = error ?? result.message;
    }
    
    return cronRecord;
  }
}
