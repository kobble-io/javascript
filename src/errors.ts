export class KobbleAuthError extends Error {
  constructor(name: string, description: string) {
    super(description)
    this.name = name
  }
}

export const InvalidStateReasons = [
  'MissingOperation',
  'MissingCodeVerifier',
  'StateMismatch',
  'MissingState'
] as const

export type InvalidStateReason = (typeof InvalidStateReasons)[number]

export class InvalidStateError extends KobbleAuthError {
  constructor(description: InvalidStateReason) {
    super('InvalidStateError', description)
  }
}

export class AuthenticationError extends KobbleAuthError {
  constructor(description: string) {
    super('AuthenticationError', description)
  }
}
