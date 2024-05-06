import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '@entities/session.entity';
import { OtpSmsService } from './otp-sms.service';

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  providers: [SessionService, OtpSmsService],
  controllers: [SessionController],
})
export class SessionModule {}
