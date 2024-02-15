import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthyCheckService {
  check() {
    return { live: true };
  }
}
