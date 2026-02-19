import { createLanguageSupportEngine } from '~/server/ai/engines/languages/language-support-engine'

const languageEngine = createLanguageSupportEngine()

export default defineEventHandler(async (event) => {
  try {
    const languages = await languageEngine.getSupportedLanguages()

    return {
      success: true,
      languages,
      features: languageEngine.getSupportedFeatures()
    }

  } catch (error) {
    console.error('Language Support Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get language support'
    })
  }
})
