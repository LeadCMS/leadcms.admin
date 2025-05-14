type FilterParams = {
  [key: string]: number | string | boolean;
};

export const getBasicFilterQuery = (
  filterLimit: number,
  sortColumn: string,
  sortOrder: string,
  skipLimit: number
) => {
  const basicFilters: FilterParams = {
    "filter[limit]": filterLimit,
    "filter[order]": `${sortColumn} ${sortOrder}`,
    "filter[skip]": skipLimit,
  };

  const basicFilterQuery = Object.keys(basicFilters)
    .filter((key) => `${basicFilters[key].toString().trim()}` != "")
    .map((key) => `${key}=${basicFilters[key]}`)
    .join("&");

  return basicFilterQuery;
};

export const getBasicExportFilterQuery = (sortColumn: string, sortOrder: string) => {
  return `filter[order]=${sortColumn} ${sortOrder}`;
};

export const defaultFilterLimit = 10;

export const totalCountHeaderName = "x-total-count";

export const getWhereFilterQuery = (
  whereField: string,
  whereFieldValue: string,
  operatorValue: string
) => {
  if (!whereField) return "";
  if (operatorValue === "isAnyOf" && (!whereFieldValue || whereFieldValue.length === 0)) return "";
  if (operatorValue === "isEmpty" || operatorValue === "isNotEmpty" || whereFieldValue) {
    return generateFilterQuery(whereField, operatorValue, whereFieldValue);
  }
  return "";
};

const isValidYYYYMMDD = (dateStr: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const generateFilterQuery = (
  whereField: string,
  operatorValue: string,
  whereFieldValue: string
) => {
  const whereObj = getWhereOperatorAndValue(operatorValue, whereFieldValue);
  if (typeof whereFieldValue !== "string" || !isValidYYYYMMDD(whereFieldValue)) {
    return `&filter[where][${whereField}][${whereObj.operator}]=${whereObj.value}`;
  }

  const beginDate = new Date(whereFieldValue);
  const endDate = new Date(beginDate);
  endDate.setDate(beginDate.getDate() + 1);
  const beginDateString = beginDate.toISOString();
  const endDateString = endDate.toISOString();

  switch (whereObj.operator) {
    case "eq":
      return `&filter[where][${whereField}][gte]=${beginDateString}
    &filter[where][${whereField}][lt]=${endDateString}`;
    case "neq":
      return `&filter[where][or][${whereField}][lt]=${beginDateString}
    &filter[where][or][${whereField}][gt]=${endDateString}`;
    case "gt":
      return `&filter[where][${whereField}][gt]=${endDateString}`;
    case "gte":
      return `&filter[where][${whereField}][gte]=${beginDateString}`;
    case "lt":
      return `&filter[where][${whereField}][lt]=${beginDateString}`;
    case "lte":
      return `&filter[where][${whereField}][lte]=${endDateString}`;
    default:
      return `&filter[where][${whereField}][${whereObj.operator}]=`;
  }
};

const getWhereOperatorAndValue = (
  operatorValue: string,
  whereFieldValue: any
): { operator: string; value: string } => {
  switch (operatorValue) {
    case "equals":
    case "is":
    case "=":
      return { operator: "eq", value: whereFieldValue };
    case "contains":
      return { operator: "contains", value: `*${whereFieldValue}*` };
    case "startsWith":
      return { operator: "contains", value: `${whereFieldValue}*` };
    case "endsWith":
      return { operator: "contains", value: `*${whereFieldValue}` };
    case "isEmpty":
      return { operator: "eq", value: "" };
    case "isNotEmpty":
      return { operator: "neq", value: "" };
    case "isAnyOf":
      return { operator: "eq", value: `${whereFieldValue.join("|")}` };
    case "not":
    case "!=":
      return { operator: "neq", value: whereFieldValue };
    case "after":
    case ">":
      return { operator: "gt", value: whereFieldValue };
    case "onOrAfter":
    case ">=":
      return { operator: "gte", value: whereFieldValue };
    case "before":
    case "<":
      return { operator: "lt", value: whereFieldValue };
    case "onOrBefore":
    case "<=":
      return { operator: "lte", value: whereFieldValue };
    default:
      return { operator: "eq", value: whereFieldValue };
  }
};
