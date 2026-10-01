import { durationInSeconds } from './duration'

describe('durationInSeconds', () => {
  it.each([
    ['30s', 30],
    ['15m', 900],
    ['1h', 3600],
    ['7d', 604800],
    ['100ms', 1],
  ])('converts %s to %i seconds', (input, expected) => {
    expect(durationInSeconds(input)).toBe(expected)
  })

  it('rejects values without a supported unit', () => {
    expect(() => durationInSeconds('soon')).toThrow('Duração JWT inválida')
  })
})
