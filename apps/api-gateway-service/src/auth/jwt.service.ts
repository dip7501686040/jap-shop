import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private readonly nestJwtService: NestJwtService) {}

  generateToken(payload: any): string {
    return this.nestJwtService.sign(payload);
  }

  generateAccessToken(payload: any): string {
    return this.nestJwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m', // Short-lived access token
    });
  }

  generateRefreshToken(payload: any): string {
    return this.nestJwtService.sign(
      { id: payload.id, email: payload.email }, // Minimal payload for refresh token
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Long-lived refresh token
      },
    );
  }

  generateTokenPair(payload: any): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyToken(token: string): any {
    try {
      return this.nestJwtService.verify(token);
    } catch (error) {
      return null;
    }
  }
}
