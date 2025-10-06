import { UserStatus } from '@prisma/client';

// TODO : UserStatus Enum은 shared 폴더에 새로 생성 후 공통 사용하도록 변경 필요

export type UserProperty = {
  //userId: number;
  name: string;
  phone: string;
  password: string;
  status: UserStatus;
  createdAt: Date;
  email?: string | null;
  updatedAt?: Date | null;
};

export type UserModel = { userId: number } & UserProperty;

export class UserEntity {
  constructor(
    private readonly property: UserProperty,
    private readonly userId?: number,
  ) {}

  static create(
    name: string,
    phone: string,
    password: string,
    email?: string,
  ): UserEntity {
    if (!name?.trim()) throw new Error('이름은 필수입니다.');
    if (!phone?.trim()) throw new Error('전화번호는 필수입니다.');
    if (!password?.trim()) throw new Error('비밀번호는 필수입니다.');

    return new UserEntity({
      name,
      phone,
      password,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      email,
    });
  }

  toPrimitive() {
    return {
      userId: this.userId,
      ...this.property,
    };
  }
}
