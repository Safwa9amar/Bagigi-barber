import dotenv from 'dotenv';

const envPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envPath });

interface Config {
  port: number;
  nodeEnv: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
