import type { AIAPIHelperRequest, AIAPIHelperResponse } from '~/shared/types/ai-api-helper'
import { analyzeAPIIntegration } from './analyzers'
import { generateClientCode, generateServerCode, generateDocumentation, generateExamples } from './generators'

export function createAPIHelperEngine() {
  return {
    async generateAPIIntegration(request: AIAPIHelperRequest): Promise<Omit<AIAPIHelperResponse, 'success'>> {
      const integration = await analyzeAPIIntegration(request)
      const clientCode = await generateClientCode(request, integration)
      const serverCode = await generateServerCode(request, integration)
      const documentation = await generateDocumentation(request, integration)
      const examples = await generateExamples(request, integration)

      return {
        integration,
        clientCode,
        serverCode,
        documentation,
        examples
      }
    }
  }
}
