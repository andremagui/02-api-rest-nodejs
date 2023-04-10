import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'
describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    // http request to create new transactions
    // validate
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new tx',
        amount: 4000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTxResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new tx',
        amount: 4000,
        type: 'credit',
      })

    const cookies = createTxResponse.get('Set-Cookie')

    const listTxResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTxResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new tx',
        amount: 4000,
      }),
    ])
  })

  it('should be able to get a transaction by id', async () => {
    const createTxResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new tx',
        amount: 4000,
        type: 'credit',
      })

    const cookies = createTxResponse.get('Set-Cookie')

    const listTxResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const txId = listTxResponse.body.transactions[0].id

    const getTxByResponse = await request(app.server)
      .get(`/transactions/${txId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTxByResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'new tx',
        amount: 4000,
      }),
    )
  })

  it('should be able to get the transactions summary', async () => {
    const createTxResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new tx',
        amount: 4000,
        type: 'credit',
      })

    const cookies = createTxResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'debit tx',
        amount: 2000,
        type: 'debit',
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 2000,
    })
  })
})
