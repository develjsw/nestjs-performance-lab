export interface PrismaServiceInterface {
  onModuleInit(): Promise<void>;
  onModuleDestroy(): Promise<void>;
}
