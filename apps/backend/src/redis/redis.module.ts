import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.decorator';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('REDIS_URL');

        // Prioritas: jika REDIS_URL ada (mis. plugin Redis Railway), pakai itu.
        if (url) {
          // rediss:// (double-s) berarti koneksi TLS.
          const useTls = url.startsWith('rediss://') || url.includes('upstash.io');
          return new Redis(url, { tls: useTls ? {} : undefined });
        }

        // Fallback: variabel terpisah REDIS_HOST/PORT/PASSWORD (local dev).
        const host = configService.get('REDIS_HOST', 'localhost');
        const isUpstash = host.includes('upstash.io');
        return new Redis({
          host,
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD') || undefined,
          tls: isUpstash ? {} : undefined,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
