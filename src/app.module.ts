import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './configs/db/database.module';
import { V1Module } from './versions/v1/v1.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"  
    }),
    DatabaseModule,
    V1Module
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
