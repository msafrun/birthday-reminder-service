import { Module } from '@nestjs/common';
import { SchedularsService } from './schedulars.service';
import { SchedularsController } from './schedulars.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [SchedularsController],
  providers: [SchedularsService],
})
export class SchedularsModule {}
