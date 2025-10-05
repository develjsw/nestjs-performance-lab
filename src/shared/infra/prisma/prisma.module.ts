import { Global, Module } from '@nestjs/common';
import { PrismaService } from './service/prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useClass: PrismaService,
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
