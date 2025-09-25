export interface Article {
  id: number;
  title: string;
  summary: string;
  published_at: string;
  source_url: string;
  ai_model_used?: string;
  processed_at?: string;
}
