import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_INTERFACE } from '../token/user-repository-interface.token';
import { UserRepositoryInterface } from '../interface/user-repository.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY_INTERFACE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}
}
