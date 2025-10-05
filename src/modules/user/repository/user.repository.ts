import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infra/prisma/service/prisma.service';
import { UserRepositoryInterface } from '../interface/user-repository.interface';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}
}
