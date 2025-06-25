import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from './jwt.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private otpStore: Map<string, string> = new Map();

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
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
      user: result,
      token: this.jwtService.generateToken({ sub: user.id, email: user.email }),
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by email
    const user: any = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from response
    const { password, ...result } = user;
    return {
      user: result,
      token: this.jwtService.generateToken({
        user_id: user.id,
        email: user.email,
        role_id: user.role?.id,
        role: user.role?.name,
        name: user.name,
      }),
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
}
