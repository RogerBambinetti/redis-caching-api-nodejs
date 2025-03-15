import { FastifyInstance } from 'fastify';
import { Pool } from 'pg';

export interface CustomFastifyInstance extends FastifyInstance {
    pg: Pool;
    redis: any;
}