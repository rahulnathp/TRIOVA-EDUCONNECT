import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

// Load environment variables at module level
config();

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: String(process.env.DB_PASSWORD), // Ensure password is always a string
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    ssl: process.env.DB_HOST?.includes('rds.amazonaws.com') || process.env.DB_HOST?.includes('amazonaws.com') ? {
      rejectUnauthorized: false,
    } : false,
    logging: process.env.NODE_ENV === 'development',
    extra: {
      connectionTimeoutMillis: 60000,
      idleTimeoutMillis: 30000,
      application_name: 'triova-backend',
      statement_timeout: 30000,
      query_timeout: 30000,
      // Add retry configuration for RDS
      maxQueryExecutionTime: 30000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    },
  };
};

// Export both function and a direct config for backwards compatibility
export const databaseConfig = getDatabaseConfig();
