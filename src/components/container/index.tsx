import React from "react";
import { Typography } from "@mui/material";
import { LocalContainerProps, CLIinstance } from "types";
import { SetComponentStyles } from "@utils/general-helper";

export {
  MainContainer,
  SubContainer,
  TileContainer,
  GridContainer,
  TerminalContainer,
  CardContainer,
  UserContainer,
} from "./index.styled";

export const Container = ({
  cmpID,
  styleObj,
  children,
  rootElement,
  cmpFontSize,
}: LocalContainerProps) => {
  const cmpStyles = SetComponentStyles({ styleObj });
  const RootElement: React.ElementType = rootElement || "div";

  return (
    <RootElement {...(cmpID && { id: cmpID })} {...(cmpStyles && { className: cmpStyles })}>
      <Typography sx={{ fontSize: `${cmpFontSize}px` }} />
      {children}
    </RootElement>
  );
};

export const Terminal = ({
  cmpID,
  styleObj,
  cliObj,
}: LocalContainerProps & { cliObj: CLIinstance }) => {
  const cmpStyles = SetComponentStyles({ styleObj });

  return (
    <div {...(cmpID && { id: cmpID })} {...(cmpStyles && { className: cmpStyles })}>
      {Object.entries(cliObj).map(([cliKey, cliContext]) => {
        if (!Array.isArray(cliContext)) {
          return (
            <p
              key={cliKey}
              className={`directory ${cliContext.toLowerCase()}_${Number(cliKey) + 1}`}
            >
              {cliContext}
            </p>
          );
        } else {
          if (cliContext.every((item) => typeof item === "object" && item !== null)) {
            return (
              <pre key={cliKey} className="terminal-box">
                {cliContext.map(({ comment, command }, i) => (
                  <div key={i}>
                    <code className="comment">{comment}</code>
                    <br />
                    <code className="command">{command}</code>
                    <br />
                  </div>
                ))}
              </pre>
            );
          }

          return (
            <pre key={cliKey} className="terminal-box">
              {cliContext.map((cmd, cmdkey) => (
                <code key={cmdkey} className={`preset preset_${Number(cliKey) + 1}_${cmdkey + 1}`}>
                  {cmd.toString()}
                </code>
              ))}
            </pre>
          );
        }
      })}
    </div>
  );
};

type CardContentProps = {
  title?: string;
  descrp?: string;
  tags?: {
    label: string;
    value: string;
    attr: string;
  }[];
  context?: {
    label?: string;
    value?: string;
  }[];
  children?: React.ReactNode;
  hide?: boolean;
};

export const Card = ({
  cmpID,
  styleObj,
  cHeader,
  cBody,
  cFooter,
}: LocalContainerProps & {
  cHeader?: CardContentProps;
  cBody?: CardContentProps;
  cFooter?: CardContentProps;
}) => {
  const cmpStyles = SetComponentStyles({ styleObj });

  return (
    <div {...(cmpID && { id: cmpID })} {...(cmpStyles && { className: cmpStyles })}>
      {cHeader && (
        <div className="card_header">
          {cHeader?.title && <h4 className="title">{cHeader.title}</h4>}
          {cHeader?.descrp && <p className="descrp">{cHeader.descrp}</p>}
          {cHeader?.tags && (
            <p className="tags">
              {cHeader.tags.map((tag, tagKey) => (
                <span
                  key={tagKey}
                  className={`tag tag_${Number(tagKey) + 1} ${Object.keys(tag).map((tg) => tg)}`}
                >
                  {Object.values(tag).map((tg) => tg)}
                </span>
              ))}
            </p>
          )}
        </div>
      )}
      {cBody && (
        <div className="card_body">
          {cBody?.title && <h4 className="title">{cBody.title}</h4>}
          {cBody?.descrp && <p className="descrp">{cBody.descrp}</p>}
          {cBody?.context && (
            <div className="sums">
              {cBody.context.map((lblnv, lblnvKey) => (
                <p key={lblnvKey} className={`sum sum_${Number(lblnvKey) + 1}`}>
                  <span className="label">{lblnv.label}</span>
                  <span className="value">{lblnv.value}</span>
                </p>
              ))}
            </div>
          )}
          {cBody?.children && <>{cBody.children}</>}
        </div>
      )}
      {cFooter && (
        <div className="card_footer">
          {cFooter?.title && <h4 className="title">{cFooter.title}</h4>}
          {cFooter?.descrp && <p className="descrp">{cFooter.descrp}</p>}
          {cFooter?.context && (
            <div className="dependencies">
              {cFooter.context.map((dpncy, dpncyKey) => (
                <p key={dpncyKey} className={`sum sum_${Number(dpncyKey) + 1}`}>
                  <span className="label">{dpncy.label}</span>
                  <span className="value">{dpncy.value}</span>
                </p>
              ))}
            </div>
          )}
          {cFooter?.children && <>{cFooter.children}</>}
        </div>
      )}
    </div>
  );
};

export const User = ({
  cmpID,
  styleObj,
  memberObj,
  rootElement,
}: LocalContainerProps & {
  memberObj: {
    avatar: string;
    name: string;
    role?: string;
    url?: string;
    descrp?: string;
  };
}) => {
  const cmpStyles = SetComponentStyles({ styleObj });
  const { avatar, name, role, url, descrp } = memberObj;
  const RootElement: React.ElementType = (url ? "a" : rootElement) || "div";

  return (
    <RootElement
      {...(cmpID && { id: cmpID })}
      {...(cmpStyles && { className: cmpStyles })}
      {...(url && {
        href: url,
        target: "_blank",
      })}
    >
      <div className="card-top">
        <img src={avatar || ""} alt={`display_profile-${name}`} />
        <p className="user">
          <span>{name}</span>
          <span>{role}</span>
        </p>
      </div>
      {descrp && (
        <div className="card-bottom">
          <p className="details">{descrp}</p>
        </div>
      )}
    </RootElement>
  );
};
