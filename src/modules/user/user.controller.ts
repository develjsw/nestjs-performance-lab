import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './service/user.service';
import { CreateUserDto } from './dto/create-user-dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUserAll(): Promise<void> {}

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<void> {}
}
