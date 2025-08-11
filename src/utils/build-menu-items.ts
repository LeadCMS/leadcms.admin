import { MENU_CONFIG } from "./menu-config";
import { getDashboardAvailability } from "@features/dashboard/availability";

export function buildMenuItems(availableEntities: string[] | undefined, selectedModule: string) {
  const entitySet = new Set((availableEntities || []).map((e) => e.toLowerCase()));
  const dash = getDashboardAvailability(availableEntities);
  return MENU_CONFIG.map((section) => {
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
}
