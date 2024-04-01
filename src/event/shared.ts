export const EventTypes = ['auth-state-changed'] as const

export type EventType = (typeof EventTypes)[number]
