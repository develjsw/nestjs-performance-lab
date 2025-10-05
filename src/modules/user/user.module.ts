import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './service/user.service';
import { UserRepository } from './repository/user.repository';
import { USER_REPOSITORY_INTERFACE } from './token/user-repository-interface.token';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY_INTERFACE,
      useClass: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY_INTERFACE],
})
export class UserModule {}
