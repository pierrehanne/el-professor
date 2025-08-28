import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment-specific configuration
const loadEnvConfig = () => {
  const nodeEnv = process.env.NODE_ENV || 'development'

  let envFile: string
  switch (nodeEnv) {
    case 'production':
      envFile = '.env.prod'
      break
    case 'development':
      envFile = '.env.dev'
      break
    default:
      envFile = '.env.local'
  }

  // Load the environment-specific file
  const envPath = resolve(process.cwd(), envFile)
  const result = config({ path: envPath })

  if (result.error) {
    console.warn(`Warning: Could not load ${envFile}, falling back to .env.local`)
    // Fallback to .env.local if environment-specific file doesn't exist
    config({ path: resolve(process.cwd(), '.env.local') })
  } else {
    console.log(`✅ Loaded environment config from ${envFile}`)
  }
}

// Load configuration immediately
loadEnvConfig()

// Export environment variables with validation
export const envConfig = {
  googleApiKey: process.env.GOOGLE_API_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Validate required environment variables
export const validateEnvConfig = () => {
  const requiredVars = ['GOOGLE_API_KEY']
  const missing = requiredVars.filter(varName => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export default envConfig
