import { IsString, IsIn } from 'class-validator';
import { BaseNestedDTO } from './stats-api-nested-base.dto';

export class FilterParamDTO extends BaseNestedDTO {
  static parse(input) {
    const [key, value] = input.split(':');

    return new FilterParamDTO({ key, value });
  }

  @IsString()
  key: string;

  @IsString()
  value: string;
}
