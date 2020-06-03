import { IsArray, IsNumber } from 'class-validator';

export class EventMetaDTO {
  @IsNumber()
  readonly total: number;
  @IsArray()
  readonly fsList: string[];
  @IsArray()
  readonly fsLabelList: string[];
  @IsArray()
  readonly fiList: string[];
  @IsArray()
  readonly actionList: string[];
  @IsArray()
  readonly typeActionList: string[];
}
