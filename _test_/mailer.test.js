import nodemailer from 'nodemailer';
import { sendRegistrationEmail } from '../src/api'; // Assuming mailer.js is in src/mailer.js

jest.mock('nodemailer');
const sendMailMock = jest.fn();

nodemailer.createTransport.mockReturnValue({
  sendMail: sendMailMock,
});

describe('Email Notification System', () => {
  it('should send an email after user registration', async () => {
    const user = { email: 'testuser@example.com', name: 'Test User' };
    await sendRegistrationEmail(user);

    expect(sendMailMock).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: user.email,
        subject: 'Welcome!',
      })
    );
  });
});
