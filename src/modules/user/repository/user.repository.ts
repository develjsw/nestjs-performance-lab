import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infra/prisma/service/prisma.service';
import { UserRepositoryInterface } from '../interface/user-repository.interface';
import { UserEntity, UserModel } from '../entity/user.entity';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(entity: UserEntity): Promise<UserModel> {
    const { userId, ...data } = entity.toPrimitive();

    return await this.prisma.user.create({
      data,
    });
  }
}
