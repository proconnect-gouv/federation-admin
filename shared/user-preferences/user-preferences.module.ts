import { ConfigService } from 'nestjs-config';
import { Module, DynamicModule } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { InstanceService } from '@fc/shared/utils';
import { UserPreferencesService } from './user-preferences.service';

@Module({})
export class UserPreferencesModule {
  static RABBIT_CLASS_SUFFIX = 'broker';

  private static factory(clientName: string, config: ConfigService) {
    const options = config.get(clientName);
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options,
    });
  }

  static registerFor(moduleName: string): DynamicModule {
    const clientName = `${moduleName}-${UserPreferencesModule.RABBIT_CLASS_SUFFIX}`;
    const BrokerProvider = {
      provide: clientName,
      useFactory: UserPreferencesModule.factory.bind(null, clientName),
      inject: [ConfigService],
    };

    return {
      module: UserPreferencesModule,
      providers: [BrokerProvider, UserPreferencesService, InstanceService],
      exports: [BrokerProvider, UserPreferencesService, InstanceService],
    };
  }
}
