import { UserEntity, UserModel } from '../entity/user.entity';

export interface UserRepositoryInterface {
  createUser(entity: UserEntity): Promise<UserModel>;
}
