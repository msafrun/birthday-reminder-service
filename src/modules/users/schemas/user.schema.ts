import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address',
    },
  })
  email: string;

  @Prop({
    required: true,
    validate: {
      validator: function (v: Date) {
        return v instanceof Date && !isNaN(v.getTime());
      },
      message: 'Birthday must be a valid ISO 8601 date',
    },
  })
  birthday: Date;

  @Prop({
    required: true,
    validate: {
      validator: function (v: string) {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: v });
          return true;
        } catch (e) {
          return false;
        }
      },
      message: 'Please provide a valid IANA timezone',
    },
  })
  timezone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
