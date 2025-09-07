import { Controller, Post, Body, UseGuards, Get, Request, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration request received for: ${registerDto.email}`);
    // before it was return this.authService.register(registerDto.email, registerDto.password);
    return this.authService.register(registerDto);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Registration request received for: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }


  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    this.logger.log(`Profile request from user: ${req.user.email}`);
    return req.user;
  }
  @UseGuards(JwtAuthGuard)
  @Post(`logout`)
  logout(@Request() req){
    this.logger.log(`Logout request from user: ${req.user.email}`);
    return {message: `Logged out succesfully`}; // messages always return as a object or document data
  }
}