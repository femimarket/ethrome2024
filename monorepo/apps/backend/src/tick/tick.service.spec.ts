import { Test, TestingModule } from '@nestjs/testing';
import { TickService } from './tick.service';

describe('TickService', () => {
  let service: TickService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TickService],
    }).compile();

    service = module.get<TickService>(TickService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
