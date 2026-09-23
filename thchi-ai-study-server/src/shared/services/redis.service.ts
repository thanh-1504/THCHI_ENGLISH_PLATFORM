import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  public client: Redis;
  constructor(private readonly configService: ConfigService) {}
  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });
    this.client.on('connect', () => console.log('Redis connected'));
    this.client.on('error', (err) =>
      console.log('Redis connection error', err),
    );
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
