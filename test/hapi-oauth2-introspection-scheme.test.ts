import 'jest'
import { Server } from '@hapi/hapi'
import * as nock from 'nock'

import { OAuth2Scheme } from '../src/hapi-oauth2-introspection-scheme'
import { OAuth2IntrospectionOptions } from '../src/oauth2-introspector'
import fetch from 'node-fetch'

let server: Server

const introspectionHost = 'http://introspection.com'
const introspectionPath = '/introspect'

beforeEach(() => {
  server = new Server()
  server.auth.scheme('oauth2', OAuth2Scheme)

  const options: OAuth2IntrospectionOptions = {
    clientId: 'my-client-id',
    clientSecret: 'my-client-Secret',
    introspectionEndpoint: `${introspectionHost}${introspectionPath}`,
  }

  server.auth.strategy('default', 'oauth2', options)
})

afterEach(async () => {
  nock.cleanAll()
  await server.stop()
})

function handler() {
  return {
    done: true,
  }
}

test('with constant auth scope', async () => {
  const requiredScope = 'admin'
  server.route({
    path: '/',
    method: 'GET',
    handler,
    options: {
      auth: {
        strategy: 'default',
        scope: requiredScope,
      },
    },
  })

  await server.start()
  nock(introspectionHost).post(introspectionPath).reply(200, {
    active: true,
    scope: requiredScope,
  })
  const testUrl = `${server.info.uri}/`

  const response = await fetch(testUrl, {
    headers: {
      authorization: `Bearer token`,
    },
  })

  expect(await response.json()).toEqual({ done: true })
})

test('with dynamic auth scope', async () => {
  server.route({
    path: '/{projectKey}/me',
    method: 'GET',
    handler,
    options: {
      auth: {
        strategy: 'default',
        scope: 'admin-{params.projectKey}',
      },
    },
  })

  await server.start()
  nock(introspectionHost)
    .post(introspectionPath)
    .reply(200, {
      active: true,
      scope: 'admin-my-project',
    })
    .persist()
  const authorizedUrl = `${server.info.uri}/my-project/me`

  const authorizedResponse = await fetch(authorizedUrl, {
    headers: {
      authorization: `Bearer token`,
    },
  })

  expect(await authorizedResponse.json()).toEqual({ done: true })

  const unauthorizedUrl = `${server.info.uri}/my-project-1/me`

  const unauthorizedResponse = await fetch(unauthorizedUrl, {
    headers: {
      authorization: `Bearer token`,
    },
  })
  expect(unauthorizedResponse.status).toEqual(403)
})
