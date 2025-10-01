import { CronLogType } from '@enums';

export type CronLogResult = {
  success: boolean;
  message: string;
  data?: any;
  input?: any;
  output?: any;
};

export type ExhaustedCronJob = {
  type: CronLogType;
  logId: string;
  result: CronLogResult;
};
