import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { User } from '../../shared/schemas/user.schema';
import moment from 'moment-timezone';
import { sendBirthdayEmail } from '../utils/birthday-worker.util';

@Injectable()
export class BirthdayWorkerService {
  private readonly logger = new Logger(BirthdayWorkerService.name);
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkAndSendBirthdayMessages() {
    try {
      const users = await this.userModel.find().exec();
      const now = moment.utc();

      for (const user of users) {
        const userLocalTime = now.clone().tz(user.timezone);
        if (userLocalTime.hour() === 9 && userLocalTime.minute() === 0) {
          const today = userLocalTime.format('MM-DD');
          const birthday = moment(user.birthday)
            .tz(user.timezone)
            .format('MM-DD');

          if (today === birthday) {
            const sent = await sendBirthdayEmail(user);
            this.logger.log(
              `Birthday message sent to ${user.email}, status: ${sent ? 'sent' : 'failed'}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(`Birthday check failed: ${error.message}`);
    }
  }
}
