import { MENU_CONFIG } from "./menu-config";
import { fetchSwaggerEntities } from "./swagger-entities";

export async function buildMenuItems(swaggerUrl: string, selectedModule: string) {
  const entities = await fetchSwaggerEntities(swaggerUrl);
  return MENU_CONFIG.map((section) => {
    const filteredItems = section.items.filter((item) => {
      if (item.entity === null) return true;
      return entities.has(item.entity.toLowerCase());
    }).map((item) => ({
      ...item,
      onClick: () => (window.location.href = item.route),
      isSelected: selectedModule === item.id
    }));
    if (filteredItems.length === 0) return null;
    return { header: section.header, items: filteredItems };
  }).filter(Boolean);
}
