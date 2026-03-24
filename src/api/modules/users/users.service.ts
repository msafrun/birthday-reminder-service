import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDTO, UpdateUserDTO } from './dto/user.dto';
import { User } from '../../../shared/schemas/user.schema';

@Injectable()
export class UsersService {
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
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { returnDocument: 'after', runValidators: true },
      );

      if (!updatedUser) throw new NotFoundException();

      return updatedUser;
    } catch (error) {
      if (error?.code === 11000) {
        throw new HttpException(
          error?.errorResponse?.errmsg,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error?.status === HttpStatus.NOT_FOUND) {
        throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
      }

      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    return await this.userModel.findByIdAndDelete(id);
  }
}
