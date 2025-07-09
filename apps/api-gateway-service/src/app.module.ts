import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { CustomerModule } from './customer/customer.module';
import { EntryModule } from './entry/entry.module';
import { MenuModule } from './menu/menu.module';
import { LogbookModule } from './logbook/logbook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    RoleModule,
    CustomerModule,
    EntryModule,
    MenuModule,
    LogbookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
