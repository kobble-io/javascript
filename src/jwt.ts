import { urlDecodeB64 } from './utils'

const isNumber = (n: any) => typeof n === 'number'

export type TUser = {
  sub: string
  id: string
  email: string | null
  name: string | null
  picture_url: string | null
  is_verified: boolean
  stripe_id: string | null
  updated_at: string
  created_at: string
}

export type IdTokenPayloadBase = {
  iss: string
  aud: string
  exp: number
  iat: number
}

export type AccessTokenClaims = {
  __raw: string
} & AccessTokenPayloadBase

export type AccessTokenPayloadBase = {
  iss: string
  aud: string
  exp: number
  iat: number
  sub: string
}

export type IdTokenPayload = IdTokenPayloadBase & TUser

export type IdToken = {
  __raw: string
} & IdTokenPayload

export type VerifyIdTokenParams = {
  token: string
  iss: string
  aud: string
}

export type DecodedIdToken = {
  encoded: {
    header: string
    payload: string
    signature: string
  }
  header: {
    alg: string
    typ: string
  }
  claims: IdToken
  user: TUser
}

export type DecodedAccessToken = {
  encoded: {
    header: string
    payload: string
    signature: string
  }
  header: {
    alg: string
    typ: string
  }
  claims: AccessTokenClaims
}

export const decodeIdToken = (token: string): DecodedIdToken => {
  const parts = token.split('.')
  const [header, payload, signature] = parts

  if (parts.length !== 3 || !header || !payload || !signature) {
    throw new Error('JWT is not valid')
  }

  const payloadJSON = JSON.parse(urlDecodeB64(payload))

  const claims: IdToken = {
    __raw: token,
    ...payloadJSON
  }

  const user: TUser = {
    sub: payloadJSON.sub,
    id: payloadJSON.id,
    email: payloadJSON.email,
    name: payloadJSON.name,
    picture_url: payloadJSON.picture_url,
    is_verified: payloadJSON.is_verified,
    stripe_id: payloadJSON.stripe_id,
    updated_at: payloadJSON.updated_at,
    created_at: payloadJSON.created_at
  }

  return {
    encoded: { header, payload, signature },
    header: JSON.parse(urlDecodeB64(header)),
    claims,
    user
  }
}

export const decodeAccessToken = (token: string): DecodedAccessToken => {
  const parts = token.split('.')
  const [header, payload, signature] = parts

  if (parts.length !== 3 || !header || !payload || !signature) {
    throw new Error('JWT is not valid')
  }

  const payloadJSON = JSON.parse(urlDecodeB64(payload))

  const claims: AccessTokenClaims = {
    __raw: token,
    ...payloadJSON
  }
  return {
    encoded: { header, payload, signature },
    header: JSON.parse(urlDecodeB64(header)),
    claims
  }
}

export const verifyIdToken = (params: VerifyIdTokenParams) => {
  const { token } = params

  if (!token) {
    throw new Error('ID token is required but missing')
  }

  const decoded = decodeIdToken(token)

  if (!decoded.claims.iss) {
    throw new Error('Issuer (iss) claim must be a string present in the ID token')
  }

  if (decoded.claims.iss !== params.iss) {
    throw new Error(
      `Issuer (iss) claim mismatch in the ID token; expected "${params.iss}", found "${decoded.claims.iss}"`
    )
  }

  if (!decoded.user.sub) {
    throw new Error('Subject (sub) claim must be a string present in the ID token')
  }

  if (decoded.header.alg !== 'HS256' && decoded.header.alg !== 'ES256') {
    throw new Error(
      `Signature algorithm of "${decoded.header.alg}" is not supported. Expected the ID token to be signed with "HS256".`
    )
  }

  if (!decoded.claims.aud) {
    throw new Error('Audience (aud) claim must be a string present in the ID token')
  }

  if (decoded.claims.aud !== params.aud) {
    throw new Error(
      `Audience (aud) claim mismatch in the ID token. Expected "${params.aud}", found "${decoded.claims.aud}"`
    )
  }

  if (decoded.claims.exp == null || !isNumber(decoded.claims.exp)) {
    throw new Error('Expiration Time (exp) claim must be a number present in the ID token')
  }

  if (!isNumber(decoded.claims.iat)) {
    throw new Error('Issued At (iat) claim must be a number present in the ID token')
  }

  const ACCEPTED_GAP_IN_SECOND = 60 // 1 minute
  const now = new Date(Date.now())
  const expDate = new Date(0)

  expDate.setUTCSeconds(decoded.claims.exp + ACCEPTED_GAP_IN_SECOND)

  if (now > expDate) {
    throw new Error(
      `Expiration Time (exp) claim error in the ID token. Current time (${now}) is after expiration time (${expDate})`
    )
  }

  return decoded
}
