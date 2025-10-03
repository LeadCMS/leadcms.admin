import { ContentDetails } from "@features/content/content-edit/types";
import { MdxComponentAnalysisDto } from "@lib/network/swagger-client";
import { ContentFormat } from "@features/content/content-types/content-types";

export type onContentChangeStatusFunc = (hasChanged: boolean) => void;

export interface MDXEditorNewProps {
  value: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
  contentDetails: ContentDetails;
  onContentChangeStatus?: (hasChanged: boolean) => void;
  livePreview?: boolean;
  livePreviewTemplate?: string;
  isMetadataCollapsed?: boolean;
  preloadedMdxComponents?: MdxComponentAnalysisDto;
  originalContentForDiff?: string;
  contentFormat?: ContentFormat;
}
