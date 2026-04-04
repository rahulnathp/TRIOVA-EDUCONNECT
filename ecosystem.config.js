module.exports = {
  apps: [
    {
      name: 'TRIOVA',                  // <-- New PM2 process name
      script: 'dist/main.js',           // <-- Your built NestJS entry file
      instances: 1,                     // Run 1 instance (change if you want clustering)
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        JWT_SECRET: 'your_jwt_secret_key', // <-- Set JWT secret here
        DB_HOST: 'triova.cb2aicsuqihj.eu-north-1.rds.amazonaws.com',
        DB_PORT: 5432,
        DB_USERNAME: 'postgres',
        DB_PASSWORD: 'Mneihep43',
        DB_DATABASE: 'triova',
      },
    },
  ],
};