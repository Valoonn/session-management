import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Session } from '@entities/session.entity';
import { CreateSessionDto } from '@dto/create-session.dto';
import { OtpSmsService } from './otp-sms.service';
import { SessionResponse } from '@custom-types/session-resp.type';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private readonly otpSmsService: OtpSmsService,
  ) {}

  async createSession(
    createSessionDto: CreateSessionDto,
  ): Promise<{ response: SessionResponse; statusCode: number }> {
    const { user, device } = createSessionDto;

    if (device.type === 'mobi') {
      const existingSession = await this.sessionRepository.findOne({
        where: {
          email: user.email,
          device_type: 'mobi',
          vendor_uuid: device.vendor_uuid,
        },
        order: { created_at: 'DESC' },
      });

      if (existingSession && existingSession.status === 'confirmed') {
        return this.transformSession(existingSession, false, false);
      } else if (
        existingSession &&
        existingSession.status === 'pending' &&
        new Date() < new Date(existingSession.otp_expires_at) // Check if OTP is still valid
      ) {
        return this.transformSession(existingSession, false, false);
      } else if (existingSession) {
        // If OTP has expired, set the session status to expired
        existingSession.status = 'expired';
        await this.sessionRepository.save(existingSession);
      }
    }

    if (device.type === 'othr') {
      const existingSession = await this.sessionRepository.findOne({
        where: {
          email: user.email,
          device_type: 'othr',
        },
        order: { created_at: 'DESC' },
      });

      if (
        existingSession &&
        existingSession.status === 'confirmed' &&
        new Date() < new Date(existingSession.token_expires_at) // Check if token is still valid
      ) {
        return this.transformSession(existingSession, false, false);
      } else if (
        existingSession &&
        existingSession.status === 'pending' &&
        new Date() < new Date(existingSession.otp_expires_at) // Check if OTP is still valid
      ) {
        return this.transformSession(existingSession, false, false);
      } else if (existingSession) {
        // If OTP has expired, set the session status to expired
        existingSession.status = 'expired';
        await this.sessionRepository.save(existingSession);
      }
    }

    return await this.createNewSession(createSessionDto);
  }

  private transformSession(
    session: Session,
    is_new_user: boolean,
    is_new_device: boolean,
  ): {
    response: SessionResponse;
    statusCode: number;
  } {
    return {
      response: this.formateResponse(session, is_new_user, is_new_device),
      statusCode: 200,
    };
  }

  private async createNewSession(
    createSessionDto: CreateSessionDto,
  ): Promise<{ response: SessionResponse; statusCode: number }> {
    const { user, device } = createSessionDto;

    const existingUser = await this.sessionRepository.findOne({
      where: { email: user.email },
    });

    const is_new_user = !existingUser;
    const session_uuid = `ses-${uuidv4()}`;
    const user_uuid = `usr-${uuidv4()}`;
    const device_uuid = `dev-${uuidv4()}`;
    const token = uuidv4();
    const otp_code = this.otpSmsService.generateAndLogOtp(session_uuid);
    const otp_expires_at = new Date(new Date().getTime() + 5 * 60 * 1000);

    let tokenExpiresAt = null;
    if (device.type === 'othr') {
      const expiresInHours = 2;
      tokenExpiresAt = new Date(
        new Date().getTime() + expiresInHours * 60 * 60 * 1000,
      );
    }

    const session = this.sessionRepository.create({
      uuid: session_uuid,
      email: user.email,
      user_uuid: user_uuid,
      device_uuid: device_uuid,
      device_type: device.type,
      vendor_uuid: device.vendor_uuid || null,
      token: token,
      created_at: new Date(),
      status: 'pending',
      otp_code: otp_code,
      otp_expires_at: otp_expires_at,
      token_expires_at: tokenExpiresAt,
    });

    await this.sessionRepository.save(session);
    return {
      response: this.formateResponse(session, is_new_user, true),
      statusCode: 201,
    };
  }

  formateResponse(
    session: Session,
    is_new_user: boolean,
    is_new_device: boolean,
  ): SessionResponse {
    return {
      uuid: session.uuid,
      created_at: session.created_at,
      token: session.token,
      is_new_user: is_new_user,
      is_new_device: is_new_device,
      user: {
        uuid: session.user_uuid,
        email: session.email,
      },
      device: {
        uuid: session.device_uuid,
        type: session.device_type,
        vendor_uuid: session.vendor_uuid,
      },
      status: session.status,
    };
  }

  async confirmSession(
    sessionUuid: string,
    otpCode: string,
  ): Promise<SessionResponse> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
    });

    if (!session) {
      throw new NotFoundException(
        `Session with UUID ${sessionUuid} not found.`,
      );
    }

    if (new Date() >= new Date(session.otp_expires_at)) {
      // Check if OTP has expired
      session.status = 'expired';
      await this.sessionRepository.save(session);
      throw new BadRequestException('Session has expired.');
    }

    if (session.otp_code !== otpCode) {
      // Check if OTP code is valid
      throw new BadRequestException('Invalid OTP code provided.');
    }

    session.status = 'confirmed';
    await this.sessionRepository.save(session);
    return this.formateResponse(session, false, false);
  }
}
