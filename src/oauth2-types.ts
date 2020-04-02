export type OAuth2Response = {
  active: boolean
  scope?: string
  exp?: number
}

export type OAuth2Introspect = (token: string) => Promise<OAuth2Response>
