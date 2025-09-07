import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { AuthResponseDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { unsubscribe } from 'diagnostics_channel';

@Injectable()
export class AuthService {
  // 
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto | null> {
    const { username, email, password } = registerDto;
    this.logger.log(`Registraion attempt for email: ${email}`);


    // check if user exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`Registration failed: User with email ${email} already exists`);
      throw new ConflictException(`User with this email already exists`);
    }

    // hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // create the user with userservice 
    const user = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
    });
    this.logger.log(`User registered succesfully: ${user.email}`);

    // generate Jwt token
    const payload = { email: user.email, sub: user._id };
    const access_token = this.jwtService.sign(payload);

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      access_token,
    }
    return null;
  }
 


  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    this.logger.log(`Login attempt for email: ${email}`);

    // find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login failed: User with email ${email} not found`);
      throw new UnauthorizedException(`Invalid credetials`);
    }

    // check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: invalid password for email ${email}`);
      throw new UnauthorizedException(`Invalid credentials`);
    }

    this.logger.log(`User logged in succesfully`);

    // Generate jwt token 
    const payload = { email: user.email, sub: user._id };
    const access_token = this.jwtService.sign(payload);
    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      access_token,
    }

  }
  async validateUser(email: string, sub: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && user._id.toString() === sub.toString()) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
 
}









 