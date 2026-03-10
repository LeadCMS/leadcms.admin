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
  const noValueOperators = ["isEmpty", "isNotEmpty", "IsEmpty", "IsNotEmpty", "IsTrue", "IsFalse"];
  if (!whereField) return "";
  if (operatorValue === "isAnyOf" && (!whereFieldValue || whereFieldValue.length === 0)) return "";
  if (noValueOperators.includes(operatorValue) || whereFieldValue) {
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
    case "Equals":
      return { operator: "eq", value: whereFieldValue };
    case "contains":
    case "Contains":
      return { operator: "contains", value: `*${whereFieldValue}*` };
    case "NotContains":
      return { operator: "ncontains", value: `*${whereFieldValue}*` };
    case "startsWith":
    case "StartsWith":
      return { operator: "contains", value: `${whereFieldValue}*` };
    case "endsWith":
    case "EndsWith":
      return { operator: "contains", value: `*${whereFieldValue}` };
    case "isEmpty":
    case "IsEmpty":
      return { operator: "eq", value: "" };
    case "isNotEmpty":
    case "IsNotEmpty":
      return { operator: "neq", value: "" };
    case "isAnyOf":
    case "In":
      return { operator: "eq", value: `${whereFieldValue.join("|")}` };
    case "not":
    case "!=":
    case "NotEquals":
    case "NotIn":
      return { operator: "neq", value: whereFieldValue };
    case "after":
    case ">":
    case "GreaterThan":
      return { operator: "gt", value: whereFieldValue };
    case "onOrAfter":
    case ">=":
    case "GreaterThanOrEqual":
      return { operator: "gte", value: whereFieldValue };
    case "before":
    case "<":
    case "LessThan":
      return { operator: "lt", value: whereFieldValue };
    case "onOrBefore":
    case "<=":
    case "LessThanOrEqual":
      return { operator: "lte", value: whereFieldValue };
    case "IsTrue":
      return { operator: "eq", value: "true" };
    case "IsFalse":
      return { operator: "eq", value: "false" };
    default:
      return { operator: "eq", value: whereFieldValue };
  }
};
