import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users/users.service';

@Injectable()
export class SchedularsService {
  private readonly logger = new Logger(SchedularsService.name);
  constructor(
    @Inject(UsersService)
    private readonly userService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  handleCronBirthdayMessages() {
    this.logger.debug('Called every minutes');
    this.userService.handleBirthdayMessages();
  }
}
