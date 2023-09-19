import { IsNumber } from 'class-validator';

export class RectifyResponseCodesDTO {
  @IsNumber()
  readonly error: number;

  @IsNumber()
  readonly found: number;

  @IsNumber()
  readonly rectified: number;
}
