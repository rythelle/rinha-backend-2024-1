import { Controller, Get } from '@nestjs/common';
import { HealthyCheckService } from './healthy-check.service';

@Controller('healthy-check')
export class HealthyCheckController {
  constructor(private readonly healthyCheckService: HealthyCheckService) {}

  @Get()
  count() {
    return this.healthyCheckService.check();
  }
}
