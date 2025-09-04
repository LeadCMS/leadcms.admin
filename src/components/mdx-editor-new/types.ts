import { ContentDetails } from "@features/content/content-edit/types";
import { ValidateFrontmatterError } from "utils/frontmatter-validator";

export type onFrontmatterErrorChangeFunc = (error: ValidateFrontmatterError | null) => void;

export interface MDXEditorNewProps {
  value: string;
  onChange: (value: string) => void;
  isReadOnly: boolean | undefined;
  contentDetails: ContentDetails;
  onFrontmatterErrorChange: onFrontmatterErrorChangeFunc;
  livePreview?: boolean;
  livePreviewTemplate?: string;
  isMetadataCollapsed: boolean;
}
