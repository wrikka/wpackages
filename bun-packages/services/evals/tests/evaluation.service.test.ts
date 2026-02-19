import { describe, it, expect, beforeEach } from 'bun:test'
import { EvaluationService } from '../src/services'

describe('EvaluationService', () => {
  let service: EvaluationService

  beforeEach(() => {
    service = new EvaluationService()
  })

  it('should evaluate with accuracy metric', async () => {
    const result = await service.evaluate(
      {
        input: 'What is 2+2?',
        output: '4',
        expected: '4'
      },
      { metrics: ['accuracy'] }
    )

    expect(result.score).toBe(1)
    expect(result.metrics.accuracy).toBe(1)
    expect(result.evaluationType).toBe('accuracy')
  })

  it('should evaluate with similarity metric', async () => {
    const result = await service.evaluate(
      {
        input: 'What is the capital of Thailand?',
        output: 'Bangkok',
        expected: 'Bangkok'
      },
      { metrics: ['similarity'] }
    )

    expect(result.score).toBe(1)
    expect(result.metrics.similarity).toBe(1)
    expect(result.evaluationType).toBe('similarity')
  })

  it('should handle multiple metrics with weights', async () => {
    const result = await service.evaluate(
      {
        input: 'Test question',
        output: 'Test answer',
        expected: 'Test answer'
      },
      {
        metrics: ['accuracy', 'similarity'],
        weights: { accuracy: 0.7, similarity: 0.3 }
      }
    )

    expect(result.score).toBe(1)
    expect(result.metrics.accuracy).toBe(1)
    expect(result.metrics.similarity).toBe(1)
  })

  it('should return available metrics', () => {
    const metrics = service.getAvailableMetrics()
    expect(metrics).toContain('accuracy')
    expect(metrics).toContain('similarity')
    expect(metrics).toContain('jaccard_similarity')
    expect(metrics).toContain('relevance')
  })

  it('should throw error for unknown metric', async () => {
    await expect(async () => {
      await service.evaluate(
        {
          input: 'Test',
          output: 'Test',
          expected: 'Test'
        },
        { metrics: ['unknown_metric'] }
      )
    }).toThrow('Unknown metric: unknown_metric')
  })

  it('should evaluate batch of inputs', async () => {
    const inputs = [
      {
        input: 'What is 1+1?',
        output: '2',
        expected: '2'
      },
      {
        input: 'What is 2+2?',
        output: '4',
        expected: '4'
      }
    ]

    const results = await service.evaluateBatch(inputs, { metrics: ['accuracy'] })

    expect(results).toHaveLength(2)
    expect(results[0].score).toBe(1)
    expect(results[1].score).toBe(1)
  })
})
