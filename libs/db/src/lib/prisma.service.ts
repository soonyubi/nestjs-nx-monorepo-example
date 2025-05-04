import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    const models = Reflect.ownKeys(this).filter(
      (key) =>
        typeof key === 'string' &&
        key[0] !== '_' &&
        key[0] !== '$' &&
        typeof this[key as keyof this] === 'object' &&
        this[key as keyof this] !== null
    );

    return Promise.all(
      models.map((modelKey) => {
        const modelName = modelKey as string;
        return (this as any)[modelName].deleteMany();
      })
    );
  }
}
