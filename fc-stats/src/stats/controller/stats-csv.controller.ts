import {
  Controller,
  Get,
  Res,
  Query,
  Header,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StatsService } from '../service/stats.service';
import { StatsCSVListInputDTO } from '../dto/stats-csv-list-input.dto';
import { StatsServiceParams } from '../interfaces/stats-service-params.interface';
import { CsvService } from '../service/csv.service';
import { Roles } from '@fc/shared/authentication/decorator/roles.decorator';
import { UserRole } from '@fc/shared/user/roles.enum';
import * as moment from 'moment';

@Controller()
export class StatsCSVController {
  constructor(
    private readonly statsService: StatsService,
    private readonly csvService: CsvService,
  ) {}

  @Get('events/csv')
  @Roles(UserRole.OPERATOR)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=stats.csv')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  list(@Query() query: StatsCSVListInputDTO, @Res() res) {
    // Get data
    const statsStream = this.statsService.streamEvents(
      query as StatsServiceParams,
    );

    this.stream(res, statsStream);
  }

  private stream(res, dataStream) {
    const csvStringifier = this.csvService.getStringifier({
      header: true,
      columns: [
        { key: 'date', header: 'Date' },
        { key: 'fi', header: 'FI' },
        { key: 'fs', header: 'FS' },
        { key: 'action', header: 'Catégorie' },
        { key: 'typeAction', header: 'Événement' },
        { key: 'count', header: 'Compteur' },
      ],
    });
    csvStringifier.setEncoding('utf-8');
    csvStringifier.on('data', data => res.write(data));
    csvStringifier.on('end', res.end);

    dataStream
      .on('data', data => this.sendData(csvStringifier, data))
      .on('end', () => {
        csvStringifier.emit('end');
      });
  }

  private sendData(writeStream, data) {
    writeStream.write(this.formatEvent(data));
  }

  private formatEvent(event) {
    return Object.assign({}, event, {
      date: moment(event.date).format('DD/MM/YYYY'),
    });
  }
}
