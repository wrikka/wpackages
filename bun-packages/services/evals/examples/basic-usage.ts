import { 
  EvaluationService, 
  BenchmarkService, 
  TemplateService,
  InMemoryStorageAdapter,
  EvaluationRepository 
} from '../src'

async function basicEvaluationExample() {
  console.log('=== Basic Evaluation Example ===')
  
  const evaluationService = new EvaluationService()
  
  const result = await evaluationService.evaluate(
    {
      input: 'What is the capital of Thailand?',
      output: 'Bangkok',
      expected: 'Bangkok',
      model: 'gpt-4'
    },
    {
      metrics: ['accuracy', 'similarity'],
      weights: { accuracy: 0.6, similarity: 0.4 }
    }
  )
  
  console.log('Evaluation Result:', {
    id: result.id,
    score: result.score,
    metrics: result.metrics,
    model: result.model
  })
}

async function templateExample() {
  console.log('\n=== Template Example ===')
  
  const templateService = new TemplateService()
  const evaluationService = new EvaluationService()
  
  const templates = templateService.getAllTemplates()
  console.log('Available templates:', templates.map(t => ({ id: t.id, name: t.name, category: t.category })))
  
  const qaTemplate = templateService.getTemplate('qa-basic')
  if (qaTemplate) {
    const config = templateService.createEvaluationConfig('qa-basic')
    if (config) {
      const result = await evaluationService.evaluate(
        {
          input: 'What is 2+2?',
          output: '4',
          expected: '4',
          model: 'claude-3'
        },
        config
      )
      
      console.log('Template-based evaluation:', {
        template: qaTemplate.name,
        score: result.score,
        metrics: result.metrics
      })
    }
  }
}

async function benchmarkExample() {
  console.log('\n=== Benchmark Example ===')
  
  const benchmarkService = new BenchmarkService()
  
  const dataset = {
    name: 'math-qa',
    description: 'Basic math Q&A dataset',
    items: [
      {
        id: '1',
        input: 'What is 1+1?',
        expected: '2',
        category: 'arithmetic',
        difficulty: 'easy' as const
      },
      {
        id: '2',
        input: 'What is 5*3?',
        expected: '15',
        category: 'arithmetic',
        difficulty: 'easy' as const
      }
    ]
  }
  
  benchmarkService.registerDataset(dataset)
  
  const benchmarkConfig = {
    name: 'math-benchmark',
    description: 'Test math capabilities',
    models: ['gpt-4', 'claude-3'],
    datasets: ['math-qa'],
    metrics: ['accuracy'],
    parallel: false
  }
  
  console.log('Running benchmark...')
  const results = await benchmarkService.runBenchmark(benchmarkConfig)
  
  for (const result of results) {
    console.log(`Benchmark result for ${result.model} on ${result.dataset}:`, {
      averageScore: result.summary.averageScore,
      successRate: result.summary.successRate,
      totalItems: result.summary.totalItems
    })
  }
}

async function storageExample() {
  console.log('\n=== Storage Example ===')
  
  const storageAdapter = new InMemoryStorageAdapter()
  const repository = new EvaluationRepository(storageAdapter)
  const evaluationService = new EvaluationService()
  
  const result = await evaluationService.evaluate(
    {
      input: 'Test question',
      output: 'Test answer',
      expected: 'Test answer',
      model: 'test-model'
    },
    { metrics: ['accuracy'] }
  )
  
  await repository.saveResult(result)
  
  const savedResult = await repository.getResult(result.id)
  console.log('Saved and retrieved result:', savedResult?.id === result.id)
  
  const allResults = await repository.getResults()
  console.log('Total results in storage:', allResults.length)
  
  const averageScore = await repository.getAverageScore()
  console.log('Average score:', averageScore)
}

async function main() {
  try {
    await basicEvaluationExample()
    await templateExample()
    await benchmarkExample()
    await storageExample()
    
    console.log('\n=== All examples completed successfully! ===')
  } catch (error) {
    console.error('Error running examples:', error)
  }
}

if (import.meta.main) {
  main()
}
