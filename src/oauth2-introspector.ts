import fetch from 'node-fetch'
import formurlencoded from 'form-urlencoded'

import { OAuth2Introspect } from './oauth2-types'

export type OAuth2IntrospectionOptions = {
  clientId: string
  clientSecret: string
  introspectionEndpoint: string
}

export function oauth2Introspector(
  options: OAuth2IntrospectionOptions
): OAuth2Introspect {
  const { clientId, clientSecret } = options
  const bearerToken = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  )
  const authorization = `Basic ${bearerToken}`

  const fetchOptions = {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }

  return async (token: string) => {
    const body = `${formurlencoded({ token })}`
    const { introspectionEndpoint } = options
    const response = await fetch(introspectionEndpoint, {
      body,
      ...fetchOptions,
    })
    return response.json()
  }
}
