import { describe, expect, it } from 'vitest'
import { hello } from '../index'

describe('hello', () => {
  it('should return hello world', () => {
    expect(hello()).toBe('Hello world')
  })
})
