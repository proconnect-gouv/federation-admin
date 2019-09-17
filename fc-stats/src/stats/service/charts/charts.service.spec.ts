import { Test, TestingModule } from '@nestjs/testing';
import { ChartsService } from './charts.service';

describe('ChartsService', () => {
  let service: ChartsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartsService],
    }).compile();

    service = module.get<ChartsService>(ChartsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a transformEsData', () => {
    expect(service.transformEsData).toBeDefined();
  });

  it('should have a transformTimestampToSelectedTime', () => {
    expect(service.transformTimestampToSelectedTime).toBeDefined();
  });

  describe('transformEsValuesToChartValues', () => {
    it('should have a transformEsValuesToChartValues', () => {
      expect(service.transformEsValuesToChartValues).toBeDefined();
    });

    it('should return a datasets array ready to be pass to chartjs', () => {
      // Setup
      const esValues = [
        [
          { label: 'rnippcheck', count: 30 },
          { label: 'checkedtoken', count: 16 },
        ],
        [
          { label: 'authentication', count: 26 },
          { label: 'checkedtoken', count: 22 },
        ],
      ];

      // Action
      const action = service.transformEsValuesToChartValues(esValues);

      // expected
      expect(action).toBeInstanceOf(Array);
      expect(action.length).toEqual(3);
      action.forEach(entry => {
        expect(typeof entry.label).toBe('string');
        expect(entry.data).toBeInstanceOf(Array);
      });
    });
  });
});
