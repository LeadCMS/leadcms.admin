import { ContentDetails } from "@features/content/content-edit/types";
import { MdxComponentAnalysisDto } from "@lib/network/swagger-client";

export type onContentChangeStatusFunc = (hasChanged: boolean) => void;

export interface MDXEditorNewProps {
  value: string;
  onChange: (value: string) => void;
  isReadOnly: boolean | undefined;
  contentDetails: ContentDetails;
  onContentChangeStatus?: onContentChangeStatusFunc;
  livePreview?: boolean;
  livePreviewTemplate?: string;
  isMetadataCollapsed: boolean;
  preloadedMdxComponents?: MdxComponentAnalysisDto | null;
  originalContentForDiff?: string;
  contentFormat?: string; // Add content format for syntax validation
}
