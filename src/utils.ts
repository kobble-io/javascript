import type { AuthenticationResult } from './global'
import type { User } from './global'
import type { TUser } from './jwt'

export const generateRandomString = () => {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.'
  let random = ''
  const randomValues = Array.from(getCrypto().getRandomValues(new Uint8Array(43)))
  randomValues.forEach((v) => (random += charset[v % charset.length]))
  return random
}

export const encode = (value: string) => btoa(value)
export const decode = (value: string) => atob(value)

export const getCrypto = () => {
  if (!window) {
    throw new Error('KobbleClient must be run in a browser environment.')
  }

  if (!window.crypto) {
    throw new Error('KobbleClient requires window.crypto to be available for security reasons.')
  }

  return window.crypto
}

export const sha256 = async (s: string) => {
  const digestOp = getCrypto().subtle.digest({ name: 'SHA-256' }, new TextEncoder().encode(s))

  return await digestOp
}

const decodeB64 = (input: string) =>
  decodeURIComponent(
    atob(input)
      .split('')
      .map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )

export const urlDecodeB64 = (input: string) =>
  decodeB64(input.replace(/_/g, '/').replace(/-/g, '+'))

const urlEncodeB64 = (input: string) => {
  const base64Charset: { [index: string]: string } = { '+': '-', '/': '_', '=': '' }
  return input.replace(/[+/=]/g, (m: string) => base64Charset[m])
}

export const bufferToBase64UrlEncoded = (input: ArrayBuffer) => {
  const ie11SafeInput = new Uint8Array(input)
  return urlEncodeB64(window.btoa(String.fromCharCode(...Array.from(ie11SafeInput))))
}

const clearUndefined = (params: Record<any, any>) => {
  return Object.keys(params)
    .filter((k) => typeof params[k] !== 'undefined')
    .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {})
}

export const createQueryParams = (params: Record<string, any>) => {
  return new URLSearchParams(clearUndefined(params)).toString()
}

export const parseAuthenticationResult = (queryString: string): AuthenticationResult => {
  if (queryString.indexOf('#') > -1) {
    queryString = queryString.substring(0, queryString.indexOf('#'))
  }

  const searchParams = new URLSearchParams(queryString)

  return {
    state: searchParams.get('state')!,
    code: searchParams.get('code') || undefined,
    error: searchParams.get('error') || undefined,
    error_description: searchParams.get('error_description') || undefined
  }
}

export const tUserToUser = (user: TUser | null): User | null => {
  if (!user) {
    return null
  }

  return {
    id: user.sub,
    email: user.email,
    name: user.name,
    pictureUrl: user.picture_url,
    isVerified: user.is_verified,
    stripeId: user.stripe_id,
    updatedAt: new Date(user.updated_at),
    createdAt: new Date(user.created_at)
  }
}
