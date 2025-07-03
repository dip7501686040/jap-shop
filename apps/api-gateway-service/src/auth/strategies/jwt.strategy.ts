import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // You can add additional validation logic here
    // For example, check if the user still exists in the database
    const userId = payload.id;
    const user = await this.userService.findOne(userId);
    if (!user) {
      return null;
    }

    // Return the user data (without sensitive fields like password)
    // This object will be added to the Request as req.user
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role?.name || null,
    };
  }
}
