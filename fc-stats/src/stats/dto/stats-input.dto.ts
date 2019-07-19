import { IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class StatsInputDTO {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly start: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly stop: Date;
}
