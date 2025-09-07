import { IsString, MinLength, isEmail } from "class-validator";
import { Types } from "mongoose";
// LOGIN DATA TRANSFER OBJECT
export class LoginDto {
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
// REGISTER DATA TRANSFER OBJECT
export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// AUTH RESPONSE DATA TRANSFER OBJECT
export class AuthResponseDto{
  user: {
    _id: Types.ObjectId;
    username: string;
    email: string;

  };
  access_token: string;
}