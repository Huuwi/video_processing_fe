import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideosModule } from './modules/videos/videos.module';
import { UsersController } from './service/users/users.controller';

@Module({
  imports: [VideosModule],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule { }
