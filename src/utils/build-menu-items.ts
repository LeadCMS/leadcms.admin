import { MENU_CONFIG } from "./menu-config";
import { getDashboardAvailability } from "@features/dashboard/availability";
import { getSectionIcon, getSectionIconKey } from "@components/icon-map";
import { SidebarMenuSection } from "@components/app-layout";
import React from "react";
import { DynamicModuleDto } from "@lib/network/swagger-client";

export function buildMenuItems(
  availableEntities: string[] | undefined,
  selectedModule: string,
  dynamicModules?: DynamicModuleDto[]
) {
  const entitySet = new Set((availableEntities || []).map((e) => e.toLowerCase()));
  const dash = getDashboardAvailability(availableEntities);
  const menuSections = MENU_CONFIG.map((section) => {
    const filteredItems = section.items
      .filter((item) => {
        // For dashboard, also ensure there's at least one tile to show.
        if (item.id === "dashboard") return dash.hasAny;
        if (!item.entity) return true;
        return entitySet.has(item.entity.toLowerCase());
      })
      .map((item) => ({
        ...item,
        onClick: (navigate: (to: string) => void) => navigate(item.route),
        isSelected: selectedModule === item.id,
      }));
    if (filteredItems.length === 0) return null;
    return { header: section.header, items: filteredItems };
  }).filter(Boolean);

  let dynamicSection;
  if (dynamicModules && dynamicModules.length > 0) {
    dynamicSection = buildDynamicMenuSection(
      availableEntities ?? [],
      dynamicModules,
      selectedModule
    );
  }

  if (!dynamicSection) return menuSections;
  const dynamicSectionWithJsxIcons: SidebarMenuSection = {
    ...dynamicSection,
    items: dynamicSection.items.map((item) => ({
      ...item,
      icon:
        typeof item.icon === "string"
          ? React.createElement(getSectionIcon(item.icon), { size: 20 })
          : item.icon,
    })),
  };

  const mainIndex = menuSections.findIndex((section) => section!.header === "MAIN");
  if (mainIndex !== -1) {
    return [
      ...menuSections.slice(0, mainIndex + 1),
      dynamicSectionWithJsxIcons,
      ...menuSections.slice(mainIndex + 1),
    ];
  } else {
    return [dynamicSectionWithJsxIcons, ...menuSections];
  }
}

export function buildDynamicMenuSection(
  entities: string[] | undefined,
  modules: DynamicModuleDto[],
  selectedModule: string
): SidebarMenuSection | null {
  if (!entities || !modules) {
    return null;
  }
  const entitySet = new Set(entities.map((e) => e.toLowerCase()));
  const matchedModules = modules.filter(
    (mod) => mod.moduleName && entitySet.has(mod.moduleName.toLowerCase())
  );
  if (matchedModules.length === 0) return null;

  return {
    header: "DYNAMIC",
    items: matchedModules.map((mod) => ({
      id: mod.moduleName!,
      label: mod.moduleName!,
      icon: getSectionIconKey(mod.moduleName!),
      entity: mod.moduleName!,
      route: `/modules/${mod.modulePath || mod.moduleName}`,
      onClick: (navigate: (to: string) => void) =>
        navigate(`/modules/${mod.modulePath || mod.moduleName}`),
      isSelected: selectedModule === (mod.modulePath || mod.moduleName),
    })),
  };
}
