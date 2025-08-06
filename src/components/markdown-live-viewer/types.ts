export interface MarkdownLiveViewerProps {
  params: Record<string, unknown>;
  template: string;
  key?: React.Key; // Add key prop
}

export interface LivePreviewParams {
  language: string;
  userId: string;
  slug: string;
}
