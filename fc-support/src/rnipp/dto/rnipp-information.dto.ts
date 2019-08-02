import { IsString, IsNumber } from 'class-validator';

export class RnippInformation {
  @IsNumber()
  public code: number;

  @IsString()
  public raw: string;
}
