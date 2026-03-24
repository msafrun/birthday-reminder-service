import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';
import { Logger } from '@nestjs/common';
import { UserDocument } from '../../shared/schemas/user.schema';

dotenv.config();

const logger = new Logger('UserUtil');

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: ['true', true].includes(process.env.SMTP_SECURE!),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from:
    process.env.SMTP_FROM || 'Birthday Reminder <noreply@birthdayreminder.com>',
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });
};

const getBirthdayEmailText = (name: string): string => {
  return `
    Happy Birthday ${name}! 🎉
    
    Dear ${name},
    
    On behalf of the entire team, we wish you a fantastic birthday filled with joy, laughter, and wonderful moments!
    
    May your day be as special as you are!
    
    Best regards,
    Birthday Reminder Team
  `;
};

const getBirthdayEmailHTML = (name: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 36px;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .birthday-message {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .emoji {
          font-size: 48px;
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎂 Happy Birthday! 🎉</h1>
      </div>
      
      <div class="content">
        <div class="emoji">
          🎈 🎁 🎊
        </div>
        
        <div class="birthday-message">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>On behalf of the entire team, we wish you a fantastic birthday filled with joy, laughter, and wonderful moments!</p>
          
          <p>May your day be as special as you are!</p>
          
          <p style="margin-top: 30px;">
            Warmest wishes,<br>
            <strong>Birthday Reminder Team</strong>
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p>This email was sent automatically based on your birthday preferences.</p>
        <p>© ${new Date().getFullYear()} Birthday Reminder. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

export async function sendBirthdayEmail(user: UserDocument): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: emailConfig.from,
      to: user.email,
      subject: `🎉 Happy Birthday, ${user.name}! 🎂`,
      text: getBirthdayEmailText(user.name),
      html: getBirthdayEmailHTML(user.name),
    };

    const info = await transporter.sendMail(mailOptions);

    logger.log({
      message: 'Birthday email sent successfully',
      to: user.email,
      name: user.name,
      messageId: info.messageId,
    });

    return true;
  } catch (error) {
    logger.error({
      message: 'Failed to send birthday email',
      to: user.email,
      name: user.name,
      error: error.message,
    });

    return false;
  }
}
