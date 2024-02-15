import { Module } from '@nestjs/common';
import { HealthyCheckController } from './healthy-check.controller';
import { HealthyCheckService } from './healthy-check.service';

@Module({
  imports: [],
  controllers: [HealthyCheckController],
  providers: [HealthyCheckService],
})
export class HealthyCheckModule {}
