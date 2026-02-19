import { reactive, ref } from 'vue'

export function useChatForms() {
  const modeHelperOpen = ref(true)

  const dataAnalystForm = reactive({ 
    goal: '', 
    data: '', 
    metric: '', 
    segmentBy: '' 
  })

  const businessPlanForm = reactive({ 
    idea: '', 
    customer: '', 
    pricing: '', 
    channel: '', 
    budget: '' 
  })

  const storyboardForm = reactive({ 
    platform: 'TikTok', 
    duration: '30s', 
    audience: '', 
    tone: '', 
    cta: '' 
  })

  const cheatSheetForm = reactive({ 
    topic: '', 
    level: 'beginner', 
    notes: '', 
    focus: '' 
  })

  const meetingNotesForm = reactive({ 
    notes: '', 
    decisionsNeeded: '', 
    actionOwners: '', 
    dueDates: '' 
  })

  const resumeForm = reactive({ 
    targetRole: '', 
    seniority: '', 
    jd: '', 
    bullets: '' 
  })

  const presentationForm = reactive({ 
    topic: '', 
    audience: '', 
    duration: '', 
    goal: '', 
    constraints: '' 
  })

  const resetForms = () => {
    Object.assign(dataAnalystForm, { goal: '', data: '', metric: '', segmentBy: '' })
    Object.assign(businessPlanForm, { idea: '', customer: '', pricing: '', channel: '', budget: '' })
    Object.assign(storyboardForm, { platform: 'TikTok', duration: '30s', audience: '', tone: '', cta: '' })
    Object.assign(cheatSheetForm, { topic: '', level: 'beginner', notes: '', focus: '' })
    Object.assign(meetingNotesForm, { notes: '', decisionsNeeded: '', actionOwners: '', dueDates: '' })
    Object.assign(resumeForm, { targetRole: '', seniority: '', jd: '', bullets: '' })
    Object.assign(presentationForm, { topic: '', audience: '', duration: '', goal: '', constraints: '' })
  }

  const getFormData = (formName: string) => {
    switch (formName) {
      case 'dataAnalyst': return dataAnalystForm
      case 'businessPlan': return businessPlanForm
      case 'storyboard': return storyboardForm
      case 'cheatSheet': return cheatSheetForm
      case 'meetingNotes': return meetingNotesForm
      case 'resume': return resumeForm
      case 'presentation': return presentationForm
      default: return null
    }
  }

  return {
    modeHelperOpen,
    dataAnalystForm,
    businessPlanForm,
    storyboardForm,
    cheatSheetForm,
    meetingNotesForm,
    resumeForm,
    presentationForm,
    resetForms,
    getFormData,
  }
}
