// Utility to fetch and parse swagger.json and determine available entities
export async function fetchSwaggerEntities(swaggerUrl: string): Promise<Set<string>> {
  try {
    const response = await fetch(swaggerUrl);
    if (!response.ok) throw new Error("Failed to fetch swagger.json");
    const swagger = await response.json();
    // Collect all entity names from schemas and tags
    const schemas = swagger.components?.schemas ? Object.keys(swagger.components.schemas) : [];
    const tags = swagger.tags ? swagger.tags.map((t: any) => t.name) : [];
    // You may want to normalize names (e.g. lower case)
    return new Set([...schemas, ...tags].map((s) => s.toLowerCase()));
  } catch (e) {
    // On error, return empty set (show only About and Dashboard)
    return new Set();
  }
}
