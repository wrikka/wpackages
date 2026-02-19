import { computed } from 'vue'

export function useContentShapeDetection(content: Ref<string>) {
  const normalize = (value: string) => value.replace(/\r\n/g, '\n')

  const hasDecisionMatrixShape = computed(() => {
    const t = normalize(content.value).toLowerCase()
    return (
      (t.includes('decision matrix') || t.includes('weighted total') || t.includes('criteria')) &&
      (t.includes('weight') || t.includes('weights'))
    )
  })

  const hasMeetingNotesShape = computed(() => {
    const t = normalize(content.value).toLowerCase()
    return (
      t.includes('decisions') &&
      (t.includes('action items') || t.includes('next steps'))
    )
  })

  const hasResumeShape = computed(() => {
    const t = normalize(content.value).toLowerCase()
    return (
      (t.includes('skills') && t.includes('experience')) ||
      (t.includes('ats') && t.includes('bullets'))
    )
  })

  const hasDataAnalystShape = computed(() => {
    const t = normalize(content.value).toLowerCase()
    return (
      (t.includes('analysis') && (t.includes('findings') || t.includes('insights'))) ||
      t.includes('sql') ||
      t.includes('cohort') ||
      t.includes('segmentation')
    )
  })

  const hasBusinessPlanShape = computed(() => {
    const t = normalize(content.value).toLowerCase()
    return (
      t.includes('executive summary') ||
      t.includes('go-to-market') ||
      t.includes('revenue model') ||
      t.includes('financial projections')
    )
  })

  const hasStoryboardShape = computed(() => {
    const t = normalize(content.value).toLowerCase()
    return (
      t.includes('storyboard') ||
      t.includes('scene') ||
      t.includes('shot') ||
      t.includes('panel')
    )
  })

  const hasCheatSheetShape = computed(() => {
    const t = normalize(content.value).toLowerCase()
    return (
      t.includes('cheat sheet') ||
      t.includes('quick tips') ||
      t.includes('common mistakes') ||
      t.includes('key concepts')
    )
  })

  const hasGeographyShape = computed(() => {
    const t = normalize(content.value).toLowerCase()
    return (
      t.includes('capital') ||
      t.includes('population') ||
      t.includes('continent') ||
      t.includes('currency') ||
      t.includes('language')
    )
  })

  const hasVocabularyShape = computed(() => {
    const t = normalize(content.value).toLowerCase()
    return (
      t.includes('vocabulary') ||
      t.includes('definition') ||
      t.includes('example') ||
      t.includes('term:')
    )
  })

  return {
    hasDecisionMatrixShape,
    hasMeetingNotesShape,
    hasResumeShape,
    hasDataAnalystShape,
    hasBusinessPlanShape,
    hasStoryboardShape,
    hasCheatSheetShape,
    hasGeographyShape,
    hasVocabularyShape,
  }
}
