import { useState } from "react";
import { LocalContainerProps } from "types";
import { SetComponentStyles } from "@utils/general-helper";
import { Root, List, Trigger, Content } from "@radix-ui/react-tabs";
import { FaServer, FaDatabase, FaGlobe, FaClock } from "react-icons/fa";
import { TerminalContainer } from "@components/container";
import { ProgressBar } from "@components/progress-bar";

export { TabularGridContainer } from "./index.styled";

const iconMap = {
  Server: FaServer,
  Database: FaDatabase,
  Globe: FaGlobe,
  Clock: FaClock,
};

export const TabularGrid = ({
  cmpID,
  styleObj,
  gridObj,
  className,
  tableName,
}: LocalContainerProps & {
  gridObj: any;
  tableName?: string;
}) => {
  const cmpStyles = SetComponentStyles({ className, styleObj });
  const [activeTab, setActiveTab] = useState({
    idx: 0,
    label: Object.keys(gridObj)[0],
  });

  const getTableTabClassList = ({ keyIdx, tabLabel }: { keyIdx: number; tabLabel: string }) => {
    return [
      keyIdx == Object.keys(gridObj).length - 1 ? "last" : "",
      keyIdx != Object.keys(gridObj).length - 1 &&
      keyIdx != activeTab.idx &&
      keyIdx == activeTab.idx - 1
        ? "pre-neighbour"
        : "",
      tabLabel == activeTab.label ? "active" : "",
      keyIdx != 0 && keyIdx != activeTab.idx && keyIdx == activeTab.idx + 1
        ? "post-neighbour psd-after-effects"
        : "",
    ].join(" ");
  };

  const handleTriggerHoverIn = (hoveredEl: HTMLElement) => {
    const triggers = document.querySelectorAll(".controller-btn-tab");

    triggers.forEach((el) => {
      if (
        el !== hoveredEl &&
        !hoveredEl.classList.contains("active") &&
        Array.from(hoveredEl.classList).some((cls) =>
          ["pre-neighbour", "post-neighbour"].includes(cls)
        )
      ) {
        triggers.forEach((elAlt) => {
          const classes = elAlt.className
            .split(" ")
            .map((clsAlt) => (clsAlt === "psd-after-effects" ? "psd-after" : clsAlt));

          elAlt.className = classes.join(" ");
        });
      }
    });
  };

  const handleTriggerHoverOut = () => {
    const triggers = document.querySelectorAll(".controller-btn-tab");

    triggers.forEach((el) => {
      const classes = el.className
        .split(" ")
        .map((cls) => (cls === "psd-after" ? "psd-after-effects" : cls));

      el.className = classes.join(" ");
    });
  };

  return (
    <div {...(cmpID && { id: cmpID })} {...(cmpStyles && { className: cmpStyles })}>
      <Root
        defaultValue={activeTab.label}
        onValueChange={(e) =>
          setActiveTab({
            idx: Object.keys(gridObj).indexOf(e),
            label: e,
          })
        }
        className={`tab-grid${tableName ? "" : " no-table-name"}`}
      >
        {tableName && <h2 className="table-name">{tableName}</h2>}
        <List className="tab-controller">
          <div className="tab-controller-btns">
            {Object.keys(gridObj).map((tabValue, tabKey) => (
              <Trigger
                key={tabKey}
                value={tabValue}
                className={`tab controller-btn-tab ${getTableTabClassList({
                  keyIdx: tabKey,
                  tabLabel: tabValue,
                })}`}
                onMouseEnter={(e) => handleTriggerHoverIn(e.currentTarget)}
                onMouseLeave={handleTriggerHoverOut}
              >
                <>{gridObj[tabValue]["identifier"]}</>
              </Trigger>
            ))}
          </div>
        </List>

        {activeTab.label === "status" && (
          <Content value="status" className="tab-content status-tab-expand">
            <>
              {/* <h2 className="tab-title">{gridObj.status.type}</h2> */}
              <ProgressBar
                rate={gridObj.status.healthProgress}
                label="Overall Health"
                value={true}
                negation={true}
              />
              <div className="detail-container">
                {gridObj.status.services.map((service: any) => {
                  const Icon = iconMap[service.icon as keyof typeof iconMap];

                  return (
                    <div key={service.name} className={`service ${service.bgColor}`}>
                      {Icon && <Icon className={`${service.statusColor}`} />}
                      <div className="details">
                        <p className="name">{service.name}</p>
                        <p className="descrp">{service.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          </Content>
        )}

        {activeTab.label === "database" && (
          <Content value="database" className="tab-content database-tab-expand">
            {/* <h2 className="tab-title">{gridObj.status.type}</h2> */}
            <div className="list">
              {Object.entries(gridObj.database).map(([infoKey, value]) => (
                <p key={infoKey} className={"database-meta-info"}>
                  <span>{infoKey}</span>
                  <strong>{String(value)}</strong>
                </p>
              ))}
            </div>
          </Content>
        )}

        {activeTab.label === "deployement" && (
          <Content value="deployement" className="tab-content deployement-tab-expand">
            {/* <h2 className="tab-title">{gridObj.status.type}</h2> */}
            <ul className="list">
              {Object.entries(gridObj.deployement).map(([infoKey, value]) => {
                if (infoKey === "dockerHelp") return null;
                if (infoKey === "showDockerHelp") return null;
                return (
                  <p key={infoKey} className={"database-meta-info"}>
                    <span>{infoKey}</span>
                    <strong>{String(value)}</strong>
                  </p>
                );
              })}
            </ul>

            {gridObj.deployement.showDockerHelp && (
              <div className="sub-tab-content development-terminal-container">
                <p className="sub-title">{gridObj.deployement.dockerHelp.helpText}</p>
                <TerminalContainer
                  styleObj={{
                    cmpTag: "container",
                    cmpStyles: ["terminal-container", "development-terminal"],
                  }}
                  cliObj={{
                    cmd: gridObj.deployement.dockerHelp.commands,
                  }}
                />
              </div>
            )}
          </Content>
        )}
      </Root>
    </div>
  );
};
