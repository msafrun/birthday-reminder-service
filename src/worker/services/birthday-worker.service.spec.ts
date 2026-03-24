import { Test, TestingModule } from '@nestjs/testing';
import { BirthdayWorkerService } from './birthday-worker.service';

describe('BirthdayWorkerService', () => {
  let service: BirthdayWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BirthdayWorkerService],
    }).compile();

    service = module.get<BirthdayWorkerService>(BirthdayWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
