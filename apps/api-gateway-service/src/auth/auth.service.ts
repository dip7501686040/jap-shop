import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from './jwt.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private otpStore: Map<string, string> = new Map();

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Check if user with email already exists
    const existingUser = await this.userService.findOneByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user with hashed password
    const user = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Remove password from response
    const { password, ...result } = user;

    return {
      data: { user: result },
      success: true,
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto) {
    // Validate user credentials first
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate access and refresh tokens
    const tokenPayload = {
      user_id: user.id,
      email: user.email,
      role_id: user.role?.id,
      role: user.role?.name,
      name: user.name,
    };

    const tokens = this.jwtService.generateTokenPair(tokenPayload);

    // Remove password from response
    const { password, ...result } = user;

    return {
      data: {
        user: result,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      success: true,
    };
  }

  async loginWithUser(user: any) {
    // Generate access and refresh tokens
    const tokenPayload = {
      user_id: user.id,
      email: user.email,
      role_id: user.role?.id,
      role: user.role?.name,
      name: user.name,
    };

    const tokens = this.jwtService.generateTokenPair(tokenPayload);

    // Remove password from response
    const { password, ...result } = user;

    return {
      data: {
        user: result,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      success: true,
    };
  }

  async validateUser(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { role: true },
    });
    if (user) {
      // Verify password
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      return isPasswordValid ? user : null;
    }
    return null;
  }

  async sendOtp(email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(email, otp);

    // Send OTP via email (mocked with nodemailer)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dip7501686040@gmail.com',
        pass: 'blpx qxcp seti ewwt',
      },
    });

    await transporter.sendMail({
      from: '"No Reply" <dip7501686040@gmail.com>',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    });
  }

  async verifyOtpAndLogin(email: string, otp: string) {
    const storedOtp = this.otpStore.get(email);
    if (storedOtp !== otp) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.otpStore.delete(email);
    return user;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    // Mock OTP verification logic
    return otp === '123456';
  }

  validateToken(token: string) {
    return this.jwtService.verifyToken(token);
  }

  async refreshToken(refreshToken: string) {
    // Verify the refresh token
    const decoded = this.jwtService.verifyToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user from database to ensure they still exist and get latest info
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new access token
    const tokenPayload = {
      user_id: user.id,
      email: user.email,
      role_id: user.role?.id,
      role: user.role?.name,
      name: user.name,
    };

    const accessToken = this.jwtService.generateAccessToken(tokenPayload);

    return {
      data: {
        accessToken,
      },
      success: true,
    };
  }

  async validateUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, return success even if user doesn't exist
      // This prevents email enumeration attacks
      return {
        data: null,
        success: true,
        message: 'Password reset instructions have been sent to your email',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store reset token in database
    await this.prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpiry,
      },
    });

    // Send reset email
    try {
      await this.sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to prevent revealing whether email exists
    }

    return {
      data: null,
      success: true,
      message: 'Password reset instructions have been sent to your email',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(), // Token should not be expired
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return {
      data: null,
      success: true,
      message: 'Password has been reset successfully',
    };
  }

  private async sendPasswordResetEmail(email: string, resetToken: string) {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dip7501686040@gmail.com',
        pass: 'blpx qxcp seti ewwt',
      },
    });

    const mailOptions = {
      from: '"JAP Shop Support" <dip7501686040@gmail.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>You requested a password reset for your JAP Shop account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 10 minutes. If you didn't request this password reset, 
            please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}
