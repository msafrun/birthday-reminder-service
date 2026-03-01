import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDTO, UpdateUserDTO } from './dto/user.dto';
import moment from 'moment-timezone';
import { sendBirthdayEmail } from './utils/user.util';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDTO) {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      if (error?.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new HttpException(messages.join(', '), HttpStatus.BAD_REQUEST);
      }

      if (error?.code === 11000) {
        throw new HttpException(
          error?.errorResponse?.errmsg,
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string) {
    const getUser = await this.userModel.findById(id);
    if (!getUser)
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND);

    return getUser;
  }

  async update(id: string, updateUserDto: UpdateUserDTO) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
    );

    if (!updatedUser)
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND);

    return updatedUser;
  }

  async remove(id: string) {
    return await this.userModel.findByIdAndDelete(id);
  }

  async handleBirthdayMessages() {
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
