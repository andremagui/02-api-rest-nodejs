import { env } from './env'
import { knex as knexObj, Knex } from 'knex'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL env not FOUND')
}

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = knexObj(config)
