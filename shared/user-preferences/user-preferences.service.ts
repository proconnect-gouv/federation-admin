import { ConfigService } from 'nestjs-config';
import { timeout } from 'rxjs/operators';
import { InstanceService } from '@fc/shared/utils';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserPreferencesFailureException } from './user-preferences.failure.exception';
import { IFormattedIdpSettings } from './formatted-idp-settings.interface';

@Injectable()
export class UserPreferencesService {
  constructor(
    private readonly config: ConfigService,
    @Inject('preferences-broker') private readonly broker: ClientProxy,
    private readonly instanceService: InstanceService,
  ) {}

  async onModuleInit() {
    if (this.instanceService.isCl()) {
      await this.broker.connect();
    }
  }

  onModuleDestroy() {
    if (this.instanceService.isCl()) {
      this.broker.close();
    }
  }

  async publish(command: string, payload): Promise<IFormattedIdpSettings> {
    const { requestTimeout } = this.config.get('preferences-broker');

    return new Promise((resolve, reject) => {
      // Build callbacks
      const success = this.success.bind(this, resolve, reject);
      const failure = this.failure.bind(this, reject);
      this.broker
        .send(command, payload)
        .pipe(timeout(requestTimeout))
        .subscribe(success, failure);
    });
  }

  private success(resolve, reject, response) {
    if (response === 'ERROR') {
      return this.failure(
        reject,
        new Error(
          'Received error from consumer. Check consumer logs for more infos',
        ),
      );
    }
    resolve(response);
  }

  private failure(reject, error) {
    reject(new UserPreferencesFailureException(error));
  }
}
