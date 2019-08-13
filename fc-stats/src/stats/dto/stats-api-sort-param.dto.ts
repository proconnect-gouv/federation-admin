import { IsString, IsIn } from 'class-validator';
import { BaseNestedDTO } from './stats-api-nested-base.dto';

export class SortParamDTO extends BaseNestedDTO {
  static parse(input) {
    const [column, dir] = input.split(':');

    return new SortParamDTO({ column, dir });
  }

  @IsString()
  column: string;

  @IsIn(['asc', 'desc'])
  dir: string;
}
