import fastify from 'fastify';
import { createClient, RedisClientType } from 'redis';
import { promisify } from 'util';
import { Pool } from 'pg';
import { FastifyReply, FastifyRequest } from 'fastify';

import config from '@utils/config';
import routes from '@http/routes';
import { CustomFastifyInstance } from 'src/interfaces/customFastify';


const redisClient: RedisClientType = createClient({
    url: config.redis.url
});

const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

const pgPool = new Pool(config.postgres);


async function init() {

    const app = await fastify({ logger: true }) as CustomFastifyInstance;

    try {

        await app.listen({ port: 3000 });

        app.register(routes(app), { prefix: '/api/users' });

        app.setErrorHandler((error, request: FastifyRequest, reply: FastifyReply) => {
            request.log.error(error);
            reply.status(error.statusCode || 500).send({
                error: error.name,
                message: error.message,
                statusCode: error.statusCode || 500
            });
        });

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

        app.log.info(`Server listening on ${app.server.address()?.toString()}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

init();
