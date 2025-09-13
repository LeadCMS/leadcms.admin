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
}: LocalContainerProps & {
  gridObj: any;
}) => {
  const cmpStyles = SetComponentStyles({ styleObj });

  return (
    <div {...(cmpID && { id: cmpID })} {...(cmpStyles && { className: cmpStyles })}>
      <Root defaultValue="status" className="tab-grid">
        <List className="tab-controller">
          {Object.keys(gridObj).map((tab, tabKey) => (
            <Trigger key={tabKey} value={tab}>
              {gridObj[tab]["identifier"]}
            </Trigger>
          ))}
        </List>

        <Content value="status" className="tab-content status-tab-expand">
          <>
            <h2 className="title">{gridObj.status.type}</h2>
            <ProgressBar
              rate={gridObj.status.healthProgress}
              color="#4CAF50"
              label="Overall Health"
              value={true}
              negation={true}
              negColor="#283329"
            />
            <div className="info">
              {gridObj.status.services.map((service: any) => {
                const Icon = iconMap[service.icon as keyof typeof iconMap];

                return (
                  <div key={service.name} className={`service ${service.bgColor}`}>
                    {Icon && <Icon className={`${service.statusColor} h-6 w-6`} />}
                    <div>
                      <p className="service_name">{service.name}</p>
                      <p className="service_info">{service.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        </Content>

        <Content value="database" className="tab-content database-tab-expand">
          <h2 className="title">Database Info</h2>
          <ul className="list">
            {Object.entries(gridObj.database).map(([infoKey, value]) => (
              <li key={infoKey}>
                <strong>{infoKey}:</strong> {String(value)}
              </li>
            ))}
          </ul>
        </Content>

        <Content value="deployement" className="tab-content deployement-tab-expand">
          <h2 className="title">Deployment Info</h2>
          <ul className="list">
            {Object.entries(gridObj.deployement).map(([infoKey, value]) => {
              if (infoKey === "dockerHelp") return null;
              if (infoKey === "showDockerHelp") return null;
              return (
                <li key={infoKey}>
                  <strong>{infoKey}:</strong> {String(value)}
                </li>
              );
            })}
          </ul>

          {gridObj.deployement.showDockerHelp && (
            <div className="sub-tab-content">
              <p className="sub-title">{gridObj.deployement.dockerHelp.helpText}</p>
              <TerminalContainer
                styleObj={{
                  cmpTag: "terminal",
                  cmpStyles: ["container"],
                }}
                cliObj={{
                  cmd: gridObj.deployement.dockerHelp.commands,
                }}
              />
            </div>
          )}
        </Content>
      </Root>
    </div>
  );
};
