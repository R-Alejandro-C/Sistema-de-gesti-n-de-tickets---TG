import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { CatalogosModule } from './modules/catalogos/catalogos.module';
import { HistoryModule } from './modules/history/history.module';
import { RolesModule } from './modules/roles/roles.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Auto create tables - solo desarrollo
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    TicketsModule,
    CatalogosModule,
    HistoryModule,
    RolesModule,
    SeedModule,
  ],
})
export class AppModule { }
