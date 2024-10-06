import { Test, TestingModule } from '@nestjs/testing';
import { OandaService } from './oanda.service';

describe('OandaService', () => {
  let service: OandaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OandaService],
    }).compile();

    service = module.get<OandaService>(OandaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
