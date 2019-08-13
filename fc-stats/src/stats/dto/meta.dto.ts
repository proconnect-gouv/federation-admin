import { IsArray, IsNumber } from 'class-validator';

export class MetaDTO {
  @IsNumber()
  readonly total: number;
  @IsArray()
  readonly fsList: string[];
  @IsArray()
  readonly fiList: string[];
  @IsArray()
  readonly actionList: string[];
  @IsArray()
  readonly typeActionList: string[];
}
