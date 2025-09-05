export interface MarkdownLiveViewerProps {
  params: Record<string, unknown>;
  template: string;
  viewerKey?: React.Key; // Renamed from key to avoid React special prop warning
}

export interface LivePreviewParams {
  language: string;
  userId: string;
  slug: string;
}
