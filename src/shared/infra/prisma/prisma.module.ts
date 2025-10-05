import { Module } from '@nestjs/common';
import { PRISMA_SERVICE_INTERFACE } from './token/prisma-service-interface.token';
import { PrismaService } from './service/prisma.service';

@Module({
  providers: [
    {
      provide: PRISMA_SERVICE_INTERFACE,
      useClass: PrismaService,
    },
  ],
  exports: [PRISMA_SERVICE_INTERFACE],
})
export class PrismaModule {}
