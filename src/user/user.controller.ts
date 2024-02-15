import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Response,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../dto/create-user-dto';
import type { FastifyReply } from 'fastify';
import redis from 'src/database/redis';
import { GetUserDto } from 'src/dto/get-user-dto';
import { GetTermDto } from 'src/dto/get-term-dto';
import { ValidationPipe } from 'src/validation/validation.pipe';

@Controller('pessoas')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
    @Response() res: FastifyReply,
  ) {
    const user = await this.userService.create(createUserDto);

    redis.set(user.id, JSON.stringify(user), 'EX', 360);

    return res.header('Location', `/pessoas/${user.id}`).send(user);
  }

  @Get(':id')
  async findUnique(@Param() params: GetUserDto) {
    return this.userService.findUnique(params);
  }

  @Get()
  async findTerm(@Query() queryParams: GetTermDto) {
    return this.userService.findTerm(queryParams);
  }
}
