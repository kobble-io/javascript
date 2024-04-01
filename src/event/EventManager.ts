import { EventPubSub } from './EventPubSub'
import type { User } from '../global'

export class EventManager {
  private authStateChangedEvent: EventPubSub<{
    user: User | null
  }>

  constructor() {
    this.authStateChangedEvent = new EventPubSub<{
      user: User | null
    }>()
  }

  publishAuthStateChangedEvent(data: { user: User | null }) {
    this.authStateChangedEvent.publish(data)
  }

  subscribeAuthStateChangedEvent(handler: (data: { user: User | null }) => void) {
    return this.authStateChangedEvent.subscribe(handler)
  }

  unsubscribeAuthStateChangedEvent(handler: (data: { user: User | null }) => void) {
    this.authStateChangedEvent.unsubscribe(handler)
  }
}
