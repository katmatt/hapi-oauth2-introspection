import * as Boom from '@hapi/boom'
import { Request, ResponseToolkit, Server } from '@hapi/hapi'

import {
  oauth2Introspector,
  OAuth2IntrospectionOptions,
} from './oauth2-introspector'

const schemeName = 'oauth2-introspection'

export type OAuthIntrospectionOptions = {
  clientId: string
  clientSecret: string
  introspectionEndpoint: string
}

export const OAuth2Scheme = function (_: Server, options?: object) {
  const oauth2Introspect = oauth2Introspector(
    options as OAuth2IntrospectionOptions
  )

  return {
    authenticate: async function (request: Request, h: ResponseToolkit) {
      const authorization = request.headers.authorization
      if (!authorization) {
        throw Boom.unauthorized(null, schemeName)
      }
      const authorizationParts = authorization.split(' ')
      if (
        authorizationParts.length !== 2 ||
        authorizationParts[0] !== 'Bearer'
      ) {
        throw Boom.unauthorized(null, schemeName)
      }
      const [_, token] = authorizationParts
      const { active, scope: scopeAsString } = await oauth2Introspect(token)
      if (active) {
        const scope = scopeAsString?.split(' ') ?? []
        return h.authenticated({ credentials: { scope } })
      }
      throw Boom.unauthorized(null, schemeName)
    },
  }
}
