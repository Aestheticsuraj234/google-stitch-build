import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'

export type AIModel = 'sketch-mini' | 'sketch-pro'

export const providers = {
  'sketch-mini': {
    name: 'sketch-mini',
    description: 'Fast genration with gemini',
    provider: 'google',
    model: 'gemini-2.5-flash',
  },
  'sketch-pro': {
    name: 'sketch-pro',
    description: 'Advacned generation with mistralai/devstral-2512:free',
    provider: 'openrouter',
    model: 'mistralai/devstral-2512:free',
  },
}

export function createGoogleProvider() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  return createGoogleGenerativeAI({ apiKey })
}

export function createOpenRouterProvider() {
  const apiKey = process.env.OPENROUTER_AI_GATEWAY_API_KEY

  return createOpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
  })
}

export function getAIModel(modelType: AIModel) {
  const config = providers[modelType]

  if (config.provider === 'google') {
    const google = createGoogleProvider()
    return google(config.model)
  } else {
    const openrouter = createOpenRouterProvider()
    return openrouter(config.model)
  }
}
