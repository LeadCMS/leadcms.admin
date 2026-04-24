
interface Validation {
  rule: string;
  errorMessage: string;
  level: string;
}

const alternativeMatches: Record<string, string[]> = {
  firstName: ["first name", "first"],
  lastName: ["last name", "last"],
  email: ["email address"],
  companyName: ["Office", "Work"],
  address1: ["address 1"],
  address2: ["address 2"],
  zip: ["zip code"],
  createdByIp: ["ip address", "ip", "ipaddress", "IP Address", "IP"],
  phone: ["Telephone no", "Telephone number", "Phone number"],
  website: ["website address"],
  country: ["country name"],
  timezone: ["time zone", "TimezoneOffset"],
  language: ["lang", "language name", "language code"],
  createdAt: ["created at", "created date", "Date", "Created Time", "Created"],
  updatedAt: ["updated at", "updated date", "Updated Time", "Updated"],
};

const getAlternatives = (key: string, title: string) => {
  const alternatives = alternativeMatches[key] ? alternativeMatches[key].slice() : [];

  alternatives.push(key);
  if (title) {
    alternatives.push(title);
  }

  return alternatives;
};

const buildValidations = (key: string, property: any) => {
  const validations: Validation[] = [];
  const required = property.nullable === true ? false : true;
  const isUnique = property["x-unique"];

  if (required) {
    validations.push({
      rule: "required",
      errorMessage: `${property.title ?? key} is required`,
      level: "error",
    });
  }

  if (isUnique) {
    validations.push({
      rule: "unique",
      errorMessage: `${property.title ?? key} must contain unique values`,
      level: "error",
    });
  }

  return validations;
};

const typeMapping: Record<string, string> = {
  string: "input",
  integer: "input",
  boolean: "checkbox",
  enum: "select",
  array: "input",
};

export const getImportFields = (importModel: any) => {
  const importContactFields = Object.keys(importModel)
    .map((key) => {
      const property = importModel[key];

      if (!property.type) {
        return; // skip the field if property.type is undefined
      }

      const importType = typeMapping[property.type] ? typeMapping[property.type] : "input";
      let example = property.example ? property.example : "string";

      if (example instanceof Array || example instanceof Object) {
        example = JSON.stringify(example);
      }

      const alternatives = getAlternatives(key, property.title);
      const title = property.title ? property.title : key;
      const validations = buildValidations(key, property);

      return {
        key,
        label: title,
        alternateMatches: alternatives,
        fieldType: {
          type: importType,
        },
        example: example,
        validations: validations,
      };
    })
    .filter(Boolean);

  return importContactFields;
};
