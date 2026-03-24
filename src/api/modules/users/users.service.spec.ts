import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../../shared/schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    birthday: '1995-06-10',
    timezone: 'Asia/Jakarta',
  };

  const mockUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    birthday: '1995-06-10',
    timezone: 'Asia/Jakarta',
  };

  const mockUserInstance = {
    save: jest.fn(),
  };

  const mockUserModel: any = jest
    .fn()
    .mockImplementation(() => mockUserInstance);

  mockUserModel.findById = jest.fn();
  mockUserModel.findByIdAndUpdate = jest.fn();
  mockUserModel.findByIdAndDelete = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      mockUserInstance.save.mockResolvedValue(mockUser);

      const result = await service.create(mockUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserInstance.save).toHaveBeenCalled();
    });

    it('should throw HttpException when validation fails', async () => {
      const validationError: any = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Please provide a valid email address' },
        },
      };

      mockUserInstance.save.mockRejectedValue(validationError);

      await expect(service.create(mockUserDto)).rejects.toThrow(HttpException);
      await expect(service.create(mockUserDto)).rejects.toThrow(
        'Please provide a valid email address',
      );
    });

    it('should throw HttpException when duplicate email', async () => {
      const duplicateError: any = {
        code: 11000,
        errorResponse: {
          errmsg: 'Duplicate key error',
        },
      };

      mockUserInstance.save.mockRejectedValue(duplicateError);

      await expect(service.create(mockUserDto)).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      mockUserInstance.save.mockRejectedValue(new Error('Unknown error'));

      await expect(service.create(mockUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should find and return a user by id', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser._id);

      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });

    it('should throw HttpException when user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.findOne(mockUser._id)).rejects.toThrow(
        HttpException,
      );
      await expect(service.findOne(mockUser._id)).rejects.toThrow(
        'User not found!',
      );

      try {
        await service.findOne(mockUser._id);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      mockUserModel.findById.mockRejectedValue(dbError);

      await expect(service.findOne(mockUser._id)).rejects.toThrow(dbError);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated Name' };

    it('should update and return the user', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser._id, updateDto);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        updateDto,
        { returnDocument: 'after', runValidators: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw HttpException when user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update(mockUser._id, updateDto)).rejects.toThrow(
        'User not found!',
      );
    });

    it('should throw HttpException when duplicate email', async () => {
      const duplicateError: any = {
        code: 11000,
        errorResponse: { errmsg: 'Duplicate key error' },
      };

      mockUserModel.findByIdAndUpdate.mockRejectedValue(duplicateError);

      await expect(service.update(mockUser._id, updateDto)).rejects.toThrow(
        'Duplicate key error',
      );
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      mockUserModel.findByIdAndUpdate.mockRejectedValue(
        new Error('Unknown error'),
      );

      await expect(service.update(mockUser._id, updateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should delete and return the user', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await service.remove(mockUser._id);

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockUser._id,
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(null);

      const result = await service.remove('nonexistent-id');
      expect(result).toBeNull();
    });
  });
});
