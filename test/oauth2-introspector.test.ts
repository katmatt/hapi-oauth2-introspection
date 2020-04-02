import 'jest'
import * as nock from 'nock'

import { oauth2Introspector } from '../src/oauth2-introspector'

afterEach(() => nock.cleanAll())

const introspectionHost = 'http://oauth-introspector.com'
const introspectionPath = '/introspect'
const introspectionEndpoint = `${introspectionHost}${introspectionPath}`

test('get introspection result', async () => {
  const clientId = 'my-client-id'
  const clientSecret = 'my-client-secret'
  const token = '1234'

  const oauth2Introspect = oauth2Introspector({
    introspectionEndpoint,
    clientId,
    clientSecret,
  })

  nock(introspectionHost).post(introspectionPath).reply(200, { active: true })

  const { active } = await oauth2Introspect(token)
  expect(active).toBe(true)
})

test('get introspection result from commercetools', async () => {
  const introspectionEndpoint =
    'https://auth.europe-west1.gcp.commercetools.com/oauth/introspect'
  const clientId = process.env['CTP_CLIENT_ID'] as string
  const clientSecret = process.env['CTP_CLIENT_SECRET'] as string
  const token = process.env['CTP_TOKEN'] as string

  const oauth2Introspect = oauth2Introspector({
    introspectionEndpoint,
    clientId,
    clientSecret,
  })

  const { active, scope, exp } = await oauth2Introspect(token)
  expect(active).toBe(true)
  expect(scope).toBeDefined()
  expect(exp).toBeDefined()
})
