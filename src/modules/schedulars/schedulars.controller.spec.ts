import { Test, TestingModule } from '@nestjs/testing';
import { SchedularsController } from './schedulars.controller';
import { SchedularsService } from './schedulars.service';

describe('SchedularsController', () => {
  let controller: SchedularsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedularsController],
      providers: [SchedularsService],
    }).compile();

    controller = module.get<SchedularsController>(SchedularsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
