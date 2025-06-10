import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private readonly nestJwtService: NestJwtService) {}

  generateToken(payload: any): string {
    return this.nestJwtService.sign(payload);
  }

  verifyToken(token: string): any {
    try {
      return this.nestJwtService.verify(token);
    } catch (error) {
      return null;
    }
  }
}
