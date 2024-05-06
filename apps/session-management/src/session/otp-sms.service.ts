import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpSmsService {
  generateAndLogOtp(sessionId: string): string {
    const otpCode = this.generateOtpCode();
    console.log(`Generated OTP for session ${sessionId}: ${otpCode}`);
    return otpCode;
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
