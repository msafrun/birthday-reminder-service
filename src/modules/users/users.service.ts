import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDTO, UpdateUserDTO } from './dto/user.dto';

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

  findAll() {
    return `This action returns all users`;
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
}
