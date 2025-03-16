import { FastifyRequest, FastifyReply } from "fastify";
import { CustomFastifyInstance } from "@interfaces/customFastify";

export async function routes(fastify: CustomFastifyInstance) {
    const { pg, redis } = fastify;

    fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
        const cacheKey = 'users:all';

        // Try to get from cache first
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            request.log.info('Cache hit for all users');
            return JSON.parse(cachedData);
        }

        // If not in cache, get from DB
        const result = await pg.query('SELECT id, name, email FROM users ORDER BY id');
        const users = result.rows;

        // Cache the result
        await redis.set(cacheKey, JSON.stringify(users), 'EX', redis.ttl);

        return reply.send(users);
    });

    fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params;
        const cacheKey = `users:${id}`;

        // Try to get from cache first
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            request.log.info(`Cache hit for user ${id}`);
            return JSON.parse(cachedData);
        }

        // If not in cache, get from DB
        const result = await pg.query('SELECT id, name, email FROM users WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            reply.code(404);
            throw new Error('User not found');
        }

        const user = result.rows[0];

        // Cache the result
        await redis.set(cacheKey, JSON.stringify(user), 'EX', redis.ttl);

        return reply.send(user);
    });

    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' }
                }
            }
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { name, email } = request.body;

        const result = await pg.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
            [name, email]
        );

        const newUser = result.rows[0];

        // Invalidate cache for all users
        await redis.del('users:all');

        reply.code(201);
        return reply.send(newUser);
    });

    fastify.put('/:id', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            body: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' }
                }
            }
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params;
        const { name, email } = request.body;

        const result = await pg.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
            [name, email, id]
        );

        if (result.rows.length === 0) {
            reply.code(404);
            throw new Error('User not found');
        }

        const updatedUser = result.rows[0];

        // Invalidate caches
        await redis.del(`users:${id}`);
        await redis.del('users:all');

        return reply.send(updatedUser);
    });

    fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params;

        const result = await pg.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            reply.code(404);
            throw new Error('User not found');
        }

        // Invalidate caches
        await redis.del(`users:${id}`);
        await redis.del('users:all');

        reply.code(204);
    });

    return fastify;
}