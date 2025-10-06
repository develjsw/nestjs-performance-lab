import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_INTERFACE } from '../token/user-repository-interface.token';
import { UserRepositoryInterface } from '../interface/user-repository.interface';
import { CreateUserDto } from '../dto/create-user-dto';
import { UserEntity, UserModel } from '../entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY_INTERFACE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async signUp(dto: CreateUserDto): Promise<UserModel> {
    const user = UserEntity.create(
      dto.name,
      dto.phone,
      dto.password,
      dto.email,
    );

    return await this.userRepository.createUser(user);
  }
}
