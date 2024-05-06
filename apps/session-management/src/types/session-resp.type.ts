interface SessionResponse {
  uuid: string;
  created_at: Date;
  token: string;
  is_new_user: boolean;
  is_new_device: boolean;
  user: {
    uuid: string;
    email: string;
  };
  device: {
    uuid: string;
    type: string;
    vendor_uuid?: string;
  };
  status: string;
}

interface SessionDto {
  user: UserDto;
  device: DeviceDto;
}

interface UserDto {
  email: string;
}

interface DeviceDto {
  vendor_uuid?: string;
  type: string;
}

export { SessionResponse, SessionDto, UserDto, DeviceDto };
