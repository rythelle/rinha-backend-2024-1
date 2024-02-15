import { Module } from '@nestjs/common';
import { CountUserController } from './count-user.controller';
import { CountUserService } from './count-user.service';

@Module({
  imports: [],
  controllers: [CountUserController],
  providers: [CountUserService],
})
export class CountUserModule {}
