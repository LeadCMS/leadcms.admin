import { LocalContainerProps } from "types";
import { SetComponentStyles } from "@utils/general-helper";

export { TitleContainer } from "./index.styled";

export const Title = ({
  cmpID,
  styleObj,
  rootElementAlt,
  children,
  context,
  className,
  expanders,
  divisable,
}: LocalContainerProps & {
  rootElementAlt: "h6" | "h5" | "h4" | "h3" | "h2" | "h1" | "p";
  context: string;
  expanders?: boolean;
  divisable?: boolean;
}) => {
  const cmpStyles = SetComponentStyles({ className, styleObj });
  const RootElement: React.ElementType = rootElementAlt || "h3";

  return (
    <RootElement {...(cmpID && { id: cmpID })} {...(cmpStyles && { className: cmpStyles })}>
      {expanders && <span className={`expander${divisable ? "border-expand" : ""}`}>&nbsp;</span>}
      {!children ? (
        <span className={`context ${expanders ? "speard-out" : ""}`}>{context}</span>
      ) : (
        <>{children}</>
      )}
      {expanders && <span className={`expander${divisable ? "border-expand" : ""}`}>&nbsp;</span>}
    </RootElement>
  );
};
