export function getEnvFilePaths(nodeEnv?: string): string[] {
  const normalizedEnv = (nodeEnv ?? process.env.NODE_ENV ?? 'development').trim() || 'development';

  return [
    `.env.${normalizedEnv}.local`,
    `.env.${normalizedEnv}`,
    '.env.local',
    '.env',
  ];
}
