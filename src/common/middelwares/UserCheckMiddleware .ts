// src/common/middleware/user-check.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt'; // ✅ استخدم JwtService

@Injectable()
export class UserCheckMiddleware implements NestMiddleware {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService // ✅ inject JwtService
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token missing' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'default_secret';

      const decoded = await this.jwtService.verifyAsync(token, {
        secret,
      });
      if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
        return res.status(401).json({ message: 'Invalid token payload' });     
      }
      const userId = decoded.sub;
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }
      req['user'] = user;
     
      
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
}
