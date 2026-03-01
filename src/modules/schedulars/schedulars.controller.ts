import { Controller } from '@nestjs/common';
import { SchedularsService } from './schedulars.service';

@Controller('schedulars')
export class SchedularsController {
  constructor(private readonly schedularsService: SchedularsService) {}
}
