import {
  Injectable,
  HttpModuleOptionsFactory,
  HttpModuleOptions,
} from '@nestjs/common';
import { InjectConfig, ConfigService } from 'nestjs-config';
import * as https from 'https';
import * as fs from 'fs';
import { HeadersOptions } from 'src/rnipp/interface/headers.interface';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  public constructor(@InjectConfig() private readonly config: ConfigService) {}

  createHttpOptions(): HttpModuleOptions {
    const headers: HeadersOptions = {
      userId: this.config.get('rnipp').userId,
      clientSiret: this.config.get('rnipp').clientSiret,
    };
    const httpAgentConfig = this.config.get('rnipp').httpsAgentConfig;

    if (httpAgentConfig.key || httpAgentConfig.cert) {
      if (httpAgentConfig.ca) {
        httpAgentConfig.ca = fs.readFileSync(httpAgentConfig.ca);
      }

      httpAgentConfig.key = fs.readFileSync(httpAgentConfig.key);
      httpAgentConfig.cert = fs.readFileSync(httpAgentConfig.cert);
    }

    return {
      headers,
      httpsAgent: new https.Agent(httpAgentConfig),
    };
  }
}
