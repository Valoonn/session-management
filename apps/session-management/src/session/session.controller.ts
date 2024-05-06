import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { CreateSessionDto } from '@dto/create-session.dto';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
    @Query('mode') mode: string,
    @Res() res: Response,
  ) {
    if (mode !== 'email') {
      throw new BadRequestException(
        'Invalid mode value. Only "email" is allowed.',
      );
    }
    const { response, statusCode } =
      await this.sessionService.createSession(createSessionDto);
    res.status(statusCode).json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':uuid')
  confirmSession(
    @Param('uuid') uuid: string,
    @Body() body: { otp_code: string },
  ) {
    if (!body || !body.otp_code) {
      throw new BadRequestException('OTP code must be provided.');
    }
    return this.sessionService.confirmSession(uuid, body.otp_code);
  }
}
