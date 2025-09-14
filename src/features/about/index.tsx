import { ModuleWrapper } from "@components/module-wrapper";
import { useRequestContext } from "@providers/request-provider";
import { Alert, Badge } from "@mui/material";
import { useEffect, useState } from "react";
import { Download, Heart } from "lucide-react";
import {
  MainContainer,
  SubContainer,
  TileContainer,
  GridContainer,
  TerminalContainer,
  CardContainer,
  UserContainer,
} from "@components/container";
import { TabularGridContainer } from "@components/tabular-grid";
import { TitleContainer } from "@components/title";
import {
  LeadCMSbadges,
  TeckStack,
  Storage,
  ExternalResources,
  CLI,
  Contributors,
  SystemStatus,
} from "./siteConfigInfo";

export const AboutModule = () => {
  const { client } = useRequestContext();
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  const selfHostedBadge = LeadCMSbadges.find((mt) => mt.label === "Self-Hosted") || null;

  useEffect(() => {
    const getVersion = async () => {
      const { data } = await client.api.versionList();
      setBackendVersion(data.version || "Unknown");
    };
    getVersion();
  });

  return (
    <ModuleWrapper breadcrumbs={[]} currentBreadcrumb={"About"}>
      <MainContainer
        cmpID="about_section"
        styleObj={{
          cmpTag: "main",
          cmpStyles: ["container"],
        }}
        cmpFontSize={18}
      >
        <SubContainer
          cmpID="banner"
          styleObj={{
            cmpTag: "sub",
            cmpStyles: ["container"],
          }}
          cmpFontSize={16}
        >
          <TileContainer
            cmpID="organization"
            styleObj={{
              cmpTag: "logo",
              cmpStyles: ["container"],
            }}
            cmpFontSize={16}
          >
            <img src="/images/logo.png" alt="LeadCMS.ai Logo" className="brand-logo" />
            <h1 className="brand-name">LeadCMS.ai</h1>
            <p className="memo">The Open-Source Sales Automation & CMS for SaaS</p>
          </TileContainer>
          <TileContainer
            styleObj={{
              cmpTag: "badge",
              cmpStyles: ["container"],
            }}
            cmpFontSize={10}
          >
            {LeadCMSbadges.filter((mt) => mt.label !== "Self-Hosted").map((mt, _key) => (
              <Badge
                // variant={mt.variant}
                key={`0${_key}`}
                className={mt.attr}
              >
                {mt.label}
              </Badge>
            ))}
          </TileContainer>
        </SubContainer>

        {Storage.server.deployment === "On-Premises" && selfHostedBadge && (
          <SubContainer
            cmpID="update_indicator"
            styleObj={{
              cmpTag: "sub",
              cmpStyles: ["container"],
            }}
            cmpFontSize={16}
          >
            <Alert className="alert normal">
              <h5 className="alert-title">
                <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>
                  New version available: v
                  {
                    TeckStack.site.segment_i.tags.find((tag) => tag.label === "latestVersion")
                      ?.value
                  }
                </span>
              </h5>
              <p className="alert-description">
                Update your on-premises deployment using Docker Compose:
              </p>
              <TerminalContainer
                styleObj={{
                  cmpTag: "terminal",
                  cmpStyles: ["container"],
                }}
                cliObj={CLI}
              />
            </Alert>
          </SubContainer>
        )}

        <SubContainer
          styleObj={{
            cmpTag: "system-detail",
            cmpStyles: ["container"],
          }}
        >
          <>
            {Object.entries(TeckStack).map(([segmentKey, segment]) => (
              <CardContainer
                key={segmentKey}
                styleObj={{
                  cmpTag: "system-detail",
                  cmpStyles: ["container"],
                }}
                cHeader={segment.segment_i || null}
                cBody={segment.segment_ii || null}
                cFooter={segment.segment_iii || null}
              />
            ))}
          </>
        </SubContainer>

        <TabularGridContainer
          styleObj={{
            cmpTag: "tab",
            cmpStyles: ["segment"],
          }}
          gridObj={SystemStatus}
        />

        <TitleContainer
          styleObj={{
            cmpTag: "resources",
            cmpStyles: ["title-bar"],
          }}
          rootElementAlt={"h2"}
          context="Resources"
          expanders={true}
          divisable={true}
        />

        <SubContainer
          cmpID="resources"
          styleObj={{
            cmpTag: "sub",
            cmpStyles: ["container"],
          }}
          cmpFontSize={16}
        >
          <>
            {ExternalResources.map((link, linkKey) => (
              <TileContainer
                key={linkKey}
                styleObj={{
                  cmpTag: "resource",
                  cmpStyles: ["container"],
                }}
                cmpFontSize={16}
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <span className="icon">{link.icon}</span>
                  <h4 className="domain">{link.name}</h4>
                </a>
              </TileContainer>
            ))}
          </>
        </SubContainer>

        <TitleContainer
          styleObj={{
            cmpTag: "contributors",
            cmpStyles: ["title-bar"],
          }}
          rootElementAlt={"h2"}
          context="Development Team"
          expanders={true}
          divisable={true}
        />

        <SubContainer
          styleObj={{
            cmpTag: "contributors",
            cmpStyles: ["container"],
          }}
        >
          <>
            {Contributors.map((member, memberKey) => (
              <UserContainer
                key={memberKey}
                styleObj={{
                  cmpTag: "contributor",
                  cmpStyles: ["container"],
                }}
                cmpFontSize={14}
                memberObj={member}
              />
            ))}
          </>
        </SubContainer>

        <TitleContainer
          cmpID="footer"
          styleObj={{
            cmpTag: "footer",
            cmpStyles: ["title-bar"],
          }}
          rootElementAlt={"h2"}
          context="by our LeadCMS-Devs"
        >
          Made with <Heart className="h-5 w-5 text-red-500" />
        </TitleContainer>
      </MainContainer>
    </ModuleWrapper>
  );
};
