import { createTemplateEngine } from '~/server/ai/engines/templates/template-engine'
import type { AITemplateRequest, AITemplateResponse } from '~/shared/types/ai'

const templateEngine = createTemplateEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AITemplateRequest>(event)

    if (!body.templateId || !body.projectName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: templateId, projectName'
      })
    }

    const result = await templateEngine.generateProject({
      templateId: body.templateId,
      projectName: body.projectName,
      options: body.options || {}
    })

    return {
      success: true,
      project: result.project,
      files: result.files,
      instructions: result.instructions
    } as AITemplateResponse

  } catch (error) {
    console.error('Template Generation Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate project'
    })
  }
})
