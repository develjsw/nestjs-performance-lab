import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './service/user.service';
import { CreateUserDto } from './dto/create-user-dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async signUp(@Body() dto: CreateUserDto): Promise<void> {
    await this.userService.signUp(dto);
  }

  @Get()
  async getUserAll(): Promise<void> {}
}
