import { HttpModule, Module } from '@nestjs/common';
import { RnippController } from './rnipp.controller';
import { RnippService } from './rnipp.service';
import { HttpConfigService } from '@fc/shared/config/http.service';
import { RnippSerializer } from './rnippSerializer.service';
import * as xml2js from 'xml2js';
import { TraceService } from '@fc/shared/logger/trace.service';
import { CitizenModule } from '@fc/shared/citizen/citizen.module';

const xmlProvider = {
  provide: 'Xml2js',
  useValue: xml2js,
};

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
    CitizenModule,
  ],
  controllers: [RnippController],
  providers: [
    RnippService,
    HttpConfigService,
    RnippSerializer,
    xmlProvider,
    TraceService,
  ],
})
export class RnippModule {}
