import * as Brevo from '@getbrevo/brevo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private brevo: Brevo.BrevoClient;

  constructor(private readonly configService: ConfigService) {
    this.brevo = new Brevo.BrevoClient({
      apiKey: () => this.configService.get<string>('BREVO_API_KEY')!,
      maxRetries: 5,
    });
  }

  async sendMailRemindStreakUser(email: string) {
    const htmlContent = `
<div style="font-family: Arial, sans-serif; color: #202124; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a73e8; margin-bottom: 16px;">
    Keep Your Streak Alive!
  </h2>

  <p>Hi there,</p>

  <p>
    We noticed that you haven't studied today yet. Your learning streak is still alive,
    but it could be lost if you don't complete a study session before the day ends.
  </p>

  <div style="background: #f8f9fa; border-left: 4px solid #1a73e8; padding: 16px; margin: 24px 0;">
    <strong>Just a few minutes of learning today is enough to keep your streak going!</strong>
  </div>

  <p>
    Staying consistent is the key to long-term vocabulary retention.
    Don't let all your hard work disappear—take a quick lesson now.
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://your-domain.com/learn"
       style="
         background: #1a73e8;
         color: white;
         padding: 14px 28px;
         border-radius: 8px;
         text-decoration: none;
         font-weight: bold;
         display: inline-block;
       ">
      Continue Learning
    </a>
  </div>

  <p>
    If you have any available <strong>Streak Shields</strong>, they'll automatically
    protect your streak if you miss a day. Otherwise, make sure to study today!
  </p>

  <p style="margin-top: 32px;">
    Keep learning,<br />
    <strong>The ThChi Team</strong>
  </p>

  <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />

  <p style="font-size: 14px; color: #5f6368;">
    Need help? Contact us anytime:
  </p>

  <ul style="padding-left: 20px; font-size: 14px; color: #5f6368; line-height: 1.8;">
    <li>
      Facebook:
      <a href="https://m.me/ThChiGlobal" style="color: #1a73e8; text-decoration: none;">
        m.me/ThChiGlobal
      </a>
    </li>
    <li>
      Visit the ThChi Web App to continue your learning journey.
    </li>
  </ul>
</div>
`;

    const sendSmtpEmail = await this.brevo.transactionalEmails.sendTransacEmail(
      {
        subject: 'Your streak is waiting for you!',
        htmlContent: htmlContent,
        sender: {
          name: 'ThChi',
          email: this.configService.get<string>('BREVO_EMAIL_FROM')!,
        },
        to: [{ email }],
      },
    );
    return sendSmtpEmail;
  }

  async sendOTPCodeToEmail(email: string, otp: string) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #202124; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p style="margin-bottom: 16px;">Hi my friend, ThChi here!</p>
        
        <p style="margin-bottom: 16px;">Thanks for helping us keep your account secure!</p>
        
        <p style="margin-bottom: 16px;">This is your ThChi secret verification code:</p>
        
        <p style="color: #1a73e8; font-size: 32px; font-weight: bold; margin: 24px 0;">${otp}</p>
        
        <p style="margin-bottom: 16px;">This code will expire in 10 minutes.</p>
        
        <p style="margin-bottom: 24px;">Feel free to reach out to our support team if you encounter any issues or have questions.</p>
        
        <p style="margin-bottom: 4px;">--</p>
        <p style="margin-bottom: 16px;">Best regards,<br><strong>ThChi</strong></p>
        
        <ul style="padding-left: 20px; font-size: 14px; color: #5f6368; line-height: 1.8;">
          <li>Contact us: <a href="m.me/ThChiGlobal" style="color: #1a73e8; text-decoration: none;">m.me/ThChiGlobal</a></li>
          <li><a href="#" style="color: #1a73e8; text-decoration: none;">ThChi FAQ</a></li>
          <li>Try our spaced repetition flashcards: <a href="#" style="color: #1a73e8; text-decoration: none;">ThChi Web App</a></li>
        </ul>
      </div>
    `;

    const sendSmtpEmail = await this.brevo.transactionalEmails.sendTransacEmail(
      {
        subject: '[ThChi] Verify Your Email Address',
        htmlContent: htmlContent,
        sender: {
          name: 'ThChi',
          email: this.configService.get<string>('BREVO_EMAIL_FROM')!,
        },
        to: [{ email }],
      },
    );
    return sendSmtpEmail;
  }

  async sendReviewNotification(email: string, wordCount: number) {
    const htmlContent = `
<div style="font-family: Arial, sans-serif; color: #202124; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a73e8; margin-bottom: 16px;">
    Đã đến lúc ôn tập từ vựng! 🧠
  </h2>

  <p>Chào bạn,</p>

  <p>
    ThChi xin nhắc nhỏ là bạn đang có <strong>${wordCount} từ vựng</strong> đang chờ được ôn tập trong sổ tay ngày hôm nay.
  </p>



  <p>
    Chỉ mất vài phút thôi, hãy hoàn thành bài ôn tập ngay để giữ vững tiến độ học tập tuyệt vời của bạn nhé!
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://your-domain.com/notebook"
       style="
         background: #1a73e8;
         color: white;
         padding: 14px 28px;
         border-radius: 8px;
         text-decoration: none;
         font-weight: bold;
         display: inline-block;
       ">
      Ôn tập ngay
    </a>
  </div>

  <p style="margin-top: 32px;">
    Chúc bạn học tốt,<br />
    <strong>Đội ngũ ThChi</strong>
  </p>

  <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />

  <p style="font-size: 14px; color: #5f6368;">
    Cần hỗ trợ? Hãy liên hệ với chúng tôi bất cứ lúc nào:
  </p>

  <ul style="padding-left: 20px; font-size: 14px; color: #5f6368; line-height: 1.8;">
    <li>
      Facebook:
      <a href="https://m.me/ThChiGlobal" style="color: #1a73e8; text-decoration: none;">
        m.me/ThChiGlobal
      </a>
    </li>
    <li>
      Truy cập ThChi Web App để tiếp tục hành trình học tập của bạn.
    </li>
  </ul>
</div>
`;

    const sendSmtpEmail = await this.brevo.transactionalEmails.sendTransacEmail(
      {
        subject: 'Đã đến giờ ôn tập từ vựng trên ThChi! 📚',
        htmlContent: htmlContent,
        sender: {
          name: 'ThChi',
          email: this.configService.get<string>('BREVO_EMAIL_FROM')!,
        },
        to: [{ email }],
      },
    );
    return sendSmtpEmail;
  }
}
