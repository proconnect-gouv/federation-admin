import { IsArray, IsNumber } from 'class-validator';

/**
 * Metadatas surrouding a metric request response
 */
export class MetricMetaDTO {
  /**
   * Total number of results available
   */
  @IsNumber()
  readonly total: number;

  /**
   * List of availables 'key'
   */
  @IsArray()
  readonly keyList: string[];

  /**
   * List of availables 'range'
   */
  @IsArray()
  readonly rangeList: string[];
}
