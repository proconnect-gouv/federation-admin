import { IsString, IsDate, IsInt } from 'class-validator';

export class MetricDto {
  @IsDate()
  readonly date: Date;

  @IsString()
  readonly key: string;

  @IsString()
  readonly range: string;

  @IsInt()
  readonly value: number;
}
