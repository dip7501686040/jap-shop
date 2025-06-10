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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from response
    const { password, ...result } = user;

    return {
      user: result,
      token: this.jwtService.generateToken({ sub: user.id, email: user.email }),
    };
  }

  validateToken(token: string) {
    return this.jwtService.verifyToken(token);
  }
}
