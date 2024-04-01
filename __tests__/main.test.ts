import { sayHello } from '../src/main'

describe('Say Hello', () => {
    it('returns 1', async () => {
        expect(sayHello()).toEqual(1)
    })
})