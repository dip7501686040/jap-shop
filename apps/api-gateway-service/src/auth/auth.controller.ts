import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Public()
  @Post('/register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({
    summary:
      'Login to initiate OTP process for superAdmin or direct login for others',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful or OTP sent to user email',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Public()
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role?.name === 'superAdmin') {
      // Generate and send OTP for superAdmin
      await this.authService.sendOtp(user.email);
      return { message: 'OTP sent to your email' };
    }

    // Direct login for other roles
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Verify OTP and complete login for superAdmin' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid OTP or unauthorized role' })
  @Public()
  @Post('/verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const user = await this.authService.verifyOtpAndLogin(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
    if (!user || user.role?.name !== 'superAdmin') {
      throw new UnauthorizedException('Invalid OTP or unauthorized role');
    }

    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user profile',
  })
  @ApiBearerAuth()
  @Get('/profile')
  getProfile(@Request() req) {
    // This route is protected by the AuthGuard
    // req.user is populated by Passport
    return req.user;
  }
}
