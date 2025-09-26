declare module "react-diff-viewer-continued" {
  export interface DiffViewerProps {
    oldValue: string;
    newValue: string;
    splitView?: boolean;
    showDiffOnly?: boolean;
    leftTitle?: string;
    rightTitle?: string;
    styles?: Record<string, unknown>;
  }

  const DiffViewer: React.FC<DiffViewerProps>;
  export default DiffViewer;
}
