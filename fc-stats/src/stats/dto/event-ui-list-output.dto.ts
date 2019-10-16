import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { EventUIListInputDTO } from './event-ui-list-input.dto';
import { EventDTO } from './event.dto';
import { EventMetaDTO } from './event-meta.dto';

export class EventUIListOutputDTO {
  @ValidateNested()
  readonly params: EventUIListInputDTO;

  @IsOptional()
  @IsArray()
  readonly stats?: EventDTO[];

  @IsOptional()
  @IsArray()
  readonly meta?: EventMetaDTO;
}
