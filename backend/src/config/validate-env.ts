export type AppEnvironment = NodeJS.ProcessEnv & {
  DATABASE_URL: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  PORT: string
  CORS_ORIGINS: string
}

export function validateEnv(environment: NodeJS.ProcessEnv): AppEnvironment {
  const databaseUrl = environment.DATABASE_URL
  const jwtSecret = environment.JWT_SECRET
  const jwtExpiresIn = environment.JWT_EXPIRES_IN ?? '1h'
  const port = environment.PORT ?? '3001'
  const corsOrigins = environment.CORS_ORIGINS ?? 'http://localhost:4173,http://localhost:5173'

  if (!databaseUrl || !/^postgres(ql)?:\/\//.test(databaseUrl)) {
    throw new Error('DATABASE_URL deve ser uma URL PostgreSQL válida')
  }
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres')
  }
  if (!/^\d+(ms|s|m|h|d)$/.test(jwtExpiresIn)) {
    throw new Error('JWT_EXPIRES_IN deve usar uma unidade ms, s, m, h ou d')
  }
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    throw new Error('PORT deve ser um inteiro entre 1 e 65535')
  }
  if (!corsOrigins.split(',').every((origin) => URL.canParse(origin.trim()))) {
    throw new Error('CORS_ORIGINS deve conter origens válidas separadas por vírgula')
  }

  return {
    ...environment,
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: jwtExpiresIn,
    PORT: port,
    CORS_ORIGINS: corsOrigins,
  }
}
