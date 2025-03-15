import fastify from 'fastify';
import { createClient, RedisClientType } from 'redis';
import { promisify } from 'util';
import { Pool } from 'pg';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

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
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379
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

const redisClient: RedisClientType = createClient({
    url: config.redis.url
});

const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

const pgPool = new Pool(config.postgres);
interface CustomFastifyInstance extends FastifyInstance {
    pg: Pool;
}

const app: FastifyInstance = fastify({ logger: true });

app.register(require('./routes/users'), { prefix: '/api/users' });

app.setErrorHandler((error, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);
    reply.status(error.statusCode || 500).send({
        error: error.name,
        message: error.message,
        statusCode: error.statusCode || 500
    });
});

async function start() {
    try {
        await app.listen({ port: 3000 });
        app.log.info(`Server listening on ${app.server.address()?.toString()}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

app.decorate('pg', pgPool);
app.decorate('redis', {
    get: getAsync,
    set: setAsync,
    del: delAsync,
    ttl: config.cache.ttl
});

app.addHook('onClose', async (instance) => {
    await instance.pg.end();
    redisClient.quit();
});

start();
