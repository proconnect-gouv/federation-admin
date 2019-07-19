import { IsString, IsDate, IsInt } from 'class-validator';

export class StatsDTO {
  @IsString()
  readonly id: string;

  @IsString()
  readonly fs: string;

  @IsString()
  readonly fi: string;

  @IsString()
  readonly typeAction: string;

  @IsString()
  readonly action: string;

  @IsDate()
  readonly date: Date;

  @IsInt()
  readonly count: Number;
}
