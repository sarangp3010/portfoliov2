import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { adminEmailTemplate, confirmationEmailTemplate, InquiryData } from '../templates/email.js';

const createTransport = () => nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: { user: config.smtp.user, pass: config.smtp.pass },
});

export const sendInquiryEmails = async (data: InquiryData): Promise<void> => {
  if (!config.smtp.user) {
    logger.warn('SMTP not configured — skipping email delivery');
    return;
  }
  const transport = createTransport();
  await Promise.all([
    transport.sendMail({
      from: config.smtp.from,
      to: config.smtp.adminEmail,
      subject: `[Portfolio Inquiry] ${data.subject} — from ${data.name}`,
      html: adminEmailTemplate(data),
    }),
    transport.sendMail({
      from: config.smtp.from,
      to: data.email,
      subject: `Your message is received — I'll be in touch soon!`,
      html: confirmationEmailTemplate(data),
    }),
  ]);
  logger.info(`Inquiry emails sent to admin and ${data.email}`);
};

export const verifySmtp = async (): Promise<void> => {
  if (!config.smtp.user) return;
  try {
    await createTransport().verify();
    logger.info('SMTP connection verified');
  } catch (err) {
    logger.warn('SMTP verification failed — emails will not be sent', err);
  }
};

// Generic email sender for customer portal notifications
export const emailService = {
  async sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
    if (!config.smtp.user || !to) {
      logger.warn(`Email not sent (SMTP not configured or missing recipient): ${subject}`);
      return;
    }
    try {
      const transport = createTransport();
      await transport.sendMail({ from: config.smtp.from, to, subject, html });
      logger.info(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      logger.error(`Email send failed to ${to}:`, err);
    }
  },
};
