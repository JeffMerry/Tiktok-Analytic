import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('PostgreSQL (Supabase) Connected Successfully');
});

pool.on('error', (err: Error) => {
    console.error('Unexpected DB Error:', err);
    process.exit(-1);
});

export default{
    query: <T extends QueryResultRow = any>(
        text: string,
        params?: any[]
    ) : Promise<QueryResult<T>> => pool.query<T>(text, params),
};