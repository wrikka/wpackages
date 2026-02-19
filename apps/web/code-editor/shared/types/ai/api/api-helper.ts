export interface AIAPIHelperRequest {
  code: string
  language: string
  apiType: 'rest' | 'graphql' | 'websocket' | 'grpc' | 'soap' | 'rpc'
  options?: {
    framework?: string
    authentication?: 'none' | 'basic' | 'bearer' | 'oauth2'
    validation?: 'none' | 'basic' | 'advanced'
    documentation?: boolean
    examples?: boolean
    clientLibrary?: string
  }
}

export interface AIAPIHelperResponse {
  success: boolean
  integration: {
    type: string
    description: string
    endpoints: {
      method: string
      path: string
      description: string
      parameters: {
        name: string
        type: string
        description: string
        required: boolean
      }[]
    }[]
  }
  clientCode: {
    language: string
    code: string
    dependencies: string[]
    setup: string
  }
  serverCode: {
    language: string
    code: string
    dependencies: string[]
    setup: string
  }
  documentation: {
    overview: string
    endpoints: string
    authentication: string
    examples: string[]
  }
  examples: {
    title: string
    description: string
    code: string
    language: string
  }[]
}
