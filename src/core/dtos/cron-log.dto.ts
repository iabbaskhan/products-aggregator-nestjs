import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CronLogType, CronLogStatus } from '@enums';

export class ListCronLogsDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(CronLogType)
  type?: CronLogType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(CronLogStatus)
  status?: CronLogStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['DESC', 'ASC'])
  orderBy?: 'DESC' | 'ASC';
}

export class ReprocessCronJobDTO {
  @ApiProperty({ enum: CronLogType })
  @IsNotEmpty()
  @IsEnum(CronLogType)
  type: CronLogType;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  input: any;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  retryCount: number;
}
