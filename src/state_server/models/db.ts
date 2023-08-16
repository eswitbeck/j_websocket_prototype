import 'dotenv/config';
console.log(process.env.PG_URI);
import pg from 'pg';
const Pool = pg.Pool;

const connectionString = process.env.PG_URI;

const pool = new Pool({
  connectionString
});

export const query = (queryString: string, params: string[], callback?: (...args: any[]) => any): any => {
  return pool.query(queryString, params, callback);
}
