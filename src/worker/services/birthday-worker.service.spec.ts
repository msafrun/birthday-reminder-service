import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment from 'moment-timezone';
import { BirthdayWorkerService } from './birthday-worker.service';
import { sendBirthdayEmail } from '../utils/birthday-worker.util';

jest.mock('../utils/birthday-worker.util', () => ({
  sendBirthdayEmail: jest.fn(),
}));

describe('BirthdayWorkerService (Worker)', () => {
  let service: BirthdayWorkerService;
  let userModel: Model<any>;

  const mockUserModel = {
    find: jest.fn(),
  };

  const mockUsers = [
    {
      email: 'test@example.com',
      timezone: 'Asia/Jakarta',
      birthday: '1995-03-01',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirthdayWorkerService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<BirthdayWorkerService>(BirthdayWorkerService);
    userModel = module.get<Model<any>>(getModelToken('User'));

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should send birthday email when time is 09:00 and birthday matches', async () => {
    mockUserModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUsers),
    });

    const fakeNow = moment.tz('2026-03-01 02:00', 'UTC');

    jest.spyOn(moment, 'utc').mockReturnValue(fakeNow);

    (sendBirthdayEmail as jest.Mock).mockResolvedValue(true);

    const loggerSpy = jest.spyOn(service['logger'], 'log');

    await service.checkAndSendBirthdayMessages();

    expect(sendBirthdayEmail).toHaveBeenCalledWith(mockUsers[0]);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Birthday message sent'),
    );
  });

  it('should NOT send email if time is not 09:00', async () => {
    mockUserModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUsers),
    });

    const fakeNow = moment.tz('2026-03-01 01:00', 'UTC');

    jest.spyOn(moment, 'utc').mockReturnValue(fakeNow);

    await service.checkAndSendBirthdayMessages();

    expect(sendBirthdayEmail).not.toHaveBeenCalled();
  });

  it('should NOT send email if birthday does not match', async () => {
    const usersWithDifferentBirthday = [
      {
        email: 'test@example.com',
        timezone: 'Asia/Jakarta',
        birthday: '1995-04-01',
      },
    ];

    mockUserModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(usersWithDifferentBirthday),
    });

    const fakeNow = moment.tz('2026-03-01 02:00', 'UTC');
    jest.spyOn(moment, 'utc').mockReturnValue(fakeNow);

    await service.checkAndSendBirthdayMessages();

    expect(sendBirthdayEmail).not.toHaveBeenCalled();
  });

  it('should log error if exception occurs', async () => {
    mockUserModel.find.mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error('DB error')),
    });

    const errorSpy = jest.spyOn(service['logger'], 'error');

    await service.checkAndSendBirthdayMessages();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Birthday check failed'),
    );
  });
});
