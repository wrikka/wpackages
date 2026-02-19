export interface SuggestionAction {
  type: 'create_workflow' | 'run_command' | 'open_url';
  details: any;
}

export interface Suggestion {
  id: string;
  text: string;
  action: SuggestionAction;
}
