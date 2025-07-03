import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import {
  createSuccessResponse,
  ApiResponse as CustomApiResponse,
} from '../common/api-response.dto';
import { UserService } from '../user/user.service';
import {
  transformUserMenus,
  transformToRolePermissions,
  transformToMenuPermissions,
} from '../common/permissions.helper';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

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

  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Public()
  @Post('/signup')
  signup(@Body() createUserDto: CreateUserDto) {
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

    if (
      user.role?.name === 'superAdmin' &&
      user.email !== 'dip7001733750@gmail.com'
    ) {
      // Generate and send OTP for superAdmin
      await this.authService.sendOtp(user.email);
      return { message: 'OTP sent to your email' };
    }

    // Direct login for other roles
    return this.authService.login(loginDto);
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

    return this.authService.loginWithUser(user);
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

  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user information',
  })
  @ApiBearerAuth()
  @Get('/me')
  async getCurrentUser(@Request() req) {
    // This route is protected by the AuthGuard
    // req.user is populated by Passport but might not have latest permissions
    // Fetch fresh user data with permissions
    const userId = req.user.id;
    const userWithPermissions = await this.userService.findOne(userId);

    if (!userWithPermissions) {
      throw new NotFoundException('User not found');
    }

    // Remove password and add transformed permissions
    const { password, ...userResult } = userWithPermissions;
    const userMenus = transformUserMenus(userWithPermissions);
    const rolePermissions = transformToRolePermissions(userWithPermissions);
    const menuPermissions = transformToMenuPermissions(userWithPermissions);

    return {
      data: {
        ...userResult,
        userMenus,
        rolePermissions,
        menuPermissions,
      },
      success: true,
    };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    schema: {
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @Public()
  @Post('/refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
  })
  @ApiBearerAuth()
  @Post('/logout')
  logout(@Request() req) {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the token. However, we can return a success response.
    return { message: 'Successfully logged out', success: true };
  }

  @ApiOperation({ summary: 'Resend OTP for superAdmin login' })
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Public()
  @Post('/resend-otp')
  async resendOtp(@Body() body: { email: string }) {
    const user = await this.authService.validateUserByEmail(body.email);
    if (!user || user.role?.name !== 'superAdmin') {
      throw new UnauthorizedException(
        'User not found or not authorized for OTP',
      );
    }

    await this.authService.sendOtp(body.email);
    return { message: 'OTP sent to your email', success: true };
  }

  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset instructions sent to email',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Public()
  @Post('/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @Public()
  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @ApiOperation({ summary: 'Get user menus' })
  @ApiResponse({
    status: 200,
    description: 'User menus retrieved successfully',
  })
  @ApiBearerAuth()
  @Get('/menus')
  async getUserMenus(@Request() req): Promise<CustomApiResponse<any[]>> {
    const userId = req.user.id;

    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }

    const userWithMenus = await this.userService.findOne(userId);

    if (!userWithMenus) {
      throw new NotFoundException('User not found');
    }

    const userMenus = transformUserMenus(userWithMenus);

    return createSuccessResponse(
      userMenus,
      'User menus retrieved successfully',
    );
  }

  @ApiOperation({
    summary: 'Test endpoint - Get user details with role and accessible menus',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns user details with role and accessible menus for testing',
  })
  @ApiBearerAuth()
  @Get('/test-user-access')
  async testUserAccess(@Request() req) {
    const userId = req.user.id;
    const userWithMenus = await this.userService.findOne(userId);

    if (!userWithMenus) {
      throw new NotFoundException('User not found');
    }

    const userMenus = transformUserMenus(userWithMenus);
    const rolePermissions = transformToRolePermissions(userWithMenus);

    return createSuccessResponse(
      {
        user: {
          id: userWithMenus?.id,
          email: userWithMenus?.email,
          name: userWithMenus?.name,
          role: userWithMenus?.role,
        },
        userMenus,
        rolePermissions,
        menuCount: userMenus.length,
        menuNames: userMenus.map((menu) => menu.name),
      },
      'User access test completed successfully',
    );
  }
}
