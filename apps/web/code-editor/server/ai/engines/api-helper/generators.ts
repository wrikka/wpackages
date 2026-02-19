import type { AIAPIHelperRequest } from '~/shared/types/ai-api-helper'

interface APIIntegration {
  type: string
  description: string
  endpoints: any[]
  authentication: any
  validation: any
}

export async function generateClientCode(request: AIAPIHelperRequest, integration: APIIntegration) {
  const { language, apiType } = request
  const { endpoints } = integration

  switch (language) {
    case 'javascript':
    case 'typescript':
      return generateJSClient(apiType, endpoints)
    case 'python':
      return generatePythonClient(apiType, endpoints)
    case 'go':
      return generateGoClient(apiType, endpoints)
    default:
      return `// Client code for ${language} not yet implemented`
  }
}

export async function generateServerCode(request: AIAPIHelperRequest, integration: APIIntegration) {
  const { language, apiType } = request
  const { endpoints } = integration

  switch (language) {
    case 'javascript':
    case 'typescript':
      return generateJSServer(apiType, endpoints)
    case 'python':
      return generatePythonServer(apiType, endpoints)
    case 'go':
      return generateGoServer(apiType, endpoints)
    default:
      return `// Server code for ${language} not yet implemented`
  }
}

export async function generateDocumentation(request: AIAPIHelperRequest, integration: APIIntegration) {
  const { apiType } = request
  const { endpoints, authentication, validation } = integration

  return `# API Documentation

## Overview
${integration.description}

## Authentication
Type: ${authentication.type}
Methods: ${authentication.methods.join(', ')}

## Validation
Library: ${validation.library}
Rules: ${validation.rules.join(', ')}

## Endpoints
${endpoints.map((ep: any) => `
### ${ep.method || ep.name} ${ep.path || ''}
Type: ${ep.type}
`).join('\n')}
`
}

export async function generateExamples(request: AIAPIHelperRequest, integration: APIIntegration) {
  const { language } = request
  const { endpoints } = integration

  switch (language) {
    case 'javascript':
    case 'typescript':
      return generateJSExamples(endpoints)
    case 'python':
      return generatePythonExamples(endpoints)
    default:
      return `// Examples for ${language} not yet implemented`
  }
}

function generateJSClient(apiType: string, endpoints: any[]) {
  if (apiType === 'rest') {
    return `class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

${endpoints.map((ep: any) => `  async ${ep.method?.toLowerCase()}${ep.path?.replace(/\//g, '')}(params = {}) {
    const response = await fetch(\`\${this.baseURL}${ep.path}\`, {
      method: '${ep.method}',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });
    return response.json();
  }`).join('\n\n')}
}`
  }
  return '// REST client generation'
}

function generateJSServer(apiType: string, endpoints: any[]) {
  if (apiType === 'rest') {
    return `const express = require('express');
const app = express();

app.use(express.json());

${endpoints.map((ep: any) => `app.${ep.method?.toLowerCase()}('${ep.path}', (req, res) => {
  // TODO: Implement ${ep.method} ${ep.path}
  res.json({ message: '${ep.method} ${ep.path} endpoint' });
});`).join('\n\n')}

module.exports = app;`
  }
  return '// REST server generation'
}

function generatePythonClient(apiType: string, endpoints: any[]) {
  return `import requests

class APIClient:
    def __init__(self, base_url):
        self.base_url = base_url

${endpoints.map((ep: any) => `    def ${ep.method?.toLowerCase()}${ep.path?.replace(/\//g, '')}(self, params=None):
        response = requests.${ep.method?.lower()}(
            f"{self.base_url}${ep.path}",
            json=params
        )
        return response.json()`).join('\n\n')}`
}

function generatePythonServer(apiType: string, endpoints: any[]) {
  return `from flask import Flask, request, jsonify

app = Flask(__name__)

${endpoints.map((ep: any) => `@app.route('${ep.path}', methods=['${ep.method}'])
def ${ep.method?.toLowerCase()}${ep.path?.replace(/\//g, '')}():
    # TODO: Implement ${ep.method} ${ep.path}
    return jsonify({"message": "${ep.method} ${ep.path} endpoint"})`).join('\n\n')}`
}

function generateGoClient(apiType: string, endpoints: any[]) {
  return `package main

import (
    "encoding/json"
    "net/http"
)

type APIClient struct {
    BaseURL string
    Client  *http.Client
}

func NewAPIClient(baseURL string) *APIClient {
    return &APIClient{
        BaseURL: baseURL,
        Client:  &http.Client{},
    }
}
// Go client implementation would go here`
}

function generateGoServer(apiType: string, endpoints: any[]) {
  return `package main

import (
    "encoding/json"
    "net/http"
)

func main() {
    // Go server implementation would go here
}`
}

function generateJSExamples(endpoints: any[]) {
  return `// JavaScript Examples

${endpoints.map((ep: any) => `// ${ep.method} ${ep.path}
fetch('${ep.path}', {
  method: '${ep.method}',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({})
})
  .then(response => response.json())
  .then(data => console.log(data));`).join('\n\n')}`
}

function generatePythonExamples(endpoints: any[]) {
  return `# Python Examples

import requests

${endpoints.map((ep: any) => `# ${ep.method} ${ep.path}
response = requests.${ep.method?.lower()}('${ep.path}', json={})
print(response.json())`).join('\n\n')}`
}
