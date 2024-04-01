import type { EventType } from './shared'

export class EventPubSub<EventDataType> {
  private subscribers: Array<(data: EventDataType) => void>

  constructor(private event: EventType) {
    this.subscribers = []
  }

  subscribe(handler: (data: EventDataType) => void) {
    this.subscribers.push(handler)

    return {
      unsubscribe: () => {
        this.unsubscribe(handler)
      }
    }
  }

  unsubscribe(handler: (data: any) => void) {
    if (this.subscribers.includes(handler)) {
      const index = this.subscribers.findIndex((item) => item === handler)
      this.subscribers.splice(index, 1)
    }
  }

  publish(data: EventDataType) {
    this.subscribers.forEach((handler) => {
      handler(data)
    })
  }
}
