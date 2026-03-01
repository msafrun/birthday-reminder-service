import { Test, TestingModule } from '@nestjs/testing';
import { SchedularsService } from './schedulars.service';

describe('SchedularsService', () => {
  let service: SchedularsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchedularsService],
    }).compile();

    service = module.get<SchedularsService>(SchedularsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
