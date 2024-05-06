import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { SessionModule } from '@session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.local.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'username',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'database',
      autoLoadEntities: true,
      synchronize: true,
    }),
    SessionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
