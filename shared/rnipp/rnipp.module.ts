import { HttpModule, Module } from '@nestjs/common';
import { RnippController } from './rnipp.controller';
import { RnippService } from './rnipp.service';
import { HttpConfigService } from '@fc/shared/config/http.service';
import { RnippSerializer } from './rnipp-serializer.service';
import * as xml2js from 'xml2js';
import { TraceService } from '@fc/shared/logger/trace.service';
import { CitizenServiceBase } from '@fc/shared/citizen/citizen-base.service';
import * as crypto from 'crypto';

const cryptoProvider = {
  provide: 'cryptoProvider',
  useValue: crypto,
};

const xmlProvider = {
  provide: 'Xml2js',
  useValue: xml2js,
};

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  controllers: [RnippController],
  providers: [
    RnippService,
    HttpConfigService,
    RnippSerializer,
    xmlProvider,
    TraceService,
    cryptoProvider,
    CitizenServiceBase,
  ],
})
export class RnippModule {}
