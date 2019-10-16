import { IsString, IsDate, IsInt } from 'class-validator';

export class MetricDTO {
  @IsString()
  readonly id: string;

  @IsDate()
  readonly date: Date;

  @IsString()
  readonly key: string;

  @IsString()
  readonly range: string;

  @IsInt()
  readonly value: number;
}
