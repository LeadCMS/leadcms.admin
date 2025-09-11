import { ContentDetails } from "@features/content/content-edit/types";
import { ValidateFrontmatterError } from "utils/frontmatter-validator";
import { MdxComponentAnalysisDto } from "@lib/network/swagger-client";

export type onFrontmatterErrorChangeFunc = (error: ValidateFrontmatterError | null) => void;
export type onContentChangeStatusFunc = (hasChanged: boolean) => void;

export interface MDXEditorNewProps {
  value: string;
  onChange: (value: string) => void;
  isReadOnly: boolean | undefined;
  contentDetails: ContentDetails;
  onFrontmatterErrorChange: onFrontmatterErrorChangeFunc;
  onContentChangeStatus?: onContentChangeStatusFunc;
  livePreview?: boolean;
  livePreviewTemplate?: string;
  isMetadataCollapsed: boolean;
  preloadedMdxComponents?: MdxComponentAnalysisDto | null;
  originalContentForDiff?: string;
}
