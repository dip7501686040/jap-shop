import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // Allow access to Swagger documentation
    if (
      request.url.startsWith('/docs') ||
      request.url.startsWith('/api/docs')
    ) {
      return true;
    }

    // Check if the endpoint is public - check both handler and class
    const isPublicHandler = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    const isPublicClass = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getClass(),
    );

    // If either the handler or class is marked as public, allow access
    if (isPublicHandler || isPublicClass) {
      return true;
    }

    // For protected routes, delegate to the parent AuthGuard
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}

// Public decorator is now imported from decorators/public.decorator.ts
