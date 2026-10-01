export function durationInSeconds(value: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value)
  if (!match) throw new Error('Duração JWT inválida')

  const amount = Number(match[1])
  const multiplier = { ms: 0.001, s: 1, m: 60, h: 3600, d: 86400 }[match[2] as 'ms' | 's' | 'm' | 'h' | 'd']
  return Math.max(1, Math.ceil(amount * multiplier))
}
