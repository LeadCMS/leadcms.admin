import { ModuleWrapper } from "@components/module-wrapper";
import { useRequestContext } from "@providers/request-provider";
import { Alert, Badge } from "@mui/material";
import { useEffect, useState } from "react";
import { Download, Heart, Coffee, Laptop, Github } from "lucide-react";
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
  TechStack,
  Storage,
  ExternalResources,
  CLI,
  Contributors,
  SystemStatus,
} from "./siteConfigInfo";

export const AboutModule = () => {
  const [cardOrder, setCardOrder] = useState(Object.keys(TechStack));
  const [systemInfoCards, setSystemInfoCards] = useState(Object.entries(TechStack));
  const selfHostedBadge = LeadCMSbadges.find((mt) => mt.label === "Self-Hosted") || null;
  const showUpdateIndicator = Storage.server.deployment === "On-Premises" && selfHostedBadge;

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => window.setTimeout(() => resolve(), ms));

  const resetPyramidCards = async (hoveredEl: HTMLElement) => {
    const techKeys = Object.keys(TechStack);
    const hoveredKey = hoveredEl.classList[1].split("-")[1];
    const hoveredIdx = techKeys.indexOf(hoveredKey);

    let newOrder: string[];

    if (hoveredIdx === 0) {
      newOrder = [techKeys[1], techKeys[0], techKeys[2]];
    } else if (hoveredIdx === 1) {
      newOrder = [techKeys[0], techKeys[1], techKeys[2]];
    } else {
      newOrder = [techKeys[1], techKeys[2], techKeys[0]];
    }

    if (JSON.stringify(cardOrder) != JSON.stringify(newOrder)) {
      await sleep(1500);

      setCardOrder(newOrder);

      const refinedCards: [string, typeof TechStack.site][] = newOrder.map((key) => {
        const found = systemInfoCards.find(([k]) => k === key);
        const data = found?.[1] ?? TechStack[key as keyof typeof TechStack];

        return [key, data];
      });

      setSystemInfoCards(refinedCards);

      await sleep(3000);
    }
  };

  return (
    <ModuleWrapper breadcrumbs={[]} currentBreadcrumb={"About"}>
      <MainContainer
        cmpID="about_section"
        styleObj={{
          cmpTag: "container",
          cmpStyles: ["main-container", "about-section-container"],
        }}
        cmpFontSize={18}
      >
        <SubContainer
          cmpID="banner_area"
          styleObj={{
            cmpTag: "container",
            cmpStyles: [
              "sub-container",
              "banner-container",
              showUpdateIndicator ? "" : "no-update-indicator",
            ],
          }}
          cmpFontSize={16}
        >
          <TileContainer
            styleObj={{
              cmpTag: "container",
              cmpStyles: ["logo-container"],
            }}
            cmpFontSize={16}
          >
            <img src="/images/logo.png" alt="LeadCMS.ai Logo" className="brand-logo" />
            <p className="brand-name">LeadCMS.ai</p>
            <p className="brand-moto">The Open-Source Sales Automation & CMS for SaaS</p>
          </TileContainer>
          <TileContainer
            styleObj={{
              cmpTag: "container",
              cmpStyles: ["badge-container"],
            }}
            cmpFontSize={10}
          >
            {LeadCMSbadges.filter((mt) => mt.label !== "Self-Hosted").map((mt, _key) => (
              <Badge
                // variant={mt.variant}
                key={`0${_key}`}
                className={`badge ${mt.attr}`}
              >
                {mt.label}
              </Badge>
            ))}
          </TileContainer>
        </SubContainer>

        {showUpdateIndicator && (
          <SubContainer
            cmpID="update_indicator"
            styleObj={{
              cmpTag: "container",
              cmpStyles: ["sub-container", "alert-container"],
            }}
            cmpFontSize={16}
          >
            <Alert className="alert-panel normal">
              <h5 className="alert-title">
                <>
                  <Download />
                  &nbsp;
                </>
                <span>
                  New version available:
                  {
                    TechStack.site.segment_i.tags.find((tag) => tag.label === "latest-version")
                      ?.value
                  }
                </span>
              </h5>
              <p className="alert-context">
                Update your on-premises deployment using Docker Compose:
              </p>
              <TerminalContainer
                styleObj={{
                  cmpTag: "container",
                  cmpStyles: ["terminal-container"],
                }}
                cliObj={CLI}
              />
            </Alert>
          </SubContainer>
        )}

        <SubContainer
          styleObj={{
            cmpTag: "container",
            cmpStyles: [
              "sub-container",
              "system-details-container",
              showUpdateIndicator ? "" : "no-update-indicator",
            ],
          }}
        >
          <>
            {systemInfoCards.map(([segmentKey, segment]) => (
              <CardContainer
                key={segmentKey}
                styleObj={{
                  cmpTag: `card card-${segmentKey}`,
                  cmpStyles: ["system-details-card"],
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
            cmpTag: "tabular-segment",
            cmpStyles: ["product-stack-segment"],
          }}
          gridObj={SystemStatus}
          tableName={"Product-Stack"}
        />

        <TitleContainer
          styleObj={{
            cmpTag: "title-bar",
            cmpStyles: ["resources-title-bar"],
          }}
          rootElementAlt={"h2"}
          context="Resources"
          expanders={true}
          divisable={true}
        />

        <SubContainer
          cmpID="resources"
          styleObj={{
            cmpTag: "container",
            cmpStyles: ["sub-container", "resources-container"],
          }}
          cmpFontSize={16}
        >
          <>
            {ExternalResources.map((link, linkKey) => (
              <TileContainer
                key={linkKey}
                styleObj={{
                  cmpTag: "container",
                  cmpStyles: ["tile-container", "resource-container"],
                }}
                cmpFontSize={16}
              >
                <a
                  href={link.url}
                  target="_blank"
                  className="resource-link"
                  rel="noopener noreferrer"
                >
                  <span className="icon">{link.icon}</span>
                  <h4 className="domain">{link.name}</h4>
                </a>
              </TileContainer>
            ))}
          </>
        </SubContainer>

        <TitleContainer
          styleObj={{
            cmpTag: "title-bar",
            cmpStyles: ["contributors-title-bar"],
          }}
          rootElementAlt={"h2"}
          context="Development Team"
          expanders={true}
          divisable={true}
        />

        <SubContainer
          styleObj={{
            cmpTag: "container",
            cmpStyles: ["sub-container", "contributors-container"],
          }}
        >
          <>
            {Contributors.map((member, memberKey) => (
              <UserContainer
                key={memberKey}
                styleObj={{
                  cmpTag: "user-card",
                  cmpStyles: ["contributor-user-card"],
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
            cmpTag: "title-bar",
            cmpStyles: ["footer-title-bar"],
          }}
          rootElementAlt={"p"}
          context=""
        >
          <div className="footer-panel">
            <p className="from">
              Made with <Heart /> by our LeadCMS-Devs <Laptop />
            </p>
            <div className="sub-actions">
              <button className="sub-act-btn support">
                <Coffee />
                &nbsp;Support the Project
              </button>
              <button className="sub-act-btn review">
                <Github />
                &nbsp;Star us on GitHub
              </button>
            </div>
          </div>
        </TitleContainer>
      </MainContainer>
    </ModuleWrapper>
  );
};
