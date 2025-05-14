import { parse as parseYaml, YAMLParseError } from "yaml";
import zod from "zod";

const FrontmatterSideMenu = zod.object({
  name: zod.string(),
  link: zod.string(),
});

const FrontmatterValidationScheme = zod.object({
  seoTitle: zod.string().optional(),
  seoKeywords: zod.string().optional(),
  seoDescription: zod.string().optional(),
  avatar: zod.string().optional(),
  sidemenu: FrontmatterSideMenu.array().optional(),
  sourceHref: zod.string().url().optional(),
});

export interface ValidateFrontmatterError {
  errorMessage: string;
  errorLine: number;
}

type ErrorInfo = { _errors: string[] };

const ProcessError = (errorObject: any, level: number) => {
  let errMessage = "";
  let i = 0;
  for (const [key, value] of Object.entries(errorObject)) {
    i++;
    if (key === "_errors" && Object.keys(errorObject).length > 1) {
      continue;
    }
    const errInfo = value as ErrorInfo;
    let error;
    if (Object.keys(errInfo).length > 1) {
      error = ProcessError(errInfo, level + 1);
    } else {
      error = (value as ErrorInfo)._errors[0];
    }
    const newLine = i === Object.keys(errorObject).length ? "" : "\n";
    const levelTabs = [...Array(level).keys()].reduce((acc, val, index) => {
      return `${acc} &nbsp; &nbsp; `;
    }, "");
    errMessage = `${errMessage}${level > 0 ? "\n" : ""}${levelTabs}**${key}** : ${error}${newLine}`;
  }
  return errMessage;
};

export const validateFrontmatter = (body: string) => {
  const frontmatterString = /---(.*?)---/s.exec(body);
  if (frontmatterString === null || frontmatterString[1] === null) {
    return {
      errorMessage: "Frontmatter doesn't exists",
      errorLine: -1,
    } as ValidateFrontmatterError;
  }
  try {
    const yaml = parseYaml(frontmatterString[1], {
      strict: true,
    });
    const validationResult = FrontmatterValidationScheme.safeParse(yaml);
    if (validationResult.success === false) {
      const formatted = validationResult.error.format();
      const errMessage = ProcessError(formatted, 0);
      return {
        errorMessage: errMessage,
        errorLine: 0,
      } as ValidateFrontmatterError;
    }
    return true;
  } catch (e) {
    const exc = e as YAMLParseError;
    return {
      errorMessage: exc.message,
      errorLine: exc.linePos && exc.linePos[0].line,
    } as ValidateFrontmatterError;
  }
};
