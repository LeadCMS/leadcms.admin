declare module "mjml-browser" {
  interface MjmlError {
    line: number;
    message: string;
    tagName: string;
    formattedMessage: string;
  }
  interface MjmlResult {
    html: string;
    errors: MjmlError[];
  }
  interface MjmlOptions {
    validationLevel?: "strict" | "soft" | "skip";
    filePath?: string;
    keepComments?: boolean;
    minify?: boolean;
  }
  function mjml2html(mjml: string, options?: MjmlOptions): MjmlResult;
  export default mjml2html;
}
