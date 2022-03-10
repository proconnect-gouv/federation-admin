import { ConfigService } from 'nestjs-config';
import { TestingModule, Test } from '@nestjs/testing';
import { InstanceService } from './instance.service';

describe('isFca', () => {
  let module: TestingModule;
  let service: InstanceService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    module = await Test.createTestingModule({
      imports: [],
      providers: [InstanceService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    service = await module.get<InstanceService>(InstanceService);
  });

  it('Should display true if we are in an AgentConnect instance', async () => {
    // Setup
    mockConfigService.get.mockReturnValue({
      instanceFor: 'FCA',
    });

    // Action
    const result = await service.isFca();

    // Expect
    expect(result).toBe(true);
  });

  it('Should display false if we are not in an AgentConnect instance', async () => {
    // Setup
    mockConfigService.get.mockReturnValue({
      instanceFor: 'FCP',
    });

    // Action
    const result = await service.isFca();

    // Expect
    expect(result).toBe(false);
  });

  it('Should display true if we are in an FranceConnect legacy instance', async () => {
    // Setup
    mockConfigService.get.mockReturnValue({
      instanceFor: 'FC',
    });

    // Action
    const result = await service.isFc();

    // Expect
    expect(result).toBe(true);
  });

  it('Should display false if we are not in an FranceConnect legacy instance', async () => {
    // Setup
    mockConfigService.get.mockReturnValue({
      instanceFor: 'FCA',
    });

    // Action
    const result = await service.isFc();

    // Expect
    expect(result).toBe(false);
  });

  it('Should display true if we are in an FranceConnect+ instance', async () => {
    // Setup
    mockConfigService.get.mockReturnValue({
      instanceFor: 'FCP',
    });

    // Action
    const result = await service.isFcp();

    // Expect
    expect(result).toBe(true);
  });

  it('Should display false if we are not in an FranceConnect+ instance', async () => {
    // Setup
    mockConfigService.get.mockReturnValue({
      instanceFor: 'FCA',
    });

    // Action
    const result = await service.isFcp();

    // Expect
    expect(result).toBe(false);
  });
});
