interface Config {
    redis: {
        url: string;
    };
    postgres: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
    };
    cache: {
        ttl: number;
    };
}

const config: Config = {
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    postgres: {
        host: process.env.PG_HOST || 'localhost',
        port: Number(process.env.PG_PORT) || 5432,
        database: process.env.PG_DATABASE || 'myapp',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'postgres'
    },
    cache: {
        ttl: 60 * 5
    }
};

export default config;