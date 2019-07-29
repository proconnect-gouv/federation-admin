import { IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class StatsAPITotalActionInputDTO {
  @IsString()
  readonly action: string;

  @IsDate()
  @Type(
    /* istanbul ignore next */
    () => Date,
  )
  readonly start: Date;

  @IsDate()
  @Type(
    /* istanbul ignore next */
    () => Date,
  )
  readonly stop: Date;
}
