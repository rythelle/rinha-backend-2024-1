import { Controller, Get } from '@nestjs/common';
import { CountUserService } from './count-user.service';

@Controller('contagem-pessoas')
export class CountUserController {
  constructor(private readonly userService: CountUserService) {}

  @Get()
  async count() {
    return this.userService.count();
  }
}
