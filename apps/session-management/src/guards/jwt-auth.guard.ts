import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '@entities/session.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authToken = request.headers.authorization?.split(' ')[1];

    if (!authToken) {
      throw new UnauthorizedException('Authorization token is required');
    }

    return this.validateToken(authToken, request);
  }

  async validateToken(token: string, request: any): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { token: token },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or token is invalid');
    }

    // Check if the session is expired
    if (
      session.token_expires_at &&
      new Date() > new Date(session.token_expires_at)
    ) {
      session.status = 'expired';
      await this.sessionRepository.save(session);
      throw new UnauthorizedException('Session has expired');
    }

    // Attach session to the request for further use in controller
    request.session = session;
    return true;
  }
}
