import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { MetricUIListInputDTO } from './metric-ui-list-input.dto';
import { MetricDTO } from './metric.dto';
import { MetricMetaDTO } from './metric-meta.dto';

export class MetricUIListOutputDTO {
  @ValidateNested()
  readonly params: MetricUIListInputDTO;

  @IsOptional()
  @IsArray()
  readonly stats?: MetricDTO[];

  @IsOptional()
  @IsArray()
  readonly meta?: MetricMetaDTO;
}
