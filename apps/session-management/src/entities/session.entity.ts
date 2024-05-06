import { IsEmail } from 'class-validator';
import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Session {
  @PrimaryColumn()
  uuid: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  user_uuid: string;

  @Column()
  device_uuid: string;

  @Column()
  device_type: string;

  @Column({ nullable: true })
  vendor_uuid: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  token: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  otp_code: string;

  @Column({ type: 'timestamp', nullable: true })
  otp_expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  token_expires_at: Date;
}
