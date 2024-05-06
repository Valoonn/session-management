import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsUUID,
  ValidateNested,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';

class UserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

class DeviceDto {
  @IsEnum(['mobi', 'othr'])
  type: string;

  @ValidateIf((o) => o.type === 'mobi')
  @IsUUID(4, {
    message: 'vendor_uuid must be a valid UUID v4 when type is "mobi".',
  })
  vendor_uuid?: string;
}

export class CreateSessionDto {
  @ValidateNested()
  @Type(() => UserDto)
  @IsNotEmpty()
  user: UserDto;

  @ValidateNested()
  @Type(() => DeviceDto)
  @IsNotEmpty()
  device: DeviceDto;
}
