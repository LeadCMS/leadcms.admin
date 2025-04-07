import { DtoSchema, DtoSchemaSource } from "@components/generic-components/common";

const convertSchemaToDtoSchema = (
  schema: DtoSchemaSource,
  allSchemas: { [x: string]: DtoSchemaSource },
): DtoSchema => {
  const dtoSchema: DtoSchema = {
    type: schema.type,
    enum: schema.enum,
    properties: {},
  };
  if (schema.required && schema.required.length) {
    dtoSchema.required = schema.required;
  }
  if (schema.properties && dtoSchema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      const refName = (value.$ref && value.$ref.replace("#/components/schemas/", "")) || undefined;
      const refSchema = (refName && allSchemas[refName]) || undefined;
      if (refSchema && refSchema !== schema) {
        const refDtoSchema = convertSchemaToDtoSchema(refSchema, allSchemas);
        if (refDtoSchema.type === "string") {
          dtoSchema.properties[key] = {
            hide: false,
            type: "string",
            enum: refDtoSchema.enum,
            title: value.title,
          };
        }
      } else {
        dtoSchema.properties[key] = {
          type: value.type || "unknown",
          hide: false,
        };

        if (value.format) {
          dtoSchema.properties[key].format = value.format;
        }

        if (value.nullable) {
          dtoSchema.properties[key].nullable = value.nullable;
        }

        if (value.title) {
          dtoSchema.properties[key].title = value.title;
        }

        if (value.description) {
          dtoSchema.properties[key].description = value.description;
        }

        if (value.pattern) {
          dtoSchema.properties[key].pattern = value.pattern;
        }

        if (value.minLength) {
          dtoSchema.properties[key].minLength = value.minLength;
        }

        if (value.maxLength) {
          dtoSchema.properties[key].maxLength = value.maxLength;
        }

        if (value.example) {
          dtoSchema.properties[key].example = value.example;
        }

        if (value["x-hide"]) {
          dtoSchema.properties[key].hide = true;
        }
      }
    }
  }
  return dtoSchema;
};

export const getSchemaDto = (
  name: string,
  allSchemas: { [x: string]: DtoSchemaSource },
): DtoSchema => {
  if (name in allSchemas) {
    const schema = allSchemas[name];
    return convertSchemaToDtoSchema(schema, allSchemas);
  }
  throw `${name} schema not found.`;
};
