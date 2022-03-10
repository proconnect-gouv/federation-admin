import { ConfigService, InjectConfig } from 'nestjs-config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InstanceService {
  constructor(@InjectConfig() private readonly configService: ConfigService) {}

  async isFca() {
    const { instanceFor } = await this.configService.get('app');
    return instanceFor === 'FCA';
  }

  async isFcp() {
    const { instanceFor } = await this.configService.get('app');
    return instanceFor === 'FCP';
  }

  async isFc() {
    const { instanceFor } = await this.configService.get('app');
    return instanceFor === 'FC';
  }
}
