export interface MarkdownLiveViewerProps {
  params: Record<string, unknown>;
  template: string;
}

export interface LivePreviewParams {
  language: string;
  userId: string;
  slug: string;
}
