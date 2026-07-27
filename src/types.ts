export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
}

export interface Recommendation {
  type: string;
  name: string;
  description: string;
  acidity: string;
  sweetness: string;
  body: string;
  flavorNotes: string[];
  brewingMethod: string;
  grindSize: string;
  nextStep: string;
}

export interface ChatResponse {
  message: string;
  hasRecommendation: boolean;
  recommendation?: Recommendation;
}

export interface AppSettings {
  shopName: string;
  googleSheetsUrl: string;
}
