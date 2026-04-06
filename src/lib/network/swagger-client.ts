/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AccountCreateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * State
   * @example "string"
   */
  state?: string | null;
  /**
   * Continent Code
   * @example "ZZ"
   */
  continentCode?: "ZZ" | "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA" | null;
  /**
   * Country Code
   * @example "ZZ"
   */
  countryCode?:
    | "ZZ"
    | "AF"
    | "AL"
    | "AQ"
    | "DZ"
    | "AS"
    | "AD"
    | "AO"
    | "AG"
    | "AZ"
    | "AR"
    | "AU"
    | "AT"
    | "BS"
    | "BH"
    | "BD"
    | "AM"
    | "BB"
    | "BE"
    | "BM"
    | "BT"
    | "BO"
    | "BA"
    | "BW"
    | "BV"
    | "BR"
    | "BZ"
    | "IO"
    | "SB"
    | "VG"
    | "BN"
    | "BG"
    | "MM"
    | "BI"
    | "BY"
    | "KH"
    | "CM"
    | "CA"
    | "CV"
    | "KY"
    | "CF"
    | "LK"
    | "TD"
    | "CL"
    | "CN"
    | "TW"
    | "CX"
    | "CC"
    | "CO"
    | "KM"
    | "YT"
    | "CG"
    | "CD"
    | "CK"
    | "CR"
    | "HR"
    | "CU"
    | "CY"
    | "CZ"
    | "BJ"
    | "DK"
    | "DM"
    | "DO"
    | "EC"
    | "SV"
    | "GQ"
    | "ET"
    | "ER"
    | "EE"
    | "FO"
    | "FK"
    | "GS"
    | "FJ"
    | "FI"
    | "AX"
    | "FR"
    | "GF"
    | "PF"
    | "TF"
    | "DJ"
    | "GA"
    | "GE"
    | "GM"
    | "PS"
    | "DE"
    | "GH"
    | "GI"
    | "KI"
    | "GR"
    | "GL"
    | "GD"
    | "GP"
    | "GU"
    | "GT"
    | "GN"
    | "GY"
    | "HT"
    | "HM"
    | "VA"
    | "HN"
    | "HK"
    | "HU"
    | "IS"
    | "IN"
    | "ID"
    | "IR"
    | "IQ"
    | "IE"
    | "IL"
    | "IT"
    | "CI"
    | "JM"
    | "JP"
    | "KZ"
    | "JO"
    | "KE"
    | "KP"
    | "KR"
    | "KW"
    | "KG"
    | "LA"
    | "LB"
    | "LS"
    | "LV"
    | "LR"
    | "LY"
    | "LI"
    | "LT"
    | "LU"
    | "MO"
    | "MG"
    | "MW"
    | "MY"
    | "MV"
    | "ML"
    | "MT"
    | "MQ"
    | "MR"
    | "MU"
    | "MX"
    | "MC"
    | "MN"
    | "MD"
    | "ME"
    | "MS"
    | "MA"
    | "MZ"
    | "OM"
    | "NA"
    | "NR"
    | "NP"
    | "NL"
    | "CW"
    | "AW"
    | "SX"
    | "BQ"
    | "NC"
    | "VU"
    | "NZ"
    | "NI"
    | "NE"
    | "NG"
    | "NU"
    | "NF"
    | "NO"
    | "MP"
    | "UM"
    | "FM"
    | "MH"
    | "PW"
    | "PK"
    | "PA"
    | "PG"
    | "PY"
    | "PE"
    | "PH"
    | "PN"
    | "PL"
    | "PT"
    | "GW"
    | "TL"
    | "PR"
    | "QA"
    | "RE"
    | "RO"
    | "RU"
    | "RW"
    | "BL"
    | "SH"
    | "KN"
    | "AI"
    | "LC"
    | "MF"
    | "PM"
    | "VC"
    | "SM"
    | "ST"
    | "SA"
    | "SN"
    | "RS"
    | "SC"
    | "SL"
    | "SG"
    | "SK"
    | "VN"
    | "SI"
    | "SO"
    | "ZA"
    | "ZW"
    | "ES"
    | "SS"
    | "SD"
    | "EH"
    | "SR"
    | "SJ"
    | "SZ"
    | "SE"
    | "CH"
    | "SY"
    | "TJ"
    | "TH"
    | "TG"
    | "TK"
    | "TO"
    | "TT"
    | "AE"
    | "TN"
    | "TR"
    | "TM"
    | "TC"
    | "TV"
    | "UG"
    | "UA"
    | "MK"
    | "EG"
    | "GB"
    | "GG"
    | "JE"
    | "IM"
    | "TZ"
    | "US"
    | "VI"
    | "BF"
    | "UY"
    | "UZ"
    | "VE"
    | "WF"
    | "WS"
    | "YE"
    | "ZM"
    | null;
  /**
   * City Name
   * @example "Colombo"
   */
  cityName?: string | null;
  /**
   * Site Url
   * @example "https://example.com"
   */
  siteUrl?: string | null;
  /**
   * Logo Url
   * @example "https://example.com/logo.png"
   */
  logoUrl?: string | null;
  /**
   * Address
   * @example "string"
   */
  address?: string | null;
  /**
   * Tin
   * @example "string"
   */
  tin?: string | null;
  /**
   * Employees Range
   * @example "50K-100K"
   */
  employeesRange?: string | null;
  /**
   * Revenue
   * @format double
   * @example 1
   */
  revenue?: number | null;
  /**
   * Profit
   * @format double
   * @example 1
   */
  profit?: number | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Social Media
   * @example {"key1":"value1","key2":"value2"}
   */
  socialMedia?: Record<string, string>;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Data
   * @example "string"
   */
  data?: string | null;
}

export interface AccountDetailsDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * State
   * @example "string"
   */
  state?: string | null;
  /**
   * Continent Code
   * @example "ZZ"
   */
  continentCode?: "ZZ" | "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA" | null;
  /**
   * Country Code
   * @example "ZZ"
   */
  countryCode?:
    | "ZZ"
    | "AF"
    | "AL"
    | "AQ"
    | "DZ"
    | "AS"
    | "AD"
    | "AO"
    | "AG"
    | "AZ"
    | "AR"
    | "AU"
    | "AT"
    | "BS"
    | "BH"
    | "BD"
    | "AM"
    | "BB"
    | "BE"
    | "BM"
    | "BT"
    | "BO"
    | "BA"
    | "BW"
    | "BV"
    | "BR"
    | "BZ"
    | "IO"
    | "SB"
    | "VG"
    | "BN"
    | "BG"
    | "MM"
    | "BI"
    | "BY"
    | "KH"
    | "CM"
    | "CA"
    | "CV"
    | "KY"
    | "CF"
    | "LK"
    | "TD"
    | "CL"
    | "CN"
    | "TW"
    | "CX"
    | "CC"
    | "CO"
    | "KM"
    | "YT"
    | "CG"
    | "CD"
    | "CK"
    | "CR"
    | "HR"
    | "CU"
    | "CY"
    | "CZ"
    | "BJ"
    | "DK"
    | "DM"
    | "DO"
    | "EC"
    | "SV"
    | "GQ"
    | "ET"
    | "ER"
    | "EE"
    | "FO"
    | "FK"
    | "GS"
    | "FJ"
    | "FI"
    | "AX"
    | "FR"
    | "GF"
    | "PF"
    | "TF"
    | "DJ"
    | "GA"
    | "GE"
    | "GM"
    | "PS"
    | "DE"
    | "GH"
    | "GI"
    | "KI"
    | "GR"
    | "GL"
    | "GD"
    | "GP"
    | "GU"
    | "GT"
    | "GN"
    | "GY"
    | "HT"
    | "HM"
    | "VA"
    | "HN"
    | "HK"
    | "HU"
    | "IS"
    | "IN"
    | "ID"
    | "IR"
    | "IQ"
    | "IE"
    | "IL"
    | "IT"
    | "CI"
    | "JM"
    | "JP"
    | "KZ"
    | "JO"
    | "KE"
    | "KP"
    | "KR"
    | "KW"
    | "KG"
    | "LA"
    | "LB"
    | "LS"
    | "LV"
    | "LR"
    | "LY"
    | "LI"
    | "LT"
    | "LU"
    | "MO"
    | "MG"
    | "MW"
    | "MY"
    | "MV"
    | "ML"
    | "MT"
    | "MQ"
    | "MR"
    | "MU"
    | "MX"
    | "MC"
    | "MN"
    | "MD"
    | "ME"
    | "MS"
    | "MA"
    | "MZ"
    | "OM"
    | "NA"
    | "NR"
    | "NP"
    | "NL"
    | "CW"
    | "AW"
    | "SX"
    | "BQ"
    | "NC"
    | "VU"
    | "NZ"
    | "NI"
    | "NE"
    | "NG"
    | "NU"
    | "NF"
    | "NO"
    | "MP"
    | "UM"
    | "FM"
    | "MH"
    | "PW"
    | "PK"
    | "PA"
    | "PG"
    | "PY"
    | "PE"
    | "PH"
    | "PN"
    | "PL"
    | "PT"
    | "GW"
    | "TL"
    | "PR"
    | "QA"
    | "RE"
    | "RO"
    | "RU"
    | "RW"
    | "BL"
    | "SH"
    | "KN"
    | "AI"
    | "LC"
    | "MF"
    | "PM"
    | "VC"
    | "SM"
    | "ST"
    | "SA"
    | "SN"
    | "RS"
    | "SC"
    | "SL"
    | "SG"
    | "SK"
    | "VN"
    | "SI"
    | "SO"
    | "ZA"
    | "ZW"
    | "ES"
    | "SS"
    | "SD"
    | "EH"
    | "SR"
    | "SJ"
    | "SZ"
    | "SE"
    | "CH"
    | "SY"
    | "TJ"
    | "TH"
    | "TG"
    | "TK"
    | "TO"
    | "TT"
    | "AE"
    | "TN"
    | "TR"
    | "TM"
    | "TC"
    | "TV"
    | "UG"
    | "UA"
    | "MK"
    | "EG"
    | "GB"
    | "GG"
    | "JE"
    | "IM"
    | "TZ"
    | "US"
    | "VI"
    | "BF"
    | "UY"
    | "UZ"
    | "VE"
    | "WF"
    | "WS"
    | "YE"
    | "ZM"
    | null;
  /**
   * City Name
   * @example "Colombo"
   */
  cityName?: string | null;
  /**
   * Site Url
   * @example "https://example.com"
   */
  siteUrl?: string | null;
  /**
   * Logo Url
   * @example "https://example.com/logo.png"
   */
  logoUrl?: string | null;
  /**
   * Address
   * @example "string"
   */
  address?: string | null;
  /**
   * Tin
   * @example "string"
   */
  tin?: string | null;
  /**
   * Employees Range
   * @example "50K-100K"
   */
  employeesRange?: string | null;
  /**
   * Revenue
   * @format double
   * @example 1
   */
  revenue?: number | null;
  /**
   * Profit
   * @format double
   * @example 1
   */
  profit?: number | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Social Media
   * @example {"key1":"value1","key2":"value2"}
   */
  socialMedia?: Record<string, string>;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Data
   * @example "string"
   */
  data?: string | null;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Contact Count
   * @format int32
   * @example 1
   */
  contactCount?: number;
  /**
   * Deals Count
   * @format int32
   * @example 1
   */
  dealsCount?: number;
  /**
   * Domains Count
   * @format int32
   * @example 1
   */
  domainsCount?: number;
  /**
   * Orders Count
   * @format int32
   * @example 1
   */
  ordersCount?: number;
  /**
   * Last Order Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  lastOrderDate?: string | null;
  /**
   * Total Revenue
   * @format double
   * @example 1
   */
  totalRevenue?: number;
  /** Contacts */
  contacts?: ContactDetailsDto[] | null;
  /** Domains */
  domains?: DomainDetailsDto[] | null;
}

export interface AccountDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: AccountDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, AccountDetailsDto>;
}

export interface AccountImportDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string | null;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Created By Ip
   * @example "string"
   */
  createdByIp?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Created By User Agent
   * @example "string"
   */
  createdByUserAgent?: string | null;
  /**
   * Updated By Ip
   * @example "string"
   */
  updatedByIp?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Updated By User Agent
   * @example "string"
   */
  updatedByUserAgent?: string | null;
  /**
   * Name
   * @example "string"
   */
  name?: string;
  /**
   * City Name
   * @example "string"
   */
  cityName?: string | null;
  /**
   * State Code
   * @example "string"
   */
  stateCode?: string | null;
  /**
   * Continent Code
   * @example "ZZ"
   */
  continentCode?: "ZZ" | "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA" | null;
  /**
   * Country Code
   * @example "ZZ"
   */
  countryCode?:
    | "ZZ"
    | "AF"
    | "AL"
    | "AQ"
    | "DZ"
    | "AS"
    | "AD"
    | "AO"
    | "AG"
    | "AZ"
    | "AR"
    | "AU"
    | "AT"
    | "BS"
    | "BH"
    | "BD"
    | "AM"
    | "BB"
    | "BE"
    | "BM"
    | "BT"
    | "BO"
    | "BA"
    | "BW"
    | "BV"
    | "BR"
    | "BZ"
    | "IO"
    | "SB"
    | "VG"
    | "BN"
    | "BG"
    | "MM"
    | "BI"
    | "BY"
    | "KH"
    | "CM"
    | "CA"
    | "CV"
    | "KY"
    | "CF"
    | "LK"
    | "TD"
    | "CL"
    | "CN"
    | "TW"
    | "CX"
    | "CC"
    | "CO"
    | "KM"
    | "YT"
    | "CG"
    | "CD"
    | "CK"
    | "CR"
    | "HR"
    | "CU"
    | "CY"
    | "CZ"
    | "BJ"
    | "DK"
    | "DM"
    | "DO"
    | "EC"
    | "SV"
    | "GQ"
    | "ET"
    | "ER"
    | "EE"
    | "FO"
    | "FK"
    | "GS"
    | "FJ"
    | "FI"
    | "AX"
    | "FR"
    | "GF"
    | "PF"
    | "TF"
    | "DJ"
    | "GA"
    | "GE"
    | "GM"
    | "PS"
    | "DE"
    | "GH"
    | "GI"
    | "KI"
    | "GR"
    | "GL"
    | "GD"
    | "GP"
    | "GU"
    | "GT"
    | "GN"
    | "GY"
    | "HT"
    | "HM"
    | "VA"
    | "HN"
    | "HK"
    | "HU"
    | "IS"
    | "IN"
    | "ID"
    | "IR"
    | "IQ"
    | "IE"
    | "IL"
    | "IT"
    | "CI"
    | "JM"
    | "JP"
    | "KZ"
    | "JO"
    | "KE"
    | "KP"
    | "KR"
    | "KW"
    | "KG"
    | "LA"
    | "LB"
    | "LS"
    | "LV"
    | "LR"
    | "LY"
    | "LI"
    | "LT"
    | "LU"
    | "MO"
    | "MG"
    | "MW"
    | "MY"
    | "MV"
    | "ML"
    | "MT"
    | "MQ"
    | "MR"
    | "MU"
    | "MX"
    | "MC"
    | "MN"
    | "MD"
    | "ME"
    | "MS"
    | "MA"
    | "MZ"
    | "OM"
    | "NA"
    | "NR"
    | "NP"
    | "NL"
    | "CW"
    | "AW"
    | "SX"
    | "BQ"
    | "NC"
    | "VU"
    | "NZ"
    | "NI"
    | "NE"
    | "NG"
    | "NU"
    | "NF"
    | "NO"
    | "MP"
    | "UM"
    | "FM"
    | "MH"
    | "PW"
    | "PK"
    | "PA"
    | "PG"
    | "PY"
    | "PE"
    | "PH"
    | "PN"
    | "PL"
    | "PT"
    | "GW"
    | "TL"
    | "PR"
    | "QA"
    | "RE"
    | "RO"
    | "RU"
    | "RW"
    | "BL"
    | "SH"
    | "KN"
    | "AI"
    | "LC"
    | "MF"
    | "PM"
    | "VC"
    | "SM"
    | "ST"
    | "SA"
    | "SN"
    | "RS"
    | "SC"
    | "SL"
    | "SG"
    | "SK"
    | "VN"
    | "SI"
    | "SO"
    | "ZA"
    | "ZW"
    | "ES"
    | "SS"
    | "SD"
    | "EH"
    | "SR"
    | "SJ"
    | "SZ"
    | "SE"
    | "CH"
    | "SY"
    | "TJ"
    | "TH"
    | "TG"
    | "TK"
    | "TO"
    | "TT"
    | "AE"
    | "TN"
    | "TR"
    | "TM"
    | "TC"
    | "TV"
    | "UG"
    | "UA"
    | "MK"
    | "EG"
    | "GB"
    | "GG"
    | "JE"
    | "IM"
    | "TZ"
    | "US"
    | "VI"
    | "BF"
    | "UY"
    | "UZ"
    | "VE"
    | "WF"
    | "WS"
    | "YE"
    | "ZM"
    | null;
  /**
   * Site Url
   * @example "string"
   */
  siteUrl?: string | null;
  /**
   * Logo Url
   * @example "string"
   */
  logoUrl?: string | null;
  /**
   * Address
   * @example "string"
   */
  address?: string | null;
  /**
   * Tin
   * @example "string"
   */
  tin?: string | null;
  /**
   * Employees Range
   * @example "string"
   */
  employeesRange?: string | null;
  /**
   * Revenue
   * @format double
   * @example 1
   */
  revenue?: number | null;
  /**
   * Profit
   * @format double
   * @example 1
   */
  profit?: number | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Social Media
   * @example {"key1":"value1","key2":"value2"}
   */
  socialMedia?: Record<string, string>;
  /**
   * Data
   * @example "string"
   */
  data?: string | null;
}

export interface AccountUpdateDto {
  /**
   * Name
   * @example "string"
   */
  name?: string | null;
  /**
   * Site Url
   * @example "string"
   */
  siteUrl?: string | null;
  /**
   * Logo Url
   * @example "string"
   */
  logoUrl?: string | null;
  /**
   * City Name
   * @example "string"
   */
  cityName?: string | null;
  /**
   * State Code
   * @example "string"
   */
  stateCode?: string | null;
  /**
   * Address
   * @example "string"
   */
  address?: string | null;
  /**
   * Tin
   * @example "string"
   */
  tin?: string | null;
  /**
   * Continent Code
   * @example "ZZ"
   */
  continentCode?: "ZZ" | "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA" | null;
  /**
   * Country Code
   * @example "ZZ"
   */
  countryCode?:
    | "ZZ"
    | "AF"
    | "AL"
    | "AQ"
    | "DZ"
    | "AS"
    | "AD"
    | "AO"
    | "AG"
    | "AZ"
    | "AR"
    | "AU"
    | "AT"
    | "BS"
    | "BH"
    | "BD"
    | "AM"
    | "BB"
    | "BE"
    | "BM"
    | "BT"
    | "BO"
    | "BA"
    | "BW"
    | "BV"
    | "BR"
    | "BZ"
    | "IO"
    | "SB"
    | "VG"
    | "BN"
    | "BG"
    | "MM"
    | "BI"
    | "BY"
    | "KH"
    | "CM"
    | "CA"
    | "CV"
    | "KY"
    | "CF"
    | "LK"
    | "TD"
    | "CL"
    | "CN"
    | "TW"
    | "CX"
    | "CC"
    | "CO"
    | "KM"
    | "YT"
    | "CG"
    | "CD"
    | "CK"
    | "CR"
    | "HR"
    | "CU"
    | "CY"
    | "CZ"
    | "BJ"
    | "DK"
    | "DM"
    | "DO"
    | "EC"
    | "SV"
    | "GQ"
    | "ET"
    | "ER"
    | "EE"
    | "FO"
    | "FK"
    | "GS"
    | "FJ"
    | "FI"
    | "AX"
    | "FR"
    | "GF"
    | "PF"
    | "TF"
    | "DJ"
    | "GA"
    | "GE"
    | "GM"
    | "PS"
    | "DE"
    | "GH"
    | "GI"
    | "KI"
    | "GR"
    | "GL"
    | "GD"
    | "GP"
    | "GU"
    | "GT"
    | "GN"
    | "GY"
    | "HT"
    | "HM"
    | "VA"
    | "HN"
    | "HK"
    | "HU"
    | "IS"
    | "IN"
    | "ID"
    | "IR"
    | "IQ"
    | "IE"
    | "IL"
    | "IT"
    | "CI"
    | "JM"
    | "JP"
    | "KZ"
    | "JO"
    | "KE"
    | "KP"
    | "KR"
    | "KW"
    | "KG"
    | "LA"
    | "LB"
    | "LS"
    | "LV"
    | "LR"
    | "LY"
    | "LI"
    | "LT"
    | "LU"
    | "MO"
    | "MG"
    | "MW"
    | "MY"
    | "MV"
    | "ML"
    | "MT"
    | "MQ"
    | "MR"
    | "MU"
    | "MX"
    | "MC"
    | "MN"
    | "MD"
    | "ME"
    | "MS"
    | "MA"
    | "MZ"
    | "OM"
    | "NA"
    | "NR"
    | "NP"
    | "NL"
    | "CW"
    | "AW"
    | "SX"
    | "BQ"
    | "NC"
    | "VU"
    | "NZ"
    | "NI"
    | "NE"
    | "NG"
    | "NU"
    | "NF"
    | "NO"
    | "MP"
    | "UM"
    | "FM"
    | "MH"
    | "PW"
    | "PK"
    | "PA"
    | "PG"
    | "PY"
    | "PE"
    | "PH"
    | "PN"
    | "PL"
    | "PT"
    | "GW"
    | "TL"
    | "PR"
    | "QA"
    | "RE"
    | "RO"
    | "RU"
    | "RW"
    | "BL"
    | "SH"
    | "KN"
    | "AI"
    | "LC"
    | "MF"
    | "PM"
    | "VC"
    | "SM"
    | "ST"
    | "SA"
    | "SN"
    | "RS"
    | "SC"
    | "SL"
    | "SG"
    | "SK"
    | "VN"
    | "SI"
    | "SO"
    | "ZA"
    | "ZW"
    | "ES"
    | "SS"
    | "SD"
    | "EH"
    | "SR"
    | "SJ"
    | "SZ"
    | "SE"
    | "CH"
    | "SY"
    | "TJ"
    | "TH"
    | "TG"
    | "TK"
    | "TO"
    | "TT"
    | "AE"
    | "TN"
    | "TR"
    | "TM"
    | "TC"
    | "TV"
    | "UG"
    | "UA"
    | "MK"
    | "EG"
    | "GB"
    | "GG"
    | "JE"
    | "IM"
    | "TZ"
    | "US"
    | "VI"
    | "BF"
    | "UY"
    | "UZ"
    | "VE"
    | "WF"
    | "WS"
    | "YE"
    | "ZM"
    | null;
  /**
   * Employees Range
   * @example "string"
   */
  employeesRange?: string | null;
  /**
   * Revenue
   * @format double
   * @example 1
   */
  revenue?: number | null;
  /**
   * Profit
   * @format double
   * @example 1
   */
  profit?: number | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Social Media
   * @example {"key1":"value1","key2":"value2"}
   */
  socialMedia?: Record<string, string>;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Data
   * @example "string"
   */
  data?: string | null;
}

export interface ActivityLogDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Source
   * @example "string"
   */
  source?: string;
  /**
   * Source Id
   * @format int32
   * @example 1
   */
  sourceId?: number;
  /**
   * Type
   * @example "string"
   */
  type?: string;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Ip
   * @example "string"
   */
  ip?: string | null;
  /**
   * Data
   * @example "string"
   */
  data?: string;
}

export interface AuthConfigDto {
  /** Methods */
  methods?: string[];
  msal?: MsalConfigDto;
}

export interface CampaignCreateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Email Template Id
   * @format int32
   * @example 1
   */
  emailTemplateId: number;
  /** Segment Ids */
  segmentIds: number[];
  /** Exclude Segment Ids */
  excludeSegmentIds?: number[] | null;
  /**
   * Scheduled At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  scheduledAt?: string | null;
  /**
   * Time Zone
   * @format int32
   * @example 1
   */
  timeZone?: number | null;
  /**
   * Use Contact Time Zone
   * @example true
   */
  useContactTimeZone?: boolean;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  utmParameters?: Utms;
}

export interface CampaignDetailsDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Email Template Id
   * @format int32
   * @example 1
   */
  emailTemplateId: number;
  /** Segment Ids */
  segmentIds: number[];
  /** Exclude Segment Ids */
  excludeSegmentIds?: number[] | null;
  /**
   * Scheduled At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  scheduledAt?: string | null;
  /**
   * Time Zone
   * @format int32
   * @example 1
   */
  timeZone?: number | null;
  /**
   * Use Contact Time Zone
   * @example true
   */
  useContactTimeZone?: boolean;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  utmParameters?: Utms;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Status
   * @example "Draft"
   */
  status?: "Draft" | "Scheduled" | "Sending" | "Sent" | "Cancelled" | "Paused";
  /**
   * Send Started At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  sendStartedAt?: string | null;
  /**
   * Send Completed At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  sendCompletedAt?: string | null;
  /**
   * Total Recipients
   * @format int32
   * @example 1
   */
  totalRecipients?: number;
  /**
   * Sent Count
   * @format int32
   * @example 1
   */
  sentCount?: number;
  /**
   * Failed Count
   * @format int32
   * @example 1
   */
  failedCount?: number;
  /**
   * Skipped Count
   * @format int32
   * @example 1
   */
  skippedCount?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  emailTemplate?: EmailTemplateDetailsDto;
}

export interface CampaignLaunchDto {
  /**
   * Send Now
   * @example true
   */
  sendNow?: boolean;
  /**
   * Scheduled At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  scheduledAt?: string | null;
  /**
   * Time Zone
   * @format int32
   * @example 1
   */
  timeZone?: number | null;
  /**
   * Use Contact Time Zone
   * @example true
   */
  useContactTimeZone?: boolean;
  /**
   * Allow Past Time Zones
   * @example true
   */
  allowPastTimeZones?: boolean;
}

export interface CampaignPreviewRequestDto {
  /**
   * Email Template Id
   * @format int32
   * @example 1
   */
  emailTemplateId: number;
  /** Segment Ids */
  segmentIds: number[];
  /** Exclude Segment Ids */
  excludeSegmentIds?: number[] | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Contact Type
   * @example "Full"
   */
  contactType?: "Full" | "Standard" | "Basic" | "Minimal" | null;
  /** Custom Template Parameters */
  customTemplateParameters?: Record<string, any>;
  utmParameters?: Utms;
}

export interface CampaignPreviewResultDto {
  /**
   * Total Audience Count
   * @format int32
   * @example 1
   */
  totalAudienceCount?: number;
  /**
   * Sendable Count
   * @format int32
   * @example 1
   */
  sendableCount?: number;
  /**
   * Unsubscribed Count
   * @format int32
   * @example 1
   */
  unsubscribedCount?: number;
  /**
   * Invalid Email Count
   * @format int32
   * @example 1
   */
  invalidEmailCount?: number;
  templatePreview?: EmailTemplatePreviewResultDto;
}

export interface CampaignRecipientDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Campaign Id
   * @format int32
   * @example 1
   */
  campaignId?: number;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number;
  contact?: ContactDetailsDto;
  /**
   * Status
   * @example "Pending"
   */
  status?: "Pending" | "Sent" | "Failed" | "Skipped";
  /**
   * Skip Reason
   * @example "None"
   */
  skipReason?:
    | "None"
    | "Unsubscribed"
    | "Duplicate"
    | "Suppressed"
    | "InvalidEmail";
  /**
   * Sent At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  sentAt?: string | null;
  /**
   * Expected Send At Utc
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  expectedSendAtUtc?: string | null;
  /**
   * Effective Timezone
   * @format int32
   * @example 1
   */
  effectiveTimezone?: number;
  /**
   * Error Message
   * @example "string"
   */
  errorMessage?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
}

export interface CampaignStatisticsDto {
  /**
   * Total Recipients
   * @format int32
   * @example 1
   */
  totalRecipients?: number;
  /**
   * Sent Count
   * @format int32
   * @example 1
   */
  sentCount?: number;
  /**
   * Failed Count
   * @format int32
   * @example 1
   */
  failedCount?: number;
  /**
   * Skipped Count
   * @format int32
   * @example 1
   */
  skippedCount?: number;
  /**
   * Pending Count
   * @format int32
   * @example 1
   */
  pendingCount?: number;
  /**
   * Skipped Unsubscribed
   * @format int32
   * @example 1
   */
  skippedUnsubscribed?: number;
  /**
   * Skipped Duplicate
   * @format int32
   * @example 1
   */
  skippedDuplicate?: number;
  /**
   * Skipped Suppressed
   * @format int32
   * @example 1
   */
  skippedSuppressed?: number;
  /**
   * Skipped Invalid Email
   * @format int32
   * @example 1
   */
  skippedInvalidEmail?: number;
}

export interface CampaignUpdateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Email Template Id
   * @format int32
   * @example 1
   */
  emailTemplateId?: number | null;
  /** Segment Ids */
  segmentIds?: number[] | null;
  /** Exclude Segment Ids */
  excludeSegmentIds?: number[] | null;
  /**
   * Scheduled At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  scheduledAt?: string | null;
  /**
   * Time Zone
   * @format int32
   * @example 1
   */
  timeZone?: number | null;
  /**
   * Use Contact Time Zone
   * @example true
   */
  useContactTimeZone?: boolean | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  utmParameters?: Utms;
}

export interface ChangePasswordDto {
  /**
   * Current Password
   * @minLength 1
   * @example "string"
   */
  currentPassword: string;
  /**
   * New Password
   * @minLength 1
   * @example "string"
   */
  newPassword: string;
}

export interface CmsMetricsDto {
  /**
   * Total Content
   * @format int64
   */
  totalContent?: number;
  /**
   * Content Change Pct
   * @format double
   * @example 1
   */
  contentChangePct?: number | null;
  /**
   * Content Updates
   * @format int64
   */
  contentUpdates?: number;
  /**
   * Content Updates Change Pct
   * @format double
   * @example 1
   */
  contentUpdatesChangePct?: number | null;
  /**
   * Total Media
   * @format int64
   */
  totalMedia?: number;
  /**
   * Media Change Pct
   * @format double
   * @example 1
   */
  mediaChangePct?: number | null;
  /**
   * Total Comments
   * @format int64
   */
  totalComments?: number;
  /**
   * Comments Change Pct
   * @format double
   * @example 1
   */
  commentsChangePct?: number | null;
}

export interface CommentCreateBaseDto {
  /**
   * Author Email
   * @format email
   * @minLength 1
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  authorEmail: string;
  /**
   * Author Name
   * @example "string"
   */
  authorName?: string;
  /**
   * Body
   * @minLength 1
   * @example "string"
   */
  body: string;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Parent Id
   * @format int32
   * @example 1
   */
  parentId?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Language
   * @example "string"
   */
  language?: string;
  /**
   * Published At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  publishedAt?: string | null;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
}

export interface CommentCreateDto {
  /**
   * Author Email
   * @format email
   * @minLength 1
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  authorEmail: string;
  /**
   * Author Name
   * @example "string"
   */
  authorName?: string;
  /**
   * Body
   * @minLength 1
   * @example "string"
   */
  body: string;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Parent Id
   * @format int32
   * @example 1
   */
  parentId?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Language
   * @example "string"
   */
  language?: string;
  /**
   * Published At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  publishedAt?: string | null;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Commentable Id
   * @format int32
   * @example 1
   */
  commentableId?: number | null;
  /**
   * Commentable Uid
   * @example "string"
   */
  commentableUid?: string | null;
  /**
   * Commentable Type
   * @minLength 1
   * @example "string"
   */
  commentableType: string;
}

export interface CommentDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Parent Id
   * @format int32
   * @example 1
   */
  parentId?: number | null;
  /**
   * Author Name
   * @example "string"
   */
  authorName?: string;
  /**
   * Body
   * @example "string"
   */
  body?: string;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Published At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  publishedAt?: string | null;
  /**
   * Commentable Id
   * @format int32
   * @example 1
   */
  commentableId?: number;
  /**
   * Commentable Type
   * @example "string"
   */
  commentableType?: string;
  /**
   * Avatar Url
   * @example "string"
   */
  avatarUrl?: string;
  /**
   * Language
   * @example "string"
   */
  language?: string;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  content?: ContentDetailsDto;
  parent?: CommentDetailsDto;
  /**
   * Author Email
   * @example "string"
   */
  authorEmail?: string;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  contact?: ContactDetailsDto;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Status
   * @example "NotApproved"
   */
  status?: "NotApproved" | "Approved" | "Spam" | "Answer";
  /**
   * Answer Status
   * @example "Unanswered"
   */
  answerStatus?: "Unanswered" | "Answered" | "Closed";
}

export interface CommentDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: CommentDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, CommentDetailsDto>;
}

export interface CommentImportDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string | null;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Created By Ip
   * @example "string"
   */
  createdByIp?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Created By User Agent
   * @example "string"
   */
  createdByUserAgent?: string | null;
  /**
   * Updated By Ip
   * @example "string"
   */
  updatedByIp?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Updated By User Agent
   * @example "string"
   */
  updatedByUserAgent?: string | null;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Author Name
   * @example "string"
   */
  authorName?: string | null;
  /**
   * Author Email
   * @format email
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  authorEmail?: string | null;
  /**
   * Body
   * @example "string"
   */
  body?: string | null;
  /**
   * Status
   * @example "NotApproved"
   */
  status?: "NotApproved" | "Approved" | "Spam" | "Answer" | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Published At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  publishedAt?: string | null;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Commentable Id
   * @format int32
   * @example 1
   */
  commentableId?: number | null;
  /**
   * Commentable Type
   * @example "string"
   */
  commentableType?: string | null;
  /**
   * Parent Id
   * @format int32
   * @example 1
   */
  parentId?: number | null;
  /**
   * Key
   * @example "string"
   */
  key?: string | null;
  /**
   * Parent Key
   * @example "string"
   */
  parentKey?: string | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Answer Status
   * @example "Unanswered"
   */
  answerStatus?: "Unanswered" | "Answered" | "Closed" | null;
}

export interface CommentSummaryDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * User
   * @example "string"
   */
  user?: string;
  /**
   * Comment
   * @example "string"
   */
  comment?: string;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Article Id
   * @format int32
   * @example 1
   */
  articleId?: number | null;
  /**
   * Article
   * @example "string"
   */
  article?: string | null;
}

export interface CommentUpdateDto {
  /**
   * Body
   * @example "string"
   */
  body?: string | null;
  /**
   * Author Name
   * @example "string"
   */
  authorName?: string | null;
  /**
   * Author Email
   * @format email
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  authorEmail?: string | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Published At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  publishedAt?: string | null;
  /**
   * Status
   * @example "NotApproved"
   */
  status?: "NotApproved" | "Approved" | "Spam" | "Answer" | null;
  /**
   * Answer Status
   * @example "Unanswered"
   */
  answerStatus?: "Unanswered" | "Answered" | "Closed" | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
}

export interface CommentsWithStatisticsDto {
  /** Comments */
  comments?: CommentDetailsDto[];
  /** Statistics */
  statistics?: Record<string, number>;
}

export interface ConfigDto {
  auth?: AuthConfigDto;
  /** Entities */
  entities?: string[];
  /** Languages */
  languages?: LanguageDto[];
  /**
   * Settings
   * @example {"key1":"value1","key2":"value2"}
   */
  settings?: Record<string, string | null>;
  /**
   * Default Language
   * @example "string"
   */
  defaultLanguage?: string;
  /** Modules */
  modules?: DynamicModuleDto[] | null;
  /** Capabilities */
  capabilities?: string[];
  primaryCurrency?: CurrencyInfoDto;
}

export interface ContactCreateDto {
  /**
   * Prefix
   * @example "string"
   */
  prefix?: string | null;
  /**
   * First Name
   * @example "string"
   */
  firstName?: string | null;
  /**
   * Middle Name
   * @example "string"
   */
  middleName?: string | null;
  /**
   * Last Name
   * @example "string"
   */
  lastName?: string | null;
  /**
   * Birthday
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  birthday?: string | null;
  /**
   * Continent Code
   * @example "ZZ"
   */
  continentCode?: "ZZ" | "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA" | null;
  /**
   * Country Code
   * @example "ZZ"
   */
  countryCode?:
    | "ZZ"
    | "AF"
    | "AL"
    | "AQ"
    | "DZ"
    | "AS"
    | "AD"
    | "AO"
    | "AG"
    | "AZ"
    | "AR"
    | "AU"
    | "AT"
    | "BS"
    | "BH"
    | "BD"
    | "AM"
    | "BB"
    | "BE"
    | "BM"
    | "BT"
    | "BO"
    | "BA"
    | "BW"
    | "BV"
    | "BR"
    | "BZ"
    | "IO"
    | "SB"
    | "VG"
    | "BN"
    | "BG"
    | "MM"
    | "BI"
    | "BY"
    | "KH"
    | "CM"
    | "CA"
    | "CV"
    | "KY"
    | "CF"
    | "LK"
    | "TD"
    | "CL"
    | "CN"
    | "TW"
    | "CX"
    | "CC"
    | "CO"
    | "KM"
    | "YT"
    | "CG"
    | "CD"
    | "CK"
    | "CR"
    | "HR"
    | "CU"
    | "CY"
    | "CZ"
    | "BJ"
    | "DK"
    | "DM"
    | "DO"
    | "EC"
    | "SV"
    | "GQ"
    | "ET"
    | "ER"
    | "EE"
    | "FO"
    | "FK"
    | "GS"
    | "FJ"
    | "FI"
    | "AX"
    | "FR"
    | "GF"
    | "PF"
    | "TF"
    | "DJ"
    | "GA"
    | "GE"
    | "GM"
    | "PS"
    | "DE"
    | "GH"
    | "GI"
    | "KI"
    | "GR"
    | "GL"
    | "GD"
    | "GP"
    | "GU"
    | "GT"
    | "GN"
    | "GY"
    | "HT"
    | "HM"
    | "VA"
    | "HN"
    | "HK"
    | "HU"
    | "IS"
    | "IN"
    | "ID"
    | "IR"
    | "IQ"
    | "IE"
    | "IL"
    | "IT"
    | "CI"
    | "JM"
    | "JP"
    | "KZ"
    | "JO"
    | "KE"
    | "KP"
    | "KR"
    | "KW"
    | "KG"
    | "LA"
    | "LB"
    | "LS"
    | "LV"
    | "LR"
    | "LY"
    | "LI"
    | "LT"
    | "LU"
    | "MO"
    | "MG"
    | "MW"
    | "MY"
    | "MV"
    | "ML"
    | "MT"
    | "MQ"
    | "MR"
    | "MU"
    | "MX"
    | "MC"
    | "MN"
    | "MD"
    | "ME"
    | "MS"
    | "MA"
    | "MZ"
    | "OM"
    | "NA"
    | "NR"
    | "NP"
    | "NL"
    | "CW"
    | "AW"
    | "SX"
    | "BQ"
    | "NC"
    | "VU"
    | "NZ"
    | "NI"
    | "NE"
    | "NG"
    | "NU"
    | "NF"
    | "NO"
    | "MP"
    | "UM"
    | "FM"
    | "MH"
    | "PW"
    | "PK"
    | "PA"
    | "PG"
    | "PY"
    | "PE"
    | "PH"
    | "PN"
    | "PL"
    | "PT"
    | "GW"
    | "TL"
    | "PR"
    | "QA"
    | "RE"
    | "RO"
    | "RU"
    | "RW"
    | "BL"
    | "SH"
    | "KN"
    | "AI"
    | "LC"
    | "MF"
    | "PM"
    | "VC"
    | "SM"
    | "ST"
    | "SA"
    | "SN"
    | "RS"
    | "SC"
    | "SL"
    | "SG"
    | "SK"
    | "VN"
    | "SI"
    | "SO"
    | "ZA"
    | "ZW"
    | "ES"
    | "SS"
    | "SD"
    | "EH"
    | "SR"
    | "SJ"
    | "SZ"
    | "SE"
    | "CH"
    | "SY"
    | "TJ"
    | "TH"
    | "TG"
    | "TK"
    | "TO"
    | "TT"
    | "AE"
    | "TN"
    | "TR"
    | "TM"
    | "TC"
    | "TV"
    | "UG"
    | "UA"
    | "MK"
    | "EG"
    | "GB"
    | "GG"
    | "JE"
    | "IM"
    | "TZ"
    | "US"
    | "VI"
    | "BF"
    | "UY"
    | "UZ"
    | "VE"
    | "WF"
    | "WS"
    | "YE"
    | "ZM"
    | null;
  /**
   * City Name
   * @example "string"
   */
  cityName?: string | null;
  /**
   * Address1
   * @example "string"
   */
  address1?: string | null;
  /**
   * Address2
   * @example "string"
   */
  address2?: string | null;
  /**
   * Job Title
   * @example "string"
   */
  jobTitle?: string | null;
  /**
   * Company Name
   * @example "string"
   */
  companyName?: string | null;
  /**
   * Department
   * @example "string"
   */
  department?: string | null;
  /**
   * State
   * @example "string"
   */
  state?: string | null;
  /**
   * Zip
   * @example "string"
   */
  zip?: string | null;
  /**
   * Phone
   * @example "string"
   */
  phone?: string | null;
  /**
   * Phone Raw
   * @example "string"
   */
  phoneRaw?: string | null;
  /**
   * Timezone
   * @format int32
   * @example 1
   */
  timezone?: number | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Social Media
   * @example {"key1":"value1","key2":"value2"}
   */
  socialMedia?: Record<string, string>;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Unsubscribe Id
   * @format int32
   * @example 1
   */
  unsubscribeId?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Account Id
   * @format int32
   * @example 1
   */
  accountId?: number | null;
  /**
   * Email
   * @format email
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  email?: string | null;
}

export interface ContactDetailsDto {
  /**
   * Prefix
   * @example "string"
   */
  prefix?: string | null;
  /**
   * First Name
   * @example "string"
   */
  firstName?: string | null;
  /**
   * Middle Name
   * @example "string"
   */
  middleName?: string | null;
  /**
   * Last Name
   * @example "string"
   */
  lastName?: string | null;
  /**
   * Birthday
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  birthday?: string | null;
  /**
   * Continent Code
   * @example "ZZ"
   */
  continentCode?: "ZZ" | "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA" | null;
  /**
   * Country Code
   * @example "ZZ"
   */
  countryCode?:
    | "ZZ"
    | "AF"
    | "AL"
    | "AQ"
    | "DZ"
    | "AS"
    | "AD"
    | "AO"
    | "AG"
    | "AZ"
    | "AR"
    | "AU"
    | "AT"
    | "BS"
    | "BH"
    | "BD"
    | "AM"
    | "BB"
    | "BE"
    | "BM"
    | "BT"
    | "BO"
    | "BA"
    | "BW"
    | "BV"
    | "BR"
    | "BZ"
    | "IO"
    | "SB"
    | "VG"
    | "BN"
    | "BG"
    | "MM"
    | "BI"
    | "BY"
    | "KH"
    | "CM"
    | "CA"
    | "CV"
    | "KY"
    | "CF"
    | "LK"
    | "TD"
    | "CL"
    | "CN"
    | "TW"
    | "CX"
    | "CC"
    | "CO"
    | "KM"
    | "YT"
    | "CG"
    | "CD"
    | "CK"
    | "CR"
    | "HR"
    | "CU"
    | "CY"
    | "CZ"
    | "BJ"
    | "DK"
    | "DM"
    | "DO"
    | "EC"
    | "SV"
    | "GQ"
    | "ET"
    | "ER"
    | "EE"
    | "FO"
    | "FK"
    | "GS"
    | "FJ"
    | "FI"
    | "AX"
    | "FR"
    | "GF"
    | "PF"
    | "TF"
    | "DJ"
    | "GA"
    | "GE"
    | "GM"
    | "PS"
    | "DE"
    | "GH"
    | "GI"
    | "KI"
    | "GR"
    | "GL"
    | "GD"
    | "GP"
    | "GU"
    | "GT"
    | "GN"
    | "GY"
    | "HT"
    | "HM"
    | "VA"
    | "HN"
    | "HK"
    | "HU"
    | "IS"
    | "IN"
    | "ID"
    | "IR"
    | "IQ"
    | "IE"
    | "IL"
    | "IT"
    | "CI"
    | "JM"
    | "JP"
    | "KZ"
    | "JO"
    | "KE"
    | "KP"
    | "KR"
    | "KW"
    | "KG"
    | "LA"
    | "LB"
    | "LS"
    | "LV"
    | "LR"
    | "LY"
    | "LI"
    | "LT"
    | "LU"
    | "MO"
    | "MG"
    | "MW"
    | "MY"
    | "MV"
    | "ML"
    | "MT"
    | "MQ"
    | "MR"
    | "MU"
    | "MX"
    | "MC"
    | "MN"
    | "MD"
    | "ME"
    | "MS"
    | "MA"
    | "MZ"
    | "OM"
    | "NA"
    | "NR"
    | "NP"
    | "NL"
    | "CW"
    | "AW"
    | "SX"
    | "BQ"
    | "NC"
    | "VU"
    | "NZ"
    | "NI"
    | "NE"
    | "NG"
    | "NU"
    | "NF"
    | "NO"
    | "MP"
    | "UM"
    | "FM"
    | "MH"
    | "PW"
    | "PK"
    | "PA"
    | "PG"
    | "PY"
    | "PE"
    | "PH"
    | "PN"
    | "PL"
    | "PT"
    | "GW"
    | "TL"
    | "PR"
    | "QA"
    | "RE"
    | "RO"
    | "RU"
    | "RW"
    | "BL"
    | "SH"
    | "KN"
    | "AI"
    | "LC"
    | "MF"
    | "PM"
    | "VC"
    | "SM"
    | "ST"
    | "SA"
    | "SN"
    | "RS"
    | "SC"
    | "SL"
    | "SG"
    | "SK"
    | "VN"
    | "SI"
    | "SO"
    | "ZA"
    | "ZW"
    | "ES"
    | "SS"
    | "SD"
    | "EH"
    | "SR"
    | "SJ"
    | "SZ"
    | "SE"
    | "CH"
    | "SY"
    | "TJ"
    | "TH"
    | "TG"
    | "TK"
    | "TO"
    | "TT"
    | "AE"
    | "TN"
    | "TR"
    | "TM"
    | "TC"
    | "TV"
    | "UG"
    | "UA"
    | "MK"
    | "EG"
    | "GB"
    | "GG"
    | "JE"
    | "IM"
    | "TZ"
    | "US"
    | "VI"
    | "BF"
    | "UY"
    | "UZ"
    | "VE"
    | "WF"
    | "WS"
    | "YE"
    | "ZM"
    | null;
  /**
   * City Name
   * @example "string"
   */
  cityName?: string | null;
  /**
   * Address1
   * @example "string"
   */
  address1?: string | null;
  /**
   * Address2
   * @example "string"
   */
  address2?: string | null;
  /**
   * Job Title
   * @example "string"
   */
  jobTitle?: string | null;
  /**
   * Company Name
   * @example "string"
   */
  companyName?: string | null;
  /**
   * Department
   * @example "string"
   */
  department?: string | null;
  /**
   * State
   * @example "string"
   */
  state?: string | null;
  /**
   * Zip
   * @example "string"
   */
  zip?: string | null;
  /**
   * Phone
   * @example "string"
   */
  phone?: string | null;
  /**
   * Phone Raw
   * @example "string"
   */
  phoneRaw?: string | null;
  /**
   * Timezone
   * @format int32
   * @example 1
   */
  timezone?: number | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Social Media
   * @example {"key1":"value1","key2":"value2"}
   */
  socialMedia?: Record<string, string>;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Unsubscribe Id
   * @format int32
   * @example 1
   */
  unsubscribeId?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Account Id
   * @format int32
   * @example 1
   */
  accountId?: number | null;
  /**
   * Email
   * @format email
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  email?: string | null;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Full Name
   * @example "string"
   */
  fullName?: string | null;
  /**
   * Ip Address
   * @example "string"
   */
  ipAddress?: string | null;
  /**
   * User Device Summary
   * @example "string"
   */
  userDeviceSummary?: string | null;
  utms?: Utms;
  /**
   * Avatar Url
   * @example "string"
   */
  avatarUrl?: string;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Domain Id
   * @format int32
   * @example 1
   */
  domainId?: number | null;
  /**
   * Deals Count
   * @format int32
   * @example 1
   */
  dealsCount?: number;
  /**
   * Orders Count
   * @format int32
   * @example 1
   */
  ordersCount?: number;
  /**
   * Last Order Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  lastOrderDate?: string | null;
  /**
   * Total Revenue
   * @format double
   * @example 1
   */
  totalRevenue?: number;
  /** Pending Updates */
  pendingUpdates?: PendingContactUpdate[] | null;
  domain?: DomainDetailsDto;
  account?: AccountDetailsDto;
  unsubscribe?: UnsubscribeDetailsDto;
  /** Orders */
  orders?: OrderDetailsDto[] | null;
  /** Enrollments */
  enrollments?: SequenceEnrollmentDetailsDto[] | null;
}

export interface ContactDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: ContactDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, ContactDetailsDto>;
}

export interface ContactEmailCommunicationDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Schedule Id
   * @format int32
   * @example 1
   */
  scheduleId?: number | null;
  /**
   * Template Id
   * @format int32
   * @example 1
   */
  templateId?: number | null;
  /**
   * Subject
   * @example "string"
   */
  subject?: string;
  /**
   * Recipients
   * @example "string"
   */
  recipients?: string;
  /**
   * From Email
   * @example "string"
   */
  fromEmail?: string;
  /**
   * Body
   * @example "string"
   */
  body?: string | null;
  /**
   * Message Id
   * @example "string"
   */
  messageId?: string;
  /**
   * Status
   * @example "NotSent"
   */
  status?: "NotSent" | "Sent" | "Received";
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
}

export interface ContactEmailCommunicationListItemDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Schedule Id
   * @format int32
   * @example 1
   */
  scheduleId?: number | null;
  /**
   * Template Id
   * @format int32
   * @example 1
   */
  templateId?: number | null;
  /**
   * Subject
   * @example "string"
   */
  subject?: string;
  /**
   * Recipients
   * @example "string"
   */
  recipients?: string;
  /**
   * From Email
   * @example "string"
   */
  fromEmail?: string;
  /**
   * Message Id
   * @example "string"
   */
  messageId?: string;
  /**
   * Status
   * @example "NotSent"
   */
  status?: "NotSent" | "Sent" | "Received";
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Body
   * @example "string"
   */
  body?: string | null;
}

export interface ContactEmailCommunicationStatsDto {
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number;
  /**
   * From
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  from?: string | null;
  /**
   * To
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  to?: string | null;
  /**
   * Total Count
   * @format int64
   */
  totalCount?: number;
  /**
   * Sent Count
   * @format int64
   */
  sentCount?: number;
  /**
   * Received Count
   * @format int64
   */
  receivedCount?: number;
  /**
   * Not Sent Count
   * @format int64
   */
  notSentCount?: number;
  /**
   * First Communication At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  firstCommunicationAt?: string | null;
  /**
   * Last Communication At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  lastCommunicationAt?: string | null;
  /** Timeline */
  timeline?: ContactEmailCommunicationTimelinePointDto[];
}

export interface ContactEmailCommunicationTimelinePointDto {
  /**
   * Period Start
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  periodStart?: string;
  /**
   * Period End
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  periodEnd?: string;
  /**
   * Total Count
   * @format int64
   */
  totalCount?: number;
  /**
   * Sent Count
   * @format int64
   */
  sentCount?: number;
  /**
   * Received Count
   * @format int64
   */
  receivedCount?: number;
  /**
   * Not Sent Count
   * @format int64
   */
  notSentCount?: number;
}

export interface ContactGrowthPointDto {
  /**
   * Period
   * @example "string"
   */
  period?: string;
  /**
   * Contacts
   * @format int32
   * @example 1
   */
  contacts?: number;
}

export interface ContactImportDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string | null;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Created By Ip
   * @example "string"
   */
  createdByIp?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Created By User Agent
   * @example "string"
   */
  createdByUserAgent?: string | null;
  /**
   * Updated By Ip
   * @example "string"
   */
  updatedByIp?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Updated By User Agent
   * @example "string"
   */
  updatedByUserAgent?: string | null;
  /**
   * Email
   * @format email
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  email?: string | null;
  /**
   * Prefix
   * @example "string"
   */
  prefix?: string | null;
  /**
   * First Name
   * @example "string"
   */
  firstName?: string | null;
  /**
   * Middle Name
   * @example "string"
   */
  middleName?: string | null;
  /**
   * Last Name
   * @example "string"
   */
  lastName?: string | null;
  /**
   * Birthday
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  birthday?: string | null;
  /**
   * Continent Code
   * @example "ZZ"
   */
  continentCode?: "ZZ" | "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA" | null;
  /**
   * Country Code
   * @example "ZZ"
   */
  countryCode?:
    | "ZZ"
    | "AF"
    | "AL"
    | "AQ"
    | "DZ"
    | "AS"
    | "AD"
    | "AO"
    | "AG"
    | "AZ"
    | "AR"
    | "AU"
    | "AT"
    | "BS"
    | "BH"
    | "BD"
    | "AM"
    | "BB"
    | "BE"
    | "BM"
    | "BT"
    | "BO"
    | "BA"
    | "BW"
    | "BV"
    | "BR"
    | "BZ"
    | "IO"
    | "SB"
    | "VG"
    | "BN"
    | "BG"
    | "MM"
    | "BI"
    | "BY"
    | "KH"
    | "CM"
    | "CA"
    | "CV"
    | "KY"
    | "CF"
    | "LK"
    | "TD"
    | "CL"
    | "CN"
    | "TW"
    | "CX"
    | "CC"
    | "CO"
    | "KM"
    | "YT"
    | "CG"
    | "CD"
    | "CK"
    | "CR"
    | "HR"
    | "CU"
    | "CY"
    | "CZ"
    | "BJ"
    | "DK"
    | "DM"
    | "DO"
    | "EC"
    | "SV"
    | "GQ"
    | "ET"
    | "ER"
    | "EE"
    | "FO"
    | "FK"
    | "GS"
    | "FJ"
    | "FI"
    | "AX"
    | "FR"
    | "GF"
    | "PF"
    | "TF"
    | "DJ"
    | "GA"
    | "GE"
    | "GM"
    | "PS"
    | "DE"
    | "GH"
    | "GI"
    | "KI"
    | "GR"
    | "GL"
    | "GD"
    | "GP"
    | "GU"
    | "GT"
    | "GN"
    | "GY"
    | "HT"
    | "HM"
    | "VA"
    | "HN"
    | "HK"
    | "HU"
    | "IS"
    | "IN"
    | "ID"
    | "IR"
    | "IQ"
    | "IE"
    | "IL"
    | "IT"
    | "CI"
    | "JM"
    | "JP"
    | "KZ"
    | "JO"
    | "KE"
    | "KP"
    | "KR"
    | "KW"
    | "KG"
    | "LA"
    | "LB"
    | "LS"
    | "LV"
    | "LR"
    | "LY"
    | "LI"
    | "LT"
    | "LU"
    | "MO"
    | "MG"
    | "MW"
    | "MY"
    | "MV"
    | "ML"
    | "MT"
    | "MQ"
    | "MR"
    | "MU"
    | "MX"
    | "MC"
    | "MN"
    | "MD"
    | "ME"
    | "MS"
    | "MA"
    | "MZ"
    | "OM"
    | "NA"
    | "NR"
    | "NP"
    | "NL"
    | "CW"
    | "AW"
    | "SX"
    | "BQ"
    | "NC"
    | "VU"
    | "NZ"
    | "NI"
    | "NE"
    | "NG"
    | "NU"
    | "NF"
    | "NO"
    | "MP"
    | "UM"
    | "FM"
    | "MH"
    | "PW"
    | "PK"
    | "PA"
    | "PG"
    | "PY"
    | "PE"
    | "PH"
    | "PN"
    | "PL"
    | "PT"
    | "GW"
    | "TL"
    | "PR"
    | "QA"
    | "RE"
    | "RO"
    | "RU"
    | "RW"
    | "BL"
    | "SH"
    | "KN"
    | "AI"
    | "LC"
    | "MF"
    | "PM"
    | "VC"
    | "SM"
    | "ST"
    | "SA"
    | "SN"
    | "RS"
    | "SC"
    | "SL"
    | "SG"
    | "SK"
    | "VN"
    | "SI"
    | "SO"
    | "ZA"
    | "ZW"
    | "ES"
    | "SS"
    | "SD"
    | "EH"
    | "SR"
    | "SJ"
    | "SZ"
    | "SE"
    | "CH"
    | "SY"
    | "TJ"
    | "TH"
    | "TG"
    | "TK"
    | "TO"
    | "TT"
    | "AE"
    | "TN"
    | "TR"
    | "TM"
    | "TC"
    | "TV"
    | "UG"
    | "UA"
    | "MK"
    | "EG"
    | "GB"
    | "GG"
    | "JE"
    | "IM"
    | "TZ"
    | "US"
    | "VI"
    | "BF"
    | "UY"
    | "UZ"
    | "VE"
    | "WF"
    | "WS"
    | "YE"
    | "ZM"
    | null;
  /**
   * City Name
   * @example "string"
   */
  cityName?: string | null;
  /**
   * Address1
   * @example "string"
   */
  address1?: string | null;
  /**
   * Address2
   * @example "string"
   */
  address2?: string | null;
  /**
   * Job Title
   * @example "string"
   */
  jobTitle?: string | null;
  /**
   * Company Name
   * @example "string"
   */
  companyName?: string | null;
  /**
   * Department
   * @example "string"
   */
  department?: string | null;
  /**
   * State
   * @example "string"
   */
  state?: string | null;
  /**
   * Zip
   * @example "string"
   */
  zip?: string | null;
  /**
   * Phone
   * @example "string"
   */
  phone?: string | null;
  /**
   * Phone Raw
   * @example "string"
   */
  phoneRaw?: string | null;
  /**
   * Timezone
   * @format int32
   * @example 1
   */
  timezone?: number | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Social Media
   * @example {"key1":"value1","key2":"value2"}
   */
  socialMedia?: Record<string, string>;
  /**
   * Unsubscribe Id
   * @format int32
   * @example 1
   */
  unsubscribeId?: number | null;
  /**
   * Account Id
   * @format int32
   * @example 1
   */
  accountId?: number | null;
  /**
   * Account Name
   * @example "string"
   */
  accountName?: string | null;
  /**
   * Domain Id
   * @format int32
   * @example 1
   */
  domainId?: number | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
}

export interface ContactUpdateDto {
  /**
   * Prefix
   * @example "string"
   */
  prefix?: string | null;
  /**
   * First Name
   * @example "string"
   */
  firstName?: string | null;
  /**
   * Middle Name
   * @example "string"
   */
  middleName?: string | null;
  /**
   * Last Name
   * @example "string"
   */
  lastName?: string | null;
  /**
   * Birthday
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  birthday?: string | null;
  /**
   * Continent Code
   * @example "ZZ"
   */
  continentCode?: "ZZ" | "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA" | null;
  /**
   * Country Code
   * @example "ZZ"
   */
  countryCode?:
    | "ZZ"
    | "AF"
    | "AL"
    | "AQ"
    | "DZ"
    | "AS"
    | "AD"
    | "AO"
    | "AG"
    | "AZ"
    | "AR"
    | "AU"
    | "AT"
    | "BS"
    | "BH"
    | "BD"
    | "AM"
    | "BB"
    | "BE"
    | "BM"
    | "BT"
    | "BO"
    | "BA"
    | "BW"
    | "BV"
    | "BR"
    | "BZ"
    | "IO"
    | "SB"
    | "VG"
    | "BN"
    | "BG"
    | "MM"
    | "BI"
    | "BY"
    | "KH"
    | "CM"
    | "CA"
    | "CV"
    | "KY"
    | "CF"
    | "LK"
    | "TD"
    | "CL"
    | "CN"
    | "TW"
    | "CX"
    | "CC"
    | "CO"
    | "KM"
    | "YT"
    | "CG"
    | "CD"
    | "CK"
    | "CR"
    | "HR"
    | "CU"
    | "CY"
    | "CZ"
    | "BJ"
    | "DK"
    | "DM"
    | "DO"
    | "EC"
    | "SV"
    | "GQ"
    | "ET"
    | "ER"
    | "EE"
    | "FO"
    | "FK"
    | "GS"
    | "FJ"
    | "FI"
    | "AX"
    | "FR"
    | "GF"
    | "PF"
    | "TF"
    | "DJ"
    | "GA"
    | "GE"
    | "GM"
    | "PS"
    | "DE"
    | "GH"
    | "GI"
    | "KI"
    | "GR"
    | "GL"
    | "GD"
    | "GP"
    | "GU"
    | "GT"
    | "GN"
    | "GY"
    | "HT"
    | "HM"
    | "VA"
    | "HN"
    | "HK"
    | "HU"
    | "IS"
    | "IN"
    | "ID"
    | "IR"
    | "IQ"
    | "IE"
    | "IL"
    | "IT"
    | "CI"
    | "JM"
    | "JP"
    | "KZ"
    | "JO"
    | "KE"
    | "KP"
    | "KR"
    | "KW"
    | "KG"
    | "LA"
    | "LB"
    | "LS"
    | "LV"
    | "LR"
    | "LY"
    | "LI"
    | "LT"
    | "LU"
    | "MO"
    | "MG"
    | "MW"
    | "MY"
    | "MV"
    | "ML"
    | "MT"
    | "MQ"
    | "MR"
    | "MU"
    | "MX"
    | "MC"
    | "MN"
    | "MD"
    | "ME"
    | "MS"
    | "MA"
    | "MZ"
    | "OM"
    | "NA"
    | "NR"
    | "NP"
    | "NL"
    | "CW"
    | "AW"
    | "SX"
    | "BQ"
    | "NC"
    | "VU"
    | "NZ"
    | "NI"
    | "NE"
    | "NG"
    | "NU"
    | "NF"
    | "NO"
    | "MP"
    | "UM"
    | "FM"
    | "MH"
    | "PW"
    | "PK"
    | "PA"
    | "PG"
    | "PY"
    | "PE"
    | "PH"
    | "PN"
    | "PL"
    | "PT"
    | "GW"
    | "TL"
    | "PR"
    | "QA"
    | "RE"
    | "RO"
    | "RU"
    | "RW"
    | "BL"
    | "SH"
    | "KN"
    | "AI"
    | "LC"
    | "MF"
    | "PM"
    | "VC"
    | "SM"
    | "ST"
    | "SA"
    | "SN"
    | "RS"
    | "SC"
    | "SL"
    | "SG"
    | "SK"
    | "VN"
    | "SI"
    | "SO"
    | "ZA"
    | "ZW"
    | "ES"
    | "SS"
    | "SD"
    | "EH"
    | "SR"
    | "SJ"
    | "SZ"
    | "SE"
    | "CH"
    | "SY"
    | "TJ"
    | "TH"
    | "TG"
    | "TK"
    | "TO"
    | "TT"
    | "AE"
    | "TN"
    | "TR"
    | "TM"
    | "TC"
    | "TV"
    | "UG"
    | "UA"
    | "MK"
    | "EG"
    | "GB"
    | "GG"
    | "JE"
    | "IM"
    | "TZ"
    | "US"
    | "VI"
    | "BF"
    | "UY"
    | "UZ"
    | "VE"
    | "WF"
    | "WS"
    | "YE"
    | "ZM"
    | null;
  /**
   * City Name
   * @example "string"
   */
  cityName?: string | null;
  /**
   * Address1
   * @example "string"
   */
  address1?: string | null;
  /**
   * Address2
   * @example "string"
   */
  address2?: string | null;
  /**
   * Job Title
   * @example "string"
   */
  jobTitle?: string | null;
  /**
   * Company Name
   * @example "string"
   */
  companyName?: string | null;
  /**
   * Department
   * @example "string"
   */
  department?: string | null;
  /**
   * State
   * @example "string"
   */
  state?: string | null;
  /**
   * Zip
   * @example "string"
   */
  zip?: string | null;
  /**
   * Phone
   * @example "string"
   */
  phone?: string | null;
  /**
   * Phone Raw
   * @example "string"
   */
  phoneRaw?: string | null;
  /**
   * Timezone
   * @format int32
   * @example 1
   */
  timezone?: number | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Social Media
   * @example {"key1":"value1","key2":"value2"}
   */
  socialMedia?: Record<string, string>;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Unsubscribe Id
   * @format int32
   * @example 1
   */
  unsubscribeId?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Account Id
   * @format int32
   * @example 1
   */
  accountId?: number | null;
  /**
   * Email
   * @format email
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  email?: string | null;
}

export interface ContentCreateDto {
  /**
   * Title
   * @minLength 1
   * @example "string"
   */
  title: string;
  /**
   * Description
   * @minLength 1
   * @example "string"
   */
  description: string;
  /**
   * Body
   * @minLength 1
   * @example "string"
   */
  body: string;
  /**
   * Cover Image Url
   * @example "string"
   */
  coverImageUrl?: string | null;
  /**
   * Cover Image Alt
   * @example "string"
   */
  coverImageAlt?: string | null;
  /**
   * Slug
   * @minLength 1
   * @example "string"
   */
  slug: string;
  /**
   * Preview Slug
   * @example "string"
   */
  previewSlug?: string | null;
  seo?: SeoMetadataDto;
  /**
   * Type
   * @minLength 1
   * @example "string"
   */
  type: string;
  /**
   * Author
   * @minLength 1
   * @example "string"
   */
  author: string;
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language: string;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Category
   * @example "string"
   */
  category?: string;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[];
  /**
   * Allow Comments
   * @example true
   */
  allowComments?: boolean;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Published At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  publishedAt?: string | null;
}

export interface ContentDetailsDto {
  /**
   * Title
   * @minLength 1
   * @example "string"
   */
  title: string;
  /**
   * Description
   * @minLength 1
   * @example "string"
   */
  description: string;
  /**
   * Body
   * @minLength 1
   * @example "string"
   */
  body: string;
  /**
   * Cover Image Url
   * @example "string"
   */
  coverImageUrl?: string | null;
  /**
   * Cover Image Alt
   * @example "string"
   */
  coverImageAlt?: string | null;
  /**
   * Slug
   * @minLength 1
   * @example "string"
   */
  slug: string;
  /**
   * Preview Slug
   * @example "string"
   */
  previewSlug?: string | null;
  seo?: SeoMetadataDto;
  /**
   * Type
   * @minLength 1
   * @example "string"
   */
  type: string;
  /**
   * Author
   * @minLength 1
   * @example "string"
   */
  author: string;
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language: string;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Category
   * @example "string"
   */
  category?: string;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[];
  /**
   * Allow Comments
   * @example true
   */
  allowComments?: boolean;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Published At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  publishedAt?: string | null;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /** Comments */
  comments?: CommentDetailsDto[] | null;
  /** Translations */
  translations?: Record<string, number | null>;
}

export interface ContentDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: ContentDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, ContentDetailsDto>;
}

export interface ContentDistributionItemDto {
  /**
   * Name
   * @example "string"
   */
  name?: string;
  /**
   * Value
   * @format int32
   * @example 1
   */
  value?: number;
}

export interface ContentEditRequest {
  /**
   * Title
   * @minLength 1
   * @example "string"
   */
  title?: string | null;
  /**
   * Description
   * @minLength 1
   * @example "string"
   */
  description?: string | null;
  /**
   * Body
   * @minLength 1
   * @example "string"
   */
  body?: string | null;
  /**
   * Cover Image Url
   * @example "string"
   */
  coverImageUrl?: string | null;
  /**
   * Cover Image Alt
   * @example "string"
   */
  coverImageAlt?: string | null;
  /**
   * Slug
   * @minLength 1
   * @example "string"
   */
  slug?: string | null;
  /**
   * Preview Slug
   * @example "string"
   */
  previewSlug?: string | null;
  seo?: SeoMetadataDto;
  /**
   * Type
   * @minLength 1
   * @example "string"
   */
  type?: string | null;
  /**
   * Author
   * @example "string"
   */
  author?: string | null;
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language?: string | null;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Category
   * @example "string"
   */
  category?: string | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Allow Comments
   * @example true
   */
  allowComments?: boolean | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Published At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  publishedAt?: string | null;
  /**
   * Prompt
   * @minLength 1
   * @example "string"
   */
  prompt: string;
  /**
   * Word Count
   * @format int32
   * @example 1
   */
  wordCount?: number | null;
  /**
   * Character Count
   * @format int32
   * @example 1
   */
  characterCount?: number | null;
  /**
   * Required Media Paths
   * @maxItems 10
   */
  requiredMediaPaths?: string[] | null;
}

export interface ContentGenerationRequest {
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language: string;
  /**
   * Content Type
   * @minLength 1
   * @example "string"
   */
  contentType: string;
  /**
   * Prompt
   * @minLength 1
   * @example "string"
   */
  prompt: string;
  /**
   * Reference Content Id
   * @format int32
   * @example 1
   */
  referenceContentId?: number | null;
  /**
   * Word Count
   * @format int32
   * @example 1
   */
  wordCount?: number | null;
  /**
   * Character Count
   * @format int32
   * @example 1
   */
  characterCount?: number | null;
  /**
   * Required Media Paths
   * @maxItems 10
   */
  requiredMediaPaths?: string[] | null;
}

export interface ContentGrowthPointDto {
  /**
   * Period
   * @example "string"
   */
  period?: string;
  /**
   * Contents
   * @format int32
   * @example 1
   */
  contents?: number;
}

export interface ContentImportDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string | null;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Created By Ip
   * @example "string"
   */
  createdByIp?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Created By User Agent
   * @example "string"
   */
  createdByUserAgent?: string | null;
  /**
   * Updated By Ip
   * @example "string"
   */
  updatedByIp?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Updated By User Agent
   * @example "string"
   */
  updatedByUserAgent?: string | null;
  /**
   * Title
   * @example "string"
   */
  title?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Body
   * @example "string"
   */
  body?: string | null;
  /**
   * Cover Image Url
   * @example "string"
   */
  coverImageUrl?: string | null;
  /**
   * Cover Image Alt
   * @example "string"
   */
  coverImageAlt?: string | null;
  /**
   * Slug
   * @example "string"
   */
  slug?: string | null;
  /**
   * Preview Slug
   * @example "string"
   */
  previewSlug?: string | null;
  /**
   * Type
   * @example "string"
   */
  type?: string | null;
  /**
   * Author
   * @example "string"
   */
  author?: string | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Category
   * @example "string"
   */
  category?: string | null;
  /**
   * Tags
   * @example "string"
   */
  tags?: string | null;
  /**
   * Allow Comments
   * @example true
   */
  allowComments?: boolean | null;
  /**
   * Published At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  publishedAt?: string | null;
}

export interface ContentSummaryDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Title
   * @example "string"
   */
  title?: string;
  /**
   * Type
   * @example "string"
   */
  type?: string;
  /**
   * Author
   * @example "string"
   */
  author?: string;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Published At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  publishedAt?: string | null;
}

export interface ContentTypeCreateDto {
  /**
   * Uid
   * @minLength 1
   * @example "string"
   */
  uid: string;
  /**
   * Format
   * @example "MD"
   */
  format: "MD" | "MDX" | "HTML" | "JSON" | "YAML" | "PlainText";
  /**
   * Supports Comments
   * @example true
   */
  supportsComments?: boolean;
  /**
   * Supports Cover Image
   * @example true
   */
  supportsCoverImage?: boolean;
  /**
   * Supports Preview Slug
   * @example true
   */
  supportsPreviewSlug?: boolean;
  /**
   * Supports S E O
   * @example true
   */
  supportsSEO?: boolean;
  /**
   * Slug Prefix
   * @example "string"
   */
  slugPrefix?: string | null;
  /**
   * Slug Postfix
   * @example "string"
   */
  slugPostfix?: string | null;
}

export interface ContentTypeDetailsDto {
  /**
   * Uid
   * @minLength 1
   * @example "string"
   */
  uid: string;
  /**
   * Format
   * @example "MD"
   */
  format: "MD" | "MDX" | "HTML" | "JSON" | "YAML" | "PlainText";
  /**
   * Supports Comments
   * @example true
   */
  supportsComments?: boolean;
  /**
   * Supports Cover Image
   * @example true
   */
  supportsCoverImage?: boolean;
  /**
   * Supports Preview Slug
   * @example true
   */
  supportsPreviewSlug?: boolean;
  /**
   * Supports S E O
   * @example true
   */
  supportsSEO?: boolean;
  /**
   * Slug Prefix
   * @example "string"
   */
  slugPrefix?: string | null;
  /**
   * Slug Postfix
   * @example "string"
   */
  slugPostfix?: string | null;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Content Count
   * @format int32
   * @example 1
   */
  contentCount?: number;
}

export interface ContentTypeDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: ContentTypeDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, ContentTypeDetailsDto>;
}

export interface ContentTypeImportDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string | null;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Created By Ip
   * @example "string"
   */
  createdByIp?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Created By User Agent
   * @example "string"
   */
  createdByUserAgent?: string | null;
  /**
   * Updated By Ip
   * @example "string"
   */
  updatedByIp?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Updated By User Agent
   * @example "string"
   */
  updatedByUserAgent?: string | null;
  /**
   * Uid
   * @example "string"
   */
  uid?: string | null;
  /**
   * Format
   * @example "MD"
   */
  format?: "MD" | "MDX" | "HTML" | "JSON" | "YAML" | "PlainText" | null;
  /**
   * Supports Comments
   * @example true
   */
  supportsComments?: boolean | null;
  /**
   * Supports Cover Image
   * @example true
   */
  supportsCoverImage?: boolean | null;
  /**
   * Supports Preview Slug
   * @example true
   */
  supportsPreviewSlug?: boolean | null;
  /**
   * Supports S E O
   * @example true
   */
  supportsSEO?: boolean | null;
  /**
   * Slug Prefix
   * @example "string"
   */
  slugPrefix?: string | null;
  /**
   * Slug Postfix
   * @example "string"
   */
  slugPostfix?: string | null;
}

export interface ContentTypeUpdateDto {
  /**
   * Uid
   * @example "string"
   */
  uid?: string | null;
  /**
   * Format
   * @example "MD"
   */
  format?: "MD" | "MDX" | "HTML" | "JSON" | "YAML" | "PlainText" | null;
  /**
   * Supports Comments
   * @example true
   */
  supportsComments?: boolean | null;
  /**
   * Supports Cover Image
   * @example true
   */
  supportsCoverImage?: boolean | null;
  /**
   * Supports Preview Slug
   * @example true
   */
  supportsPreviewSlug?: boolean | null;
  /**
   * Supports S E O
   * @example true
   */
  supportsSEO?: boolean | null;
  /**
   * Slug Prefix
   * @example "string"
   */
  slugPrefix?: string | null;
  /**
   * Slug Postfix
   * @example "string"
   */
  slugPostfix?: string | null;
}

export interface ContentUpdateDto {
  /**
   * Title
   * @minLength 1
   * @example "string"
   */
  title?: string | null;
  /**
   * Description
   * @minLength 1
   * @example "string"
   */
  description?: string | null;
  /**
   * Body
   * @minLength 1
   * @example "string"
   */
  body?: string | null;
  /**
   * Cover Image Url
   * @example "string"
   */
  coverImageUrl?: string | null;
  /**
   * Cover Image Alt
   * @example "string"
   */
  coverImageAlt?: string | null;
  /**
   * Slug
   * @minLength 1
   * @example "string"
   */
  slug?: string | null;
  /**
   * Preview Slug
   * @example "string"
   */
  previewSlug?: string | null;
  seo?: SeoMetadataDto;
  /**
   * Type
   * @minLength 1
   * @example "string"
   */
  type?: string | null;
  /**
   * Author
   * @example "string"
   */
  author?: string | null;
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language?: string | null;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Category
   * @example "string"
   */
  category?: string | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Allow Comments
   * @example true
   */
  allowComments?: boolean | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Published At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  publishedAt?: string | null;
}

export interface ContentUpdateDtoChangeLogDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Object Type
   * @example "string"
   */
  objectType?: string;
  /**
   * Object Id
   * @format int32
   * @example 1
   */
  objectId?: number;
  /**
   * Entity State
   * @example "Detached"
   */
  entityState?: "Detached" | "Unchanged" | "Deleted" | "Modified" | "Added";
  data?: ContentUpdateDto;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Created By
   * @example "string"
   */
  createdBy?: string | null;
  /**
   * Updated By
   * @example "string"
   */
  updatedBy?: string | null;
}

export interface ContentWithStatisticsDto {
  /** Content */
  content?: ContentDetailsDto[];
  /** Statistics */
  statistics?: Record<string, number>;
}

export interface CoverImageEditRequest {
  /**
   * Cover Image Url
   * @minLength 1
   * @example "string"
   */
  coverImageUrl: string;
  /**
   * Content Title
   * @minLength 1
   * @example "string"
   */
  contentTitle: string;
  /**
   * Content Description
   * @minLength 1
   * @example "string"
   */
  contentDescription: string;
  /**
   * Prompt
   * @minLength 1
   * @example "string"
   */
  prompt: string;
  /**
   * Sample Image Paths
   * @maxItems 5
   */
  sampleImagePaths?: string[] | null;
}

export interface CoverImageGenerationRequest {
  /**
   * Content Title
   * @minLength 1
   * @example "string"
   */
  contentTitle: string;
  /**
   * Content Description
   * @minLength 1
   * @example "string"
   */
  contentDescription: string;
  /**
   * Content Slug
   * @minLength 1
   * @example "string"
   */
  contentSlug: string;
  /**
   * Prompt
   * @example "string"
   */
  prompt?: string | null;
  /**
   * Sample Image Paths
   * @maxItems 5
   */
  sampleImagePaths?: string[] | null;
}

export interface CrmMetricsDto {
  /**
   * Total Contacts
   * @format int64
   */
  totalContacts?: number;
  /**
   * Contacts Change Pct
   * @format double
   * @example 1
   */
  contactsChangePct?: number | null;
  /**
   * Total Accounts
   * @format int64
   */
  totalAccounts?: number;
  /**
   * Accounts Change Pct
   * @format double
   * @example 1
   */
  accountsChangePct?: number | null;
  /**
   * Paid Contacts
   * @format int64
   */
  paidContacts?: number;
  /**
   * Paid Contacts Change Pct
   * @format double
   * @example 1
   */
  paidContactsChangePct?: number | null;
  /**
   * Paid Accounts
   * @format int64
   */
  paidAccounts?: number;
  /**
   * Paid Accounts Change Pct
   * @format double
   * @example 1
   */
  paidAccountsChangePct?: number | null;
  /**
   * Total Orders
   * @format int64
   */
  totalOrders?: number;
  /**
   * Orders Change Pct
   * @format double
   * @example 1
   */
  ordersChangePct?: number | null;
  /**
   * Revenue
   * @format double
   * @example 1
   */
  revenue?: number;
  /**
   * Revenue Change Pct
   * @format double
   * @example 1
   */
  revenueChangePct?: number | null;
  /**
   * Total Refunds
   * @format double
   * @example 1
   */
  totalRefunds?: number;
  /**
   * Total Commissions
   * @format double
   * @example 1
   */
  totalCommissions?: number;
}

export interface CurrencyInfoDto {
  /**
   * Code
   * @example "string"
   */
  code?: string;
  /**
   * English Name
   * @example "string"
   */
  englishName?: string;
  /**
   * Native Name
   * @example "string"
   */
  nativeName?: string;
  /**
   * Symbol
   * @example "string"
   */
  symbol?: string;
  /**
   * Decimal Digits
   * @format int32
   * @example 1
   */
  decimalDigits?: number;
  /**
   * Decimal Separator
   * @example "string"
   */
  decimalSeparator?: string;
  /**
   * Group Separator
   * @example "string"
   */
  groupSeparator?: string;
  /**
   * Positive Pattern
   * @format int32
   * @example 1
   */
  positivePattern?: number;
  /**
   * Negative Pattern
   * @format int32
   * @example 1
   */
  negativePattern?: number;
  /**
   * Culture Name
   * @example "string"
   */
  cultureName?: string;
}

export interface DealCreateDto {
  /**
   * Account Id
   * @format int32
   * @example 1
   */
  accountId?: number | null;
  /**
   * Deal Pipeline Id
   * @format int32
   * @example 1
   */
  dealPipelineId: number;
  /**
   * Deal Value
   * @format double
   * @example 1
   */
  dealValue?: number | null;
  /**
   * Deal Currency
   * @pattern ^(NAD|ZAR|XAF|JPY|GHS|ETB|USD||AED|BHD|DJF|DZD|EGP|MAD|ERN|ILS|IQD|JOD|KMF|KWD|LBP|LYD|MAD|MRU|OMR|ILS|QAR|SAR|SDG|SOS|SSP|SYP|XAF|TND|YER|CLP|INR|TZS|EUR|AZN|AZN|RUB|XAF|BYN|ZMW|MAD|MAD|TZS|EUR|INR|INR|XOF|XOF|BDT|INR|CNY|INR|EUR|INR|BAM|BAM|RUB|ERN|EUR|EUR|EUR|EUR|BDT|INR|RUB|PHP|UGX|USD|USD|USD|IQD|IRR|EUR|CZK|CAD|RUB|GBP|DKK|DKK|KES|EUR|EUR|CHF|EUR|EUR|CHF|EUR|XOF|INR|EUR|XAF|MVR|XOF|BTN|KES|GHS|XOF|EUR|EUR|||AED|XCD|XCD|ALL|ARS|USD|EUR|AUD|BBD|BDT|EUR|EUR|BIF|BMD|BND|BRL|BSD|BWP|BZD|CAD|AUD|CHF|NZD|CLP|XAF|CNY|COP|CVE|AUD|EUR|CZK|EUR|USD|DKK|XCD|EUR|ERN|EUR|EUR|FJD|FKP|USD|EUR|GBP|XCD|GEL|GBP|GHS|GIP|GMD|EUR|GBP|USD|GYD|HKD|HUF|IDR|EUR|ILS|GBP|INR|USD|EUR|GBP|JMD|JPY|KES|AUD|XCD|KRW|KYD|XCD|LRD|ZAR|EUR|EUR|MGA|USD|MMK|MOP|USD|XCD|EUR|MUR|MVR|MWK|MXN|MYR|NAD|AUD|NGN|EUR|NOK|AUD|NZD|NZD|PGK|PHP|PKR|PLN|NZD|USD|EUR|USD|RON|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|EUR|EUR|SLE|SSP|XCG|SZL|USD|THB|NZD|TOP|TRY|TTD|AUD|TWD|TZS|UAH|UGX|USD|USD|USD|XCD|USD|USD|VUV|WST|ZAR|ZMW|ZWG||||XCD|ARS|BBD|BMD|BOB|USD|BRL|BSD|BZD|CAD|CLP|COP|CRC|CUP|XCG|XCD|DOP|EUR|USD|EUR|XCD|XAF|GTQ|GYD|HNL|HTG|EUR|XCD|KYD|XCD|MXN|NIO|PAB|PEN|PHP|USD|PYG|USD|USD|TTD|USD|UYU|XCD|VED|USD|USD|EUR|EUR|XAF|AFN|IRR|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|EUR|PHP|DKK|DKK|EUR|XOF|BIF|XOF|EUR|CAD|CDF|XAF|XAF|CHF|XOF|XAF|DJF|DZD|EUR|XAF|EUR|GNF|EUR|XAF|HTG|KMF|EUR|MAD|EUR|EUR|MGA|XOF|EUR|MRU|MUR|XPF|XOF|XPF|EUR|EUR|RWF|SCR|XOF|SYP|XAF|XOF|TND|VUV|XPF|EUR|EUR|EUR|GBP|EUR|GHS|GBP|ERN|ETB|EUR|PYG|CHF|EUR|CHF|INR|KES|GBP|GHS|XOF|NGN|USD|ILS|INR|INR|CNY|BAM|EUR|EUR|HTG|HUF|AMD||IDR|EUR|NGN|CNY||ISK|CHF|EUR|EUR|EUR|CAD|JPY||XAF|TZS|IDR|GEL|DZD|NGN|KES|NGN|TZS|CVE|BRL|XOF|KES|CNY|KZT|KZT|XAF|DKK|KES|KHR|INR|CNY|KPW|KRW|INR|INR|GNF|LRD|INR|INR|INR|TZS|XAF|EUR|IQD|SYP|TRY|TRY|GBP|INR|INR|INR|INR|KGS|TZS|EUR|UGX|EUR|USD|EUR|AOA|CDF|XAF|XAF|LAK|IQD|IRR|EUR|CDF|KES|KES|EUR|INR|KES|TZS|KES|MUR|MGA|MZN|XAF|NZD|CAD|IQD|MKD|INR|MNT|INR|INR|CAD|INR|BND|MYR|BND|IDR|MYR|SGD|EUR|XAF|USD|MMK|RUB|IRR|NAD|NOK|NOK|ZWG|EUR|EUR|INR|NPR|AWG|EUR|USD|XCG|EUR|SRD|XCG|XAF|NOK|XAF|INR|GNF|ZAR|ZAR|SSP|USD|MWK|UGX|EUR|EUR|ETB|KES|INR|GEL|RUB|USD|PKR|PKR|INR|NGN|PLN|EUR|CAD|PLN|AFN|PKR|AOA|BRL|CHF|CVE|EUR|XAF|XOF|EUR|MOP|MZN|EUR|STN|USD|BOB|USD|PEN|INR|IDR|IDR|BDT|MMK|CHF|BIF|MDL|RON|TZS|BYN|KGS|KZT|MDL|RUB|UAH|RWF|TZS|INR|RUB|KES|INR|INR|TZS|EUR|EUR|PKR|INR|EUR|NOK|SEK|MZN|XOF|XAF|MAD|MAD|MMK|THB|LKR|EUR|EUR|USD|WST|EUR|ZWG|DJF|ETB|KES|SOS|ALL|MKD|EUR|BAM|EUR|RSD|EUR|BAM|EUR|RSD|EUR|SZL|ZAR|ZAR|ZAR|IDR|EUR|EUR|SEK|CDF|KES|TZS|UGX|IQD|SYP|PLN|INR|LKR|MYR|SGD|INR|KES|UGX|TJS|THB|ERN|ETB|ERN|TMT|BWP|ZAR|TOP||EUR|TRY|TWD|ZAR|RUB|XOF|RUB|MAD|CNY|UAH|INR|PKR|INR|PKR|AFN|UZS|UZS|LRD|LRD|ZAR|EUR|VND|MZN|TZS|EUR|CHF|ETB|XOF|ZAR|INR|UGX|XAF|UAH|XOF|NGN|BRL|COP|VED|CNY|CNY|HKD|MOP|CNY|MAD|CNY|HKD|JPY|MOP|MYR|SGD|CNY|HKD|JPY|MOP|MYR|TWD|ZAR)$
   * @example "USD"
   */
  dealCurrency?: string | null;
  /**
   * Expected Close Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  expectedCloseDate?: string | null;
  /**
   * Actual Close Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  actualCloseDate?: string | null;
  /**
   * User Id
   * @minLength 1
   * @example "string"
   */
  userId: string;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Campaign Id
   * @format int32
   * @example 1
   */
  campaignId?: number | null;
  /**
   * Contact Ids
   * @uniqueItems true
   */
  contactIds?: number[];
}

export interface DealDetailsDto {
  /**
   * Account Id
   * @format int32
   * @example 1
   */
  accountId?: number | null;
  /**
   * Deal Pipeline Id
   * @format int32
   * @example 1
   */
  dealPipelineId: number;
  /**
   * Deal Value
   * @format double
   * @example 1
   */
  dealValue?: number | null;
  /**
   * Deal Currency
   * @pattern ^(NAD|ZAR|XAF|JPY|GHS|ETB|USD||AED|BHD|DJF|DZD|EGP|MAD|ERN|ILS|IQD|JOD|KMF|KWD|LBP|LYD|MAD|MRU|OMR|ILS|QAR|SAR|SDG|SOS|SSP|SYP|XAF|TND|YER|CLP|INR|TZS|EUR|AZN|AZN|RUB|XAF|BYN|ZMW|MAD|MAD|TZS|EUR|INR|INR|XOF|XOF|BDT|INR|CNY|INR|EUR|INR|BAM|BAM|RUB|ERN|EUR|EUR|EUR|EUR|BDT|INR|RUB|PHP|UGX|USD|USD|USD|IQD|IRR|EUR|CZK|CAD|RUB|GBP|DKK|DKK|KES|EUR|EUR|CHF|EUR|EUR|CHF|EUR|XOF|INR|EUR|XAF|MVR|XOF|BTN|KES|GHS|XOF|EUR|EUR|||AED|XCD|XCD|ALL|ARS|USD|EUR|AUD|BBD|BDT|EUR|EUR|BIF|BMD|BND|BRL|BSD|BWP|BZD|CAD|AUD|CHF|NZD|CLP|XAF|CNY|COP|CVE|AUD|EUR|CZK|EUR|USD|DKK|XCD|EUR|ERN|EUR|EUR|FJD|FKP|USD|EUR|GBP|XCD|GEL|GBP|GHS|GIP|GMD|EUR|GBP|USD|GYD|HKD|HUF|IDR|EUR|ILS|GBP|INR|USD|EUR|GBP|JMD|JPY|KES|AUD|XCD|KRW|KYD|XCD|LRD|ZAR|EUR|EUR|MGA|USD|MMK|MOP|USD|XCD|EUR|MUR|MVR|MWK|MXN|MYR|NAD|AUD|NGN|EUR|NOK|AUD|NZD|NZD|PGK|PHP|PKR|PLN|NZD|USD|EUR|USD|RON|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|EUR|EUR|SLE|SSP|XCG|SZL|USD|THB|NZD|TOP|TRY|TTD|AUD|TWD|TZS|UAH|UGX|USD|USD|USD|XCD|USD|USD|VUV|WST|ZAR|ZMW|ZWG||||XCD|ARS|BBD|BMD|BOB|USD|BRL|BSD|BZD|CAD|CLP|COP|CRC|CUP|XCG|XCD|DOP|EUR|USD|EUR|XCD|XAF|GTQ|GYD|HNL|HTG|EUR|XCD|KYD|XCD|MXN|NIO|PAB|PEN|PHP|USD|PYG|USD|USD|TTD|USD|UYU|XCD|VED|USD|USD|EUR|EUR|XAF|AFN|IRR|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|EUR|PHP|DKK|DKK|EUR|XOF|BIF|XOF|EUR|CAD|CDF|XAF|XAF|CHF|XOF|XAF|DJF|DZD|EUR|XAF|EUR|GNF|EUR|XAF|HTG|KMF|EUR|MAD|EUR|EUR|MGA|XOF|EUR|MRU|MUR|XPF|XOF|XPF|EUR|EUR|RWF|SCR|XOF|SYP|XAF|XOF|TND|VUV|XPF|EUR|EUR|EUR|GBP|EUR|GHS|GBP|ERN|ETB|EUR|PYG|CHF|EUR|CHF|INR|KES|GBP|GHS|XOF|NGN|USD|ILS|INR|INR|CNY|BAM|EUR|EUR|HTG|HUF|AMD||IDR|EUR|NGN|CNY||ISK|CHF|EUR|EUR|EUR|CAD|JPY||XAF|TZS|IDR|GEL|DZD|NGN|KES|NGN|TZS|CVE|BRL|XOF|KES|CNY|KZT|KZT|XAF|DKK|KES|KHR|INR|CNY|KPW|KRW|INR|INR|GNF|LRD|INR|INR|INR|TZS|XAF|EUR|IQD|SYP|TRY|TRY|GBP|INR|INR|INR|INR|KGS|TZS|EUR|UGX|EUR|USD|EUR|AOA|CDF|XAF|XAF|LAK|IQD|IRR|EUR|CDF|KES|KES|EUR|INR|KES|TZS|KES|MUR|MGA|MZN|XAF|NZD|CAD|IQD|MKD|INR|MNT|INR|INR|CAD|INR|BND|MYR|BND|IDR|MYR|SGD|EUR|XAF|USD|MMK|RUB|IRR|NAD|NOK|NOK|ZWG|EUR|EUR|INR|NPR|AWG|EUR|USD|XCG|EUR|SRD|XCG|XAF|NOK|XAF|INR|GNF|ZAR|ZAR|SSP|USD|MWK|UGX|EUR|EUR|ETB|KES|INR|GEL|RUB|USD|PKR|PKR|INR|NGN|PLN|EUR|CAD|PLN|AFN|PKR|AOA|BRL|CHF|CVE|EUR|XAF|XOF|EUR|MOP|MZN|EUR|STN|USD|BOB|USD|PEN|INR|IDR|IDR|BDT|MMK|CHF|BIF|MDL|RON|TZS|BYN|KGS|KZT|MDL|RUB|UAH|RWF|TZS|INR|RUB|KES|INR|INR|TZS|EUR|EUR|PKR|INR|EUR|NOK|SEK|MZN|XOF|XAF|MAD|MAD|MMK|THB|LKR|EUR|EUR|USD|WST|EUR|ZWG|DJF|ETB|KES|SOS|ALL|MKD|EUR|BAM|EUR|RSD|EUR|BAM|EUR|RSD|EUR|SZL|ZAR|ZAR|ZAR|IDR|EUR|EUR|SEK|CDF|KES|TZS|UGX|IQD|SYP|PLN|INR|LKR|MYR|SGD|INR|KES|UGX|TJS|THB|ERN|ETB|ERN|TMT|BWP|ZAR|TOP||EUR|TRY|TWD|ZAR|RUB|XOF|RUB|MAD|CNY|UAH|INR|PKR|INR|PKR|AFN|UZS|UZS|LRD|LRD|ZAR|EUR|VND|MZN|TZS|EUR|CHF|ETB|XOF|ZAR|INR|UGX|XAF|UAH|XOF|NGN|BRL|COP|VED|CNY|CNY|HKD|MOP|CNY|MAD|CNY|HKD|JPY|MOP|MYR|SGD|CNY|HKD|JPY|MOP|MYR|TWD|ZAR)$
   * @example "USD"
   */
  dealCurrency?: string | null;
  /**
   * Expected Close Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  expectedCloseDate?: string | null;
  /**
   * Actual Close Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  actualCloseDate?: string | null;
  /**
   * User Id
   * @minLength 1
   * @example "string"
   */
  userId: string;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Campaign Id
   * @format int32
   * @example 1
   */
  campaignId?: number | null;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  account?: AccountDetailsDto;
  dealPipeline?: DealPipelineDetailsDto;
  pipelineStage?: DealPipelineStageDetailsDto;
  /** Contacts */
  contacts?: ContactDetailsDto[] | null;
}

export interface DealDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: DealDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, DealDetailsDto>;
}

export interface DealPipelineCreateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
}

export interface DealPipelineDetailsDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /** Pipeline Stages */
  pipelineStages?: DealPipelineStageDetailsDto[] | null;
}

export interface DealPipelineDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: DealPipelineDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, DealPipelineDetailsDto>;
}

export interface DealPipelineStageCreateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Deal Pipeline Id
   * @format int32
   * @example 1
   */
  dealPipelineId: number;
  /**
   * Order
   * @format int32
   * @example 1
   */
  order: number;
}

export interface DealPipelineStageDetailsDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Deal Pipeline Id
   * @format int32
   * @example 1
   */
  dealPipelineId: number;
  /**
   * Order
   * @format int32
   * @example 1
   */
  order: number;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  dealPipeline?: DealPipelineDetailsDto;
}

export interface DealPipelineStageDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: DealPipelineStageDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, DealPipelineStageDetailsDto>;
}

export interface DealPipelineStageUpdateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name?: string | null;
  /**
   * Order
   * @format int32
   * @example 1
   */
  order?: number | null;
}

export interface DealPipelineUpdateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
}

export interface DealUpdateDto {
  /**
   * Account Id
   * @format int32
   * @example 1
   */
  accountId?: number | null;
  /**
   * Deal Pipeline Id
   * @format int32
   * @example 1
   */
  dealPipelineId?: number | null;
  /**
   * Contact Ids
   * @uniqueItems true
   */
  contactIds?: number[] | null;
  /**
   * Deal Value
   * @format double
   * @example 1
   */
  dealValue?: number | null;
  /**
   * Deal Currency
   * @minLength 1
   * @pattern ^(NAD|ZAR|XAF|JPY|GHS|ETB|USD||AED|BHD|DJF|DZD|EGP|MAD|ERN|ILS|IQD|JOD|KMF|KWD|LBP|LYD|MAD|MRU|OMR|ILS|QAR|SAR|SDG|SOS|SSP|SYP|XAF|TND|YER|CLP|INR|TZS|EUR|AZN|AZN|RUB|XAF|BYN|ZMW|MAD|MAD|TZS|EUR|INR|INR|XOF|XOF|BDT|INR|CNY|INR|EUR|INR|BAM|BAM|RUB|ERN|EUR|EUR|EUR|EUR|BDT|INR|RUB|PHP|UGX|USD|USD|USD|IQD|IRR|EUR|CZK|CAD|RUB|GBP|DKK|DKK|KES|EUR|EUR|CHF|EUR|EUR|CHF|EUR|XOF|INR|EUR|XAF|MVR|XOF|BTN|KES|GHS|XOF|EUR|EUR|||AED|XCD|XCD|ALL|ARS|USD|EUR|AUD|BBD|BDT|EUR|EUR|BIF|BMD|BND|BRL|BSD|BWP|BZD|CAD|AUD|CHF|NZD|CLP|XAF|CNY|COP|CVE|AUD|EUR|CZK|EUR|USD|DKK|XCD|EUR|ERN|EUR|EUR|FJD|FKP|USD|EUR|GBP|XCD|GEL|GBP|GHS|GIP|GMD|EUR|GBP|USD|GYD|HKD|HUF|IDR|EUR|ILS|GBP|INR|USD|EUR|GBP|JMD|JPY|KES|AUD|XCD|KRW|KYD|XCD|LRD|ZAR|EUR|EUR|MGA|USD|MMK|MOP|USD|XCD|EUR|MUR|MVR|MWK|MXN|MYR|NAD|AUD|NGN|EUR|NOK|AUD|NZD|NZD|PGK|PHP|PKR|PLN|NZD|USD|EUR|USD|RON|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|EUR|EUR|SLE|SSP|XCG|SZL|USD|THB|NZD|TOP|TRY|TTD|AUD|TWD|TZS|UAH|UGX|USD|USD|USD|XCD|USD|USD|VUV|WST|ZAR|ZMW|ZWG||||XCD|ARS|BBD|BMD|BOB|USD|BRL|BSD|BZD|CAD|CLP|COP|CRC|CUP|XCG|XCD|DOP|EUR|USD|EUR|XCD|XAF|GTQ|GYD|HNL|HTG|EUR|XCD|KYD|XCD|MXN|NIO|PAB|PEN|PHP|USD|PYG|USD|USD|TTD|USD|UYU|XCD|VED|USD|USD|EUR|EUR|XAF|AFN|IRR|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|EUR|PHP|DKK|DKK|EUR|XOF|BIF|XOF|EUR|CAD|CDF|XAF|XAF|CHF|XOF|XAF|DJF|DZD|EUR|XAF|EUR|GNF|EUR|XAF|HTG|KMF|EUR|MAD|EUR|EUR|MGA|XOF|EUR|MRU|MUR|XPF|XOF|XPF|EUR|EUR|RWF|SCR|XOF|SYP|XAF|XOF|TND|VUV|XPF|EUR|EUR|EUR|GBP|EUR|GHS|GBP|ERN|ETB|EUR|PYG|CHF|EUR|CHF|INR|KES|GBP|GHS|XOF|NGN|USD|ILS|INR|INR|CNY|BAM|EUR|EUR|HTG|HUF|AMD||IDR|EUR|NGN|CNY||ISK|CHF|EUR|EUR|EUR|CAD|JPY||XAF|TZS|IDR|GEL|DZD|NGN|KES|NGN|TZS|CVE|BRL|XOF|KES|CNY|KZT|KZT|XAF|DKK|KES|KHR|INR|CNY|KPW|KRW|INR|INR|GNF|LRD|INR|INR|INR|TZS|XAF|EUR|IQD|SYP|TRY|TRY|GBP|INR|INR|INR|INR|KGS|TZS|EUR|UGX|EUR|USD|EUR|AOA|CDF|XAF|XAF|LAK|IQD|IRR|EUR|CDF|KES|KES|EUR|INR|KES|TZS|KES|MUR|MGA|MZN|XAF|NZD|CAD|IQD|MKD|INR|MNT|INR|INR|CAD|INR|BND|MYR|BND|IDR|MYR|SGD|EUR|XAF|USD|MMK|RUB|IRR|NAD|NOK|NOK|ZWG|EUR|EUR|INR|NPR|AWG|EUR|USD|XCG|EUR|SRD|XCG|XAF|NOK|XAF|INR|GNF|ZAR|ZAR|SSP|USD|MWK|UGX|EUR|EUR|ETB|KES|INR|GEL|RUB|USD|PKR|PKR|INR|NGN|PLN|EUR|CAD|PLN|AFN|PKR|AOA|BRL|CHF|CVE|EUR|XAF|XOF|EUR|MOP|MZN|EUR|STN|USD|BOB|USD|PEN|INR|IDR|IDR|BDT|MMK|CHF|BIF|MDL|RON|TZS|BYN|KGS|KZT|MDL|RUB|UAH|RWF|TZS|INR|RUB|KES|INR|INR|TZS|EUR|EUR|PKR|INR|EUR|NOK|SEK|MZN|XOF|XAF|MAD|MAD|MMK|THB|LKR|EUR|EUR|USD|WST|EUR|ZWG|DJF|ETB|KES|SOS|ALL|MKD|EUR|BAM|EUR|RSD|EUR|BAM|EUR|RSD|EUR|SZL|ZAR|ZAR|ZAR|IDR|EUR|EUR|SEK|CDF|KES|TZS|UGX|IQD|SYP|PLN|INR|LKR|MYR|SGD|INR|KES|UGX|TJS|THB|ERN|ETB|ERN|TMT|BWP|ZAR|TOP||EUR|TRY|TWD|ZAR|RUB|XOF|RUB|MAD|CNY|UAH|INR|PKR|INR|PKR|AFN|UZS|UZS|LRD|LRD|ZAR|EUR|VND|MZN|TZS|EUR|CHF|ETB|XOF|ZAR|INR|UGX|XAF|UAH|XOF|NGN|BRL|COP|VED|CNY|CNY|HKD|MOP|CNY|MAD|CNY|HKD|JPY|MOP|MYR|SGD|CNY|HKD|JPY|MOP|MYR|TWD|ZAR)$
   * @example "USD"
   */
  dealCurrency?: string | null;
  /**
   * Expected Close Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  expectedCloseDate?: string | null;
  /**
   * Actual Close Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  actualCloseDate?: string | null;
  /**
   * User Id
   * @example "string"
   */
  userId?: string | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Campaign Id
   * @format int32
   * @example 1
   */
  campaignId?: number | null;
}

export interface DeploymentDetailsDto {
  /**
   * Id
   * @example "string"
   */
  id?: string;
  /**
   * Target Id
   * @example "string"
   */
  targetId?: string;
  /**
   * Target Name
   * @example "string"
   */
  targetName?: string;
  /**
   * Resource
   * @example "string"
   */
  resource?: string | null;
  /**
   * Status
   * @example "Pending"
   */
  status?: "Pending" | "InProgress" | "Completed" | "Failed" | "Cancelled";
  /**
   * Started At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  startedAt?: string;
  /**
   * Completed At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  completedAt?: string | null;
  duration?: TimeSpan;
  /**
   * Triggered By Id
   * @example "string"
   */
  triggeredById?: string | null;
  /**
   * Triggered By Name
   * @example "string"
   */
  triggeredByName?: string | null;
  /** Steps */
  steps?: DeploymentStepDto[] | null;
  /** Logs */
  logs?: string[] | null;
  /**
   * Error Message
   * @example "string"
   */
  errorMessage?: string | null;
}

export interface DeploymentRecordDto {
  /**
   * Id
   * @example "string"
   */
  id?: string;
  /**
   * Target Id
   * @example "string"
   */
  targetId?: string;
  /**
   * Target Name
   * @example "string"
   */
  targetName?: string;
  /**
   * Resource
   * @example "string"
   */
  resource?: string | null;
  /**
   * Status
   * @example "Pending"
   */
  status?: "Pending" | "InProgress" | "Completed" | "Failed" | "Cancelled";
  /**
   * Started At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  startedAt?: string;
  /**
   * Completed At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  completedAt?: string | null;
  duration?: TimeSpan;
  /**
   * Triggered By Id
   * @example "string"
   */
  triggeredById?: string | null;
  /**
   * Triggered By Name
   * @example "string"
   */
  triggeredByName?: string | null;
}

export interface DeploymentStatsDto {
  /**
   * Total Deployments
   * @format int32
   * @example 1
   */
  totalDeployments?: number;
  /**
   * Successful Deployments
   * @format int32
   * @example 1
   */
  successfulDeployments?: number;
  /**
   * Failed Deployments
   * @format int32
   * @example 1
   */
  failedDeployments?: number;
  /**
   * Pending Deployments
   * @format int32
   * @example 1
   */
  pendingDeployments?: number;
  /**
   * In Progress Deployments
   * @format int32
   * @example 1
   */
  inProgressDeployments?: number;
  /**
   * Success Rate
   * @format double
   * @example 1
   */
  successRate?: number;
  averageDuration?: TimeSpan;
}

export interface DeploymentStepDto {
  /**
   * Id
   * @example "string"
   */
  id?: string | null;
  /**
   * Name
   * @example "string"
   */
  name?: string;
  /**
   * Status
   * @example "Pending"
   */
  status?: "Pending" | "InProgress" | "Completed" | "Failed" | "Cancelled";
  /**
   * Started At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  startedAt?: string | null;
  /**
   * Completed At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  completedAt?: string | null;
  duration?: TimeSpan;
  /**
   * Url
   * @example "string"
   */
  url?: string | null;
  /**
   * Logs Url
   * @example "string"
   */
  logsUrl?: string | null;
}

export interface DeploymentTargetDto {
  /**
   * Id
   * @example "string"
   */
  id?: string;
  /**
   * Name
   * @example "string"
   */
  name?: string;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Provider
   * @example "string"
   */
  provider?: string;
  /**
   * Resource
   * @example "string"
   */
  resource?: string | null;
}

export interface DeploymentTriggerRequestDto {
  /** Target Ids */
  targetIds?: string[] | null;
  /**
   * Trigger All
   * @example true
   */
  triggerAll?: boolean;
}

export interface DeploymentTriggerResultDto {
  /**
   * Success
   * @example true
   */
  success?: boolean;
  /**
   * Message
   * @example "string"
   */
  message?: string | null;
  /** Triggered Deployment Ids */
  triggeredDeploymentIds?: string[];
  /** Errors */
  errors?: string[] | null;
}

export interface DeviceAuthInitiateDto {
  /**
   * Device Code
   * @minLength 1
   * @example "string"
   */
  deviceCode: string;
  /**
   * User Code
   * @minLength 1
   * @example "string"
   */
  userCode: string;
  /**
   * Verification Uri
   * @minLength 1
   * @example "string"
   */
  verificationUri: string;
  /**
   * Verification Uri Complete
   * @minLength 1
   * @example "string"
   */
  verificationUriComplete: string;
  /**
   * Expires In
   * @format int32
   * @example 1
   */
  expiresIn: number;
  /**
   * Interval
   * @format int32
   * @example 1
   */
  interval: number;
}

export interface DeviceAuthPollDto {
  /**
   * Device Code
   * @minLength 1
   * @example "string"
   */
  deviceCode: string;
}

export interface DeviceAuthVerificationDto {
  /**
   * User Code
   * @minLength 1
   * @example "string"
   */
  userCode: string;
}

export interface DnsRecord {
  /**
   * Domain Name
   * @example "string"
   */
  domainName?: string;
  /**
   * Record Class
   * @example "string"
   */
  recordClass?: string;
  /**
   * Record Type
   * @example "string"
   */
  recordType?: string;
  /**
   * Time To Live
   * @format int32
   * @example 1
   */
  timeToLive?: number;
  /**
   * Value
   * @example "string"
   */
  value?: string;
}

export interface DomainCreateDto {
  /**
   * Name
   * @minLength 1
   * @example "example.com"
   */
  name: string;
  /**
   * Title
   * @example "string"
   */
  title?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Url
   * @example "https://example.com"
   */
  url?: string | null;
  /**
   * Favicon Url
   * @example "https://example.com/favicon.ico"
   */
  faviconUrl?: string | null;
  /**
   * Http Check
   * @example true
   */
  httpCheck?: boolean | null;
  /**
   * Free
   * @example true
   */
  free?: boolean | null;
  /**
   * Disposable
   * @example true
   */
  disposable?: boolean | null;
  /**
   * Catch All
   * @example true
   */
  catchAll?: boolean | null;
  /** Dns Records */
  dnsRecords?: DnsRecord[] | null;
  /**
   * Dns Check
   * @example true
   */
  dnsCheck?: boolean | null;
  /**
   * Mx Check
   * @example true
   */
  mxCheck?: boolean | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
}

export interface DomainDetailsDto {
  /**
   * Name
   * @minLength 1
   * @example "example.com"
   */
  name: string;
  /**
   * Title
   * @example "string"
   */
  title?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Url
   * @example "https://example.com"
   */
  url?: string | null;
  /**
   * Favicon Url
   * @example "https://example.com/favicon.ico"
   */
  faviconUrl?: string | null;
  /**
   * Http Check
   * @example true
   */
  httpCheck?: boolean | null;
  /**
   * Free
   * @example true
   */
  free?: boolean | null;
  /**
   * Disposable
   * @example true
   */
  disposable?: boolean | null;
  /**
   * Catch All
   * @example true
   */
  catchAll?: boolean | null;
  /** Dns Records */
  dnsRecords?: DnsRecord[] | null;
  /**
   * Dns Check
   * @example true
   */
  dnsCheck?: boolean | null;
  /**
   * Mx Check
   * @example true
   */
  mxCheck?: boolean | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Contact Count
   * @format int32
   * @example 1
   */
  contactCount?: number;
  account?: AccountDetailsDto;
  /** Contacts */
  contacts?: ContactDetailsDto[] | null;
}

export interface DomainDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: DomainDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, DomainDetailsDto>;
}

export interface DomainImportDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string | null;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Title
   * @example "string"
   */
  title?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Url
   * @example "https://example.com"
   */
  url?: string | null;
  /**
   * Favicon Url
   * @example "https://example.com/favicon.ico"
   */
  faviconUrl?: string | null;
  /**
   * Http Check
   * @example true
   */
  httpCheck?: boolean | null;
  /**
   * Free
   * @example true
   */
  free?: boolean | null;
  /**
   * Disposable
   * @example true
   */
  disposable?: boolean | null;
  /**
   * Catch All
   * @example true
   */
  catchAll?: boolean | null;
  /** Dns Records */
  dnsRecords?: DnsRecord[] | null;
  /**
   * Dns Check
   * @example true
   */
  dnsCheck?: boolean | null;
  /**
   * Mx Check
   * @example true
   */
  mxCheck?: boolean | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
}

export interface DomainUpdateDto {
  /**
   * Title
   * @example "string"
   */
  title?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Url
   * @example "https://example.com"
   */
  url?: string | null;
  /**
   * Favicon Url
   * @example "https://example.com/favicon.ico"
   */
  faviconUrl?: string | null;
  /**
   * Free
   * @example true
   */
  free?: boolean | null;
  /**
   * Disposable
   * @example true
   */
  disposable?: boolean | null;
  /**
   * Catch All
   * @example true
   */
  catchAll?: boolean | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
}

export interface DtoSchema {
  /**
   * Type
   * @minLength 1
   * @example "string"
   */
  type: string;
  /** Properties */
  properties: Record<string, any>;
  /** Required */
  required: string[];
}

export interface DynamicApiFnDto {
  /**
   * Endpoint
   * @minLength 1
   * @example "string"
   */
  endpoint: string;
  /**
   * Method
   * @minLength 1
   * @example "string"
   */
  method: string;
}

export interface DynamicExtraActionsDto {
  export?: ExportActionDto;
  import?: ImportActionDto;
  /**
   * Show Columns Panel
   * @example true
   */
  showColumnsPanel?: boolean | null;
  /**
   * Show Filters Panel
   * @example true
   */
  showFiltersPanel?: boolean | null;
}

export interface DynamicFormFnsDto {
  getItemFn?: DynamicApiFnDto;
  createItemFn?: DynamicApiFnDto;
  updateItemFn?: DynamicApiFnDto;
  deleteItemFn?: DynamicApiFnDto;
}

export interface DynamicModuleDto {
  /**
   * Module Name
   * @minLength 1
   * @example "string"
   */
  moduleName: string;
  /**
   * Module Path
   * @minLength 1
   * @example "string"
   */
  modulePath: string;
  /**
   * Add Button Content
   * @example "string"
   */
  addButtonContent?: string | null;
  schemas?: DynamicSchemasDto;
  formFns?: DynamicFormFnsDto;
  tableProps?: DynamicTablePropsDto;
  extraActions?: DynamicExtraActionsDto;
}

export interface DynamicSchemasDto {
  details?: DtoSchema;
  update?: DtoSchema;
  create?: DtoSchema;
}

export interface DynamicTablePropsDto {
  /**
   * Key
   * @minLength 1
   * @example "string"
   */
  key: string;
  getItemsFn: DynamicApiFnDto;
  schema?: DtoSchema;
  /** Initially Shown Columns */
  initiallyShownColumns?: string[];
}

export interface EmailGroupCreateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language: string;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
}

export interface EmailGroupDetailsDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language: string;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /** Email Templates */
  emailTemplates?: EmailTemplateDetailsDto[] | null;
}

export interface EmailGroupDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: EmailGroupDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, EmailGroupDetailsDto>;
}

export interface EmailGroupUpdateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name?: string | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
}

export interface EmailTemplateCreateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Subject
   * @minLength 1
   * @example "string"
   */
  subject: string;
  /**
   * Body Template
   * @minLength 1
   * @example "string"
   */
  bodyTemplate: string;
  /**
   * Category
   * @example "General"
   */
  category?:
    | "General"
    | "PlainText"
    | "SimpleProfessional"
    | "Newsletter"
    | "Promotional"
    | "Transactional"
    | "Lifecycle"
    | "Digest"
    | "Event"
    | "Alert";
  /**
   * From Email
   * @format email
   * @minLength 1
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  fromEmail: string;
  /**
   * From Name
   * @minLength 1
   * @example "string"
   */
  fromName: string;
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language: string;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Attachments
   * @example ["string1","string2"]
   */
  attachments?: string[];
  /**
   * Email Group Id
   * @format int32
   * @example 1
   */
  emailGroupId: number;
}

export interface EmailTemplateDetailsDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Subject
   * @minLength 1
   * @example "string"
   */
  subject: string;
  /**
   * Body Template
   * @minLength 1
   * @example "string"
   */
  bodyTemplate: string;
  /**
   * Category
   * @example "General"
   */
  category?:
    | "General"
    | "PlainText"
    | "SimpleProfessional"
    | "Newsletter"
    | "Promotional"
    | "Transactional"
    | "Lifecycle"
    | "Digest"
    | "Event"
    | "Alert";
  /**
   * From Email
   * @format email
   * @minLength 1
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  fromEmail: string;
  /**
   * From Name
   * @minLength 1
   * @example "string"
   */
  fromName: string;
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language: string;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Attachments
   * @example ["string1","string2"]
   */
  attachments?: string[];
  /**
   * Email Group Id
   * @format int32
   * @example 1
   */
  emailGroupId: number;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  emailGroup?: EmailGroupDetailsDto;
}

export interface EmailTemplateDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: EmailTemplateDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, EmailTemplateDetailsDto>;
}

export interface EmailTemplateEditRequest {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name?: string | null;
  /**
   * Subject
   * @minLength 1
   * @example "string"
   */
  subject?: string | null;
  /**
   * Body Template
   * @minLength 1
   * @example "string"
   */
  bodyTemplate?: string | null;
  /**
   * Category
   * @example "General"
   */
  category?:
    | "General"
    | "PlainText"
    | "SimpleProfessional"
    | "Newsletter"
    | "Promotional"
    | "Transactional"
    | "Lifecycle"
    | "Digest"
    | "Event"
    | "Alert"
    | null;
  /**
   * From Email
   * @format email
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  fromEmail?: string | null;
  /**
   * From Name
   * @minLength 1
   * @example "string"
   */
  fromName?: string | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Attachments
   * @example ["string1","string2"]
   */
  attachments?: string[] | null;
  /**
   * Email Group Id
   * @format int32
   * @example 1
   */
  emailGroupId?: number | null;
  /**
   * Prompt
   * @minLength 1
   * @example "string"
   */
  prompt: string;
  /**
   * Reference Email Template Id
   * @format int32
   * @example 1
   */
  referenceEmailTemplateId?: number | null;
  /**
   * Template Variables
   * @example {"key1":"value1","key2":"value2"}
   */
  templateVariables?: Record<string, string>;
}

export interface EmailTemplateGenerationRequest {
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language: string;
  /**
   * Email Group Id
   * @format int32
   * @min 1
   * @max 2147483647
   * @example 1
   */
  emailGroupId: number;
  /**
   * Prompt
   * @minLength 1
   * @example "string"
   */
  prompt: string;
  /**
   * Category
   * @example "General"
   */
  category?:
    | "General"
    | "PlainText"
    | "SimpleProfessional"
    | "Newsletter"
    | "Promotional"
    | "Transactional"
    | "Lifecycle"
    | "Digest"
    | "Event"
    | "Alert"
    | null;
  /**
   * Reference Email Template Id
   * @format int32
   * @example 1
   */
  referenceEmailTemplateId?: number | null;
  /**
   * Template Variables
   * @example {"key1":"value1","key2":"value2"}
   */
  templateVariables?: Record<string, string>;
}

export interface EmailTemplatePreviewRequestDto {
  /**
   * Subject
   * @minLength 1
   * @example "string"
   */
  subject: string;
  /**
   * Body Template
   * @minLength 1
   * @example "string"
   */
  bodyTemplate: string;
  /**
   * From Email
   * @format email
   * @minLength 1
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  fromEmail: string;
  /**
   * From Name
   * @minLength 1
   * @example "string"
   */
  fromName: string;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Contact Type
   * @example "Full"
   */
  contactType?: "Full" | "Standard" | "Basic" | "Minimal" | null;
  /** Custom Template Parameters */
  customTemplateParameters?: Record<string, any>;
  utmParameters?: Utms;
}

export interface EmailTemplatePreviewResultDto {
  /**
   * Rendered Subject
   * @example "string"
   */
  renderedSubject?: string;
  /**
   * Rendered Body
   * @example "string"
   */
  renderedBody?: string;
  /**
   * From Email
   * @example "string"
   */
  fromEmail?: string;
  /**
   * From Name
   * @example "string"
   */
  fromName?: string;
  /**
   * Preview Contact Id
   * @format int32
   * @example 1
   */
  previewContactId?: number;
  /**
   * Preview Contact Name
   * @example "string"
   */
  previewContactName?: string;
  /**
   * Preview Contact Email
   * @example "string"
   */
  previewContactEmail?: string;
}

export interface EmailTemplateSendTestDto {
  /**
   * Subject
   * @minLength 1
   * @example "string"
   */
  subject: string;
  /**
   * Body Template
   * @minLength 1
   * @example "string"
   */
  bodyTemplate: string;
  /**
   * From Email
   * @format email
   * @minLength 1
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  fromEmail: string;
  /**
   * From Name
   * @minLength 1
   * @example "string"
   */
  fromName: string;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Contact Type
   * @example "Full"
   */
  contactType?: "Full" | "Standard" | "Basic" | "Minimal" | null;
  /** Custom Template Parameters */
  customTemplateParameters?: Record<string, any>;
  /**
   * Recipient Email
   * @format email
   * @minLength 1
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  recipientEmail: string;
}

export interface EmailTemplateUpdateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name?: string | null;
  /**
   * Subject
   * @minLength 1
   * @example "string"
   */
  subject?: string | null;
  /**
   * Body Template
   * @minLength 1
   * @example "string"
   */
  bodyTemplate?: string | null;
  /**
   * Category
   * @example "General"
   */
  category?:
    | "General"
    | "PlainText"
    | "SimpleProfessional"
    | "Newsletter"
    | "Promotional"
    | "Transactional"
    | "Lifecycle"
    | "Digest"
    | "Event"
    | "Alert"
    | null;
  /**
   * From Email
   * @format email
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  fromEmail?: string | null;
  /**
   * From Name
   * @minLength 1
   * @example "string"
   */
  fromName?: string | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Translation Key
   * @example "string"
   */
  translationKey?: string | null;
  /**
   * Attachments
   * @example ["string1","string2"]
   */
  attachments?: string[] | null;
  /**
   * Email Group Id
   * @format int32
   * @example 1
   */
  emailGroupId?: number | null;
}

export interface EmailTemplateUpdateDtoChangeLogDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Object Type
   * @example "string"
   */
  objectType?: string;
  /**
   * Object Id
   * @format int32
   * @example 1
   */
  objectId?: number;
  /**
   * Entity State
   * @example "Detached"
   */
  entityState?: "Detached" | "Unchanged" | "Deleted" | "Modified" | "Added";
  data?: EmailTemplateUpdateDto;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Created By
   * @example "string"
   */
  createdBy?: string | null;
  /**
   * Updated By
   * @example "string"
   */
  updatedBy?: string | null;
}

export interface EnrollmentStepTimelineEntryDto {
  /**
   * Step Id
   * @format int32
   * @example 1
   */
  stepId?: number;
  /**
   * Name
   * @example "string"
   */
  name?: string;
  /**
   * Position
   * @format int32
   * @example 1
   */
  position?: number;
  /**
   * Email Template Id
   * @format int32
   * @example 1
   */
  emailTemplateId?: number;
  timing?: SequenceStepTiming;
  /**
   * Status
   * @example "Sent"
   */
  status?: "Sent" | "Scheduled" | "Planned" | "Failed" | "Skipped";
  /**
   * Sent At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  sentAt?: string | null;
  /**
   * Scheduled At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  scheduledAt?: string | null;
  /**
   * Delivery Id
   * @format int32
   * @example 1
   */
  deliveryId?: number | null;
  /**
   * Email Log Id
   * @format int32
   * @example 1
   */
  emailLogId?: number | null;
  /**
   * Skip Reason
   * @example "string"
   */
  skipReason?: string | null;
  /**
   * Error Message
   * @example "string"
   */
  errorMessage?: string | null;
  emailPreview?: StepEmailPreviewDto;
}

export interface ExportActionDto {
  /**
   * Show Button
   * @example true
   */
  showButton: boolean;
  exportItemsFn: DynamicApiFnDto;
}

export interface FileDetailsDto {
  /**
   * Location
   * @example "string"
   */
  location?: string;
}

export interface ForgotPasswordDto {
  /**
   * Email
   * @format email
   * @minLength 1
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  email: string;
  /**
   * Language
   * @example "string"
   */
  language?: string;
}

export interface ImportActionDto {
  /**
   * Show Button
   * @example true
   */
  showButton: boolean;
  importSchema: DtoSchema;
  importItemsFn: DynamicApiFnDto;
}

export interface ImportError {
  /**
   * Row
   * @format int32
   * @example 1
   */
  row?: number;
  /**
   * Message
   * @example "string"
   */
  message?: string;
}

export interface ImportResult {
  /**
   * Added
   * @format int32
   * @example 1
   */
  added?: number;
  /**
   * Updated
   * @format int32
   * @example 1
   */
  updated?: number;
  /**
   * Failed
   * @format int32
   * @example 1
   */
  failed?: number;
  /**
   * Skipped
   * @format int32
   * @example 1
   */
  skipped?: number;
  /** Errors */
  errors?: ImportError[] | null;
}

export interface JWTokenDto {
  /**
   * Token
   * @minLength 1
   * @example "string"
   */
  token: string;
  /**
   * Expiration
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  expiration: string;
}

export interface LanguageDto {
  /**
   * Code
   * @example "string"
   */
  code?: string;
  /**
   * Name
   * @example "string"
   */
  name?: string;
}

export interface LinkCreateDto {
  /**
   * Uid
   * @example "string"
   */
  uid?: string | null;
  /**
   * Destination
   * @minLength 1
   * @example "string"
   */
  destination: string;
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
}

export interface LinkDetailsDto {
  /**
   * Uid
   * @example "string"
   */
  uid?: string | null;
  /**
   * Destination
   * @minLength 1
   * @example "string"
   */
  destination: string;
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
}

export interface LinkDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: LinkDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, LinkDetailsDto>;
}

export interface LinkImportDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string | null;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Created By Ip
   * @example "string"
   */
  createdByIp?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Created By User Agent
   * @example "string"
   */
  createdByUserAgent?: string | null;
  /**
   * Updated By Ip
   * @example "string"
   */
  updatedByIp?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Updated By User Agent
   * @example "string"
   */
  updatedByUserAgent?: string | null;
  /**
   * Uid
   * @example "string"
   */
  uid?: string | null;
  /**
   * Destination
   * @example "string"
   */
  destination?: string | null;
  /**
   * Name
   * @example "string"
   */
  name?: string | null;
}

export interface LinkUpdateDto {
  /**
   * Uid
   * @example "string"
   */
  uid?: string | null;
  /**
   * Destination
   * @example "string"
   */
  destination?: string | null;
  /**
   * Name
   * @example "string"
   */
  name?: string | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
}

export interface LogRecord {
  /**
   * Date Time
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  dateTime?: string;
  /**
   * Log Level
   * @example "Trace"
   */
  logLevel?:
    | "Trace"
    | "Debug"
    | "Information"
    | "Warning"
    | "Error"
    | "Critical"
    | "None";
  /**
   * Message
   * @example "string"
   */
  message?: string;
}

export interface LoginDto {
  /**
   * Email
   * @format email
   * @minLength 1
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  email: string;
  /**
   * Password
   * @minLength 1
   * @example "string"
   */
  password: string;
}

export interface MdxComponentAnalysisDto {
  /**
   * Content Type
   * @minLength 1
   * @example "string"
   */
  contentType: string;
  /** Components */
  components?: MdxComponentDto[];
  /**
   * Total Content Analyzed
   * @format int32
   * @example 1
   */
  totalContentAnalyzed?: number;
  /**
   * Analyzed At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  analyzedAt?: string;
}

export interface MdxComponentDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /** Properties */
  properties?: MdxComponentPropertyDto[];
  /**
   * Accepts Children
   * @example true
   */
  acceptsChildren?: boolean;
  /** Examples */
  examples?: string[];
  /**
   * Usage Count
   * @format int32
   * @example 1
   */
  usageCount?: number;
}

export interface MdxComponentPropertyDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Type
   * @example "string"
   */
  type?: string | null;
  /**
   * Is Required
   * @example true
   */
  isRequired?: boolean;
  /**
   * Default Value
   * @example "string"
   */
  defaultValue?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /** Possible Values */
  possibleValues?: string[];
  /** Example Values */
  exampleValues?: string[];
}

export interface MediaBulkDeleteRequestDto {
  /**
   * Folder
   * @minLength 1
   * @example "string"
   */
  folder: string;
}

export interface MediaBulkOptimizeRequestDto {
  /**
   * Folder
   * @example "string"
   */
  folder?: string | null;
  /**
   * Include Subfolders
   * @example true
   */
  includeSubfolders?: boolean;
}

export interface MediaBulkRenameRequestDto {
  /**
   * Folder
   * @minLength 1
   * @example "string"
   */
  folder: string;
  /**
   * New Folder
   * @minLength 1
   * @example "string"
   */
  newFolder: string;
}

export interface MediaBulkResetRequestDto {
  /**
   * Folder
   * @example "string"
   */
  folder?: string | null;
  /**
   * Include Subfolders
   * @example true
   */
  includeSubfolders?: boolean;
}

export interface MediaCropRequestDto {
  /**
   * Scope Uid
   * @minLength 1
   * @example "string"
   */
  scopeUid: string;
  /**
   * File Name
   * @minLength 1
   * @example "string"
   */
  fileName: string;
  /**
   * Width
   * @format int32
   * @min 1
   * @max 2147483647
   * @example 1
   */
  width?: number;
  /**
   * Height
   * @format int32
   * @min 1
   * @max 2147483647
   * @example 1
   */
  height?: number;
  /**
   * X
   * @format int32
   * @example 1
   */
  x?: number | null;
  /**
   * Y
   * @format int32
   * @example 1
   */
  y?: number | null;
}

export interface MediaDeletedDto {
  /**
   * Scope Uid
   * @example "string"
   */
  scopeUid?: string;
  /**
   * Name
   * @example "string"
   */
  name?: string;
}

export interface MediaDetailsDto {
  /**
   * Location
   * @example "string"
   */
  location?: string;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Scope Uid
   * @example "string"
   */
  scopeUid?: string;
  /**
   * Name
   * @example "string"
   */
  name?: string;
  /**
   * Original Name
   * @example "string"
   */
  originalName?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Size
   * @format int64
   */
  size?: number;
  /**
   * Original Size
   * @format int64
   */
  originalSize?: number | null;
  /**
   * Width
   * @format int32
   * @example 1
   */
  width?: number | null;
  /**
   * Height
   * @format int32
   * @example 1
   */
  height?: number | null;
  /**
   * Original Width
   * @format int32
   * @example 1
   */
  originalWidth?: number | null;
  /**
   * Original Height
   * @format int32
   * @example 1
   */
  originalHeight?: number | null;
  /**
   * Extension
   * @example "string"
   */
  extension?: string;
  /**
   * Original Extension
   * @example "string"
   */
  originalExtension?: string | null;
  /**
   * Mime Type
   * @example "string"
   */
  mimeType?: string;
  /**
   * Original Mime Type
   * @example "string"
   */
  originalMimeType?: string | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[];
  /**
   * Usage Count
   * @format int32
   * @example 1
   */
  usageCount?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
}

export interface MediaDetailsDtoMediaDeletedDtoSyncResponseDto {
  /** Items */
  items?: MediaDetailsDto[];
  /** Deleted */
  deleted?: MediaDeletedDto[];
  /** Base Items */
  baseItems?: Record<string, MediaDetailsDto>;
}

export interface MediaOptimizeResponseDto {
  /**
   * Updated
   * @format int32
   * @example 1
   */
  updated?: number;
  /**
   * Message
   * @example "string"
   */
  message?: string | null;
}

export interface MediaRenameRequestDto {
  /**
   * Scope Uid
   * @minLength 1
   * @example "string"
   */
  scopeUid: string;
  /**
   * File Name
   * @minLength 1
   * @example "string"
   */
  fileName: string;
  /**
   * New Scope Uid
   * @minLength 1
   * @example "string"
   */
  newScopeUid: string;
  /**
   * New File Name
   * @minLength 1
   * @example "string"
   */
  newFileName: string;
}

export interface MediaResizeRequestDto {
  /**
   * Scope Uid
   * @minLength 1
   * @example "string"
   */
  scopeUid: string;
  /**
   * File Name
   * @minLength 1
   * @example "string"
   */
  fileName: string;
  /**
   * Width
   * @format int32
   * @min 1
   * @max 2147483647
   * @example 1
   */
  width?: number;
  /**
   * Height
   * @format int32
   * @min 1
   * @max 2147483647
   * @example 1
   */
  height?: number;
  /**
   * Maintain Aspect Ratio
   * @example true
   */
  maintainAspectRatio?: boolean;
}

export interface MediaTransformRequestDto {
  /**
   * Scope Uid
   * @minLength 1
   * @example "string"
   */
  scopeUid: string;
  /**
   * File Name
   * @minLength 1
   * @example "string"
   */
  fileName: string;
}

export interface MsalConfigDto {
  /**
   * Client Id
   * @example "string"
   */
  clientId?: string;
  /**
   * Authority
   * @example "string"
   */
  authority?: string;
  /**
   * Redirect Uri
   * @example "string"
   */
  redirectUri?: string;
}

export interface OrderCreateDto {
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId: number;
  /**
   * Ref No
   * @minLength 1
   * @example "string"
   */
  refNo: string;
  /**
   * Order Number
   * @example "string"
   */
  orderNumber?: string | null;
  /**
   * Affiliate Name
   * @example "string"
   */
  affiliateName?: string | null;
  /**
   * Exchange Rate
   * @format double
   * @example 1
   */
  exchangeRate: number;
  /**
   * Currency
   * @minLength 1
   * @example "string"
   */
  currency: string;
  /**
   * Test Order
   * @example true
   */
  testOrder?: boolean;
  /**
   * Data
   * @example "string"
   */
  data?: string | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Status
   * @example "Pending"
   */
  status?: "Pending" | "Paid" | "Cancelled" | "Refunded" | "Failed";
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Campaign Id
   * @format int32
   * @example 1
   */
  campaignId?: number | null;
}

export interface OrderDetailsDto {
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId: number;
  /**
   * Ref No
   * @minLength 1
   * @example "string"
   */
  refNo: string;
  /**
   * Order Number
   * @example "string"
   */
  orderNumber?: string | null;
  /**
   * Affiliate Name
   * @example "string"
   */
  affiliateName?: string | null;
  /**
   * Exchange Rate
   * @format double
   * @example 1
   */
  exchangeRate: number;
  /**
   * Currency
   * @minLength 1
   * @example "string"
   */
  currency: string;
  /**
   * Test Order
   * @example true
   */
  testOrder?: boolean;
  /**
   * Data
   * @example "string"
   */
  data?: string | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Campaign Id
   * @format int32
   * @example 1
   */
  campaignId?: number | null;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Quantity
   * @format int32
   * @example 1
   */
  quantity?: number;
  /**
   * Total
   * @format double
   * @example 1
   */
  total?: number;
  /**
   * Currency Total
   * @format double
   * @example 1
   */
  currencyTotal?: number;
  /**
   * Commission
   * @format double
   * @example 1
   */
  commission?: number;
  /**
   * Refund
   * @format double
   * @example 1
   */
  refund?: number;
  /**
   * Status
   * @example "Pending"
   */
  status?: "Pending" | "Paid" | "Cancelled" | "Refunded" | "Failed";
  /** Order Items */
  orderItems?: OrderItemDetailsDto[] | null;
  contact?: ContactDetailsDto;
}

export interface OrderDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: OrderDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, OrderDetailsDto>;
}

export interface OrderImportDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string | null;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Created By Ip
   * @example "string"
   */
  createdByIp?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Created By User Agent
   * @example "string"
   */
  createdByUserAgent?: string | null;
  /**
   * Updated By Ip
   * @example "string"
   */
  updatedByIp?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Updated By User Agent
   * @example "string"
   */
  updatedByUserAgent?: string | null;
  /**
   * Ref No
   * @example "string"
   */
  refNo?: string | null;
  /**
   * Order Number
   * @example "string"
   */
  orderNumber?: string | null;
  /**
   * Affiliate Name
   * @example "string"
   */
  affiliateName?: string | null;
  /**
   * Exchange Rate
   * @format double
   * @example 1
   */
  exchangeRate?: number | null;
  /**
   * Currency
   * @example "string"
   */
  currency?: string | null;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Contact Email
   * @format email
   * @pattern ^([\w\.\-]+)@([\w\-]+)((\.(\w){1,63})+)$
   * @example "example@example.com"
   */
  contactEmail?: string | null;
  /**
   * Test Order
   * @example true
   */
  testOrder?: boolean | null;
  /**
   * Data
   * @example "string"
   */
  data?: string | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Status
   * @example "Pending"
   */
  status?: "Pending" | "Paid" | "Cancelled" | "Refunded" | "Failed" | null;
}

export interface OrderItemCreateDto {
  /**
   * Order Id
   * @format int32
   * @example 1
   */
  orderId: number;
  /**
   * Line Number
   * @format int32
   * @example 1
   */
  lineNumber?: number | null;
  /**
   * Product Name
   * @minLength 1
   * @example "string"
   */
  productName: string;
  /**
   * Unit Price
   * @format double
   * @example 1
   */
  unitPrice: number;
  /**
   * Currency
   * @minLength 1
   * @pattern ^(NAD|ZAR|XAF|JPY|GHS|ETB|USD||AED|BHD|DJF|DZD|EGP|MAD|ERN|ILS|IQD|JOD|KMF|KWD|LBP|LYD|MAD|MRU|OMR|ILS|QAR|SAR|SDG|SOS|SSP|SYP|XAF|TND|YER|CLP|INR|TZS|EUR|AZN|AZN|RUB|XAF|BYN|ZMW|MAD|MAD|TZS|EUR|INR|INR|XOF|XOF|BDT|INR|CNY|INR|EUR|INR|BAM|BAM|RUB|ERN|EUR|EUR|EUR|EUR|BDT|INR|RUB|PHP|UGX|USD|USD|USD|IQD|IRR|EUR|CZK|CAD|RUB|GBP|DKK|DKK|KES|EUR|EUR|CHF|EUR|EUR|CHF|EUR|XOF|INR|EUR|XAF|MVR|XOF|BTN|KES|GHS|XOF|EUR|EUR|||AED|XCD|XCD|ALL|ARS|USD|EUR|AUD|BBD|BDT|EUR|EUR|BIF|BMD|BND|BRL|BSD|BWP|BZD|CAD|AUD|CHF|NZD|CLP|XAF|CNY|COP|CVE|AUD|EUR|CZK|EUR|USD|DKK|XCD|EUR|ERN|EUR|EUR|FJD|FKP|USD|EUR|GBP|XCD|GEL|GBP|GHS|GIP|GMD|EUR|GBP|USD|GYD|HKD|HUF|IDR|EUR|ILS|GBP|INR|USD|EUR|GBP|JMD|JPY|KES|AUD|XCD|KRW|KYD|XCD|LRD|ZAR|EUR|EUR|MGA|USD|MMK|MOP|USD|XCD|EUR|MUR|MVR|MWK|MXN|MYR|NAD|AUD|NGN|EUR|NOK|AUD|NZD|NZD|PGK|PHP|PKR|PLN|NZD|USD|EUR|USD|RON|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|EUR|EUR|SLE|SSP|XCG|SZL|USD|THB|NZD|TOP|TRY|TTD|AUD|TWD|TZS|UAH|UGX|USD|USD|USD|XCD|USD|USD|VUV|WST|ZAR|ZMW|ZWG||||XCD|ARS|BBD|BMD|BOB|USD|BRL|BSD|BZD|CAD|CLP|COP|CRC|CUP|XCG|XCD|DOP|EUR|USD|EUR|XCD|XAF|GTQ|GYD|HNL|HTG|EUR|XCD|KYD|XCD|MXN|NIO|PAB|PEN|PHP|USD|PYG|USD|USD|TTD|USD|UYU|XCD|VED|USD|USD|EUR|EUR|XAF|AFN|IRR|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|EUR|PHP|DKK|DKK|EUR|XOF|BIF|XOF|EUR|CAD|CDF|XAF|XAF|CHF|XOF|XAF|DJF|DZD|EUR|XAF|EUR|GNF|EUR|XAF|HTG|KMF|EUR|MAD|EUR|EUR|MGA|XOF|EUR|MRU|MUR|XPF|XOF|XPF|EUR|EUR|RWF|SCR|XOF|SYP|XAF|XOF|TND|VUV|XPF|EUR|EUR|EUR|GBP|EUR|GHS|GBP|ERN|ETB|EUR|PYG|CHF|EUR|CHF|INR|KES|GBP|GHS|XOF|NGN|USD|ILS|INR|INR|CNY|BAM|EUR|EUR|HTG|HUF|AMD||IDR|EUR|NGN|CNY||ISK|CHF|EUR|EUR|EUR|CAD|JPY||XAF|TZS|IDR|GEL|DZD|NGN|KES|NGN|TZS|CVE|BRL|XOF|KES|CNY|KZT|KZT|XAF|DKK|KES|KHR|INR|CNY|KPW|KRW|INR|INR|GNF|LRD|INR|INR|INR|TZS|XAF|EUR|IQD|SYP|TRY|TRY|GBP|INR|INR|INR|INR|KGS|TZS|EUR|UGX|EUR|USD|EUR|AOA|CDF|XAF|XAF|LAK|IQD|IRR|EUR|CDF|KES|KES|EUR|INR|KES|TZS|KES|MUR|MGA|MZN|XAF|NZD|CAD|IQD|MKD|INR|MNT|INR|INR|CAD|INR|BND|MYR|BND|IDR|MYR|SGD|EUR|XAF|USD|MMK|RUB|IRR|NAD|NOK|NOK|ZWG|EUR|EUR|INR|NPR|AWG|EUR|USD|XCG|EUR|SRD|XCG|XAF|NOK|XAF|INR|GNF|ZAR|ZAR|SSP|USD|MWK|UGX|EUR|EUR|ETB|KES|INR|GEL|RUB|USD|PKR|PKR|INR|NGN|PLN|EUR|CAD|PLN|AFN|PKR|AOA|BRL|CHF|CVE|EUR|XAF|XOF|EUR|MOP|MZN|EUR|STN|USD|BOB|USD|PEN|INR|IDR|IDR|BDT|MMK|CHF|BIF|MDL|RON|TZS|BYN|KGS|KZT|MDL|RUB|UAH|RWF|TZS|INR|RUB|KES|INR|INR|TZS|EUR|EUR|PKR|INR|EUR|NOK|SEK|MZN|XOF|XAF|MAD|MAD|MMK|THB|LKR|EUR|EUR|USD|WST|EUR|ZWG|DJF|ETB|KES|SOS|ALL|MKD|EUR|BAM|EUR|RSD|EUR|BAM|EUR|RSD|EUR|SZL|ZAR|ZAR|ZAR|IDR|EUR|EUR|SEK|CDF|KES|TZS|UGX|IQD|SYP|PLN|INR|LKR|MYR|SGD|INR|KES|UGX|TJS|THB|ERN|ETB|ERN|TMT|BWP|ZAR|TOP||EUR|TRY|TWD|ZAR|RUB|XOF|RUB|MAD|CNY|UAH|INR|PKR|INR|PKR|AFN|UZS|UZS|LRD|LRD|ZAR|EUR|VND|MZN|TZS|EUR|CHF|ETB|XOF|ZAR|INR|UGX|XAF|UAH|XOF|NGN|BRL|COP|VED|CNY|CNY|HKD|MOP|CNY|MAD|CNY|HKD|JPY|MOP|MYR|SGD|CNY|HKD|JPY|MOP|MYR|TWD|ZAR)$
   * @example "USD"
   */
  currency: string;
  /**
   * Quantity
   * @format int32
   * @min 1
   * @max 2147483647
   * @example 1
   */
  quantity: number;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
}

export interface OrderItemDetailsDto {
  /**
   * Order Id
   * @format int32
   * @example 1
   */
  orderId: number;
  /**
   * Line Number
   * @format int32
   * @example 1
   */
  lineNumber?: number;
  /**
   * Product Name
   * @minLength 1
   * @example "string"
   */
  productName: string;
  /**
   * Unit Price
   * @format double
   * @example 1
   */
  unitPrice: number;
  /**
   * Currency
   * @minLength 1
   * @pattern ^(NAD|ZAR|XAF|JPY|GHS|ETB|USD||AED|BHD|DJF|DZD|EGP|MAD|ERN|ILS|IQD|JOD|KMF|KWD|LBP|LYD|MAD|MRU|OMR|ILS|QAR|SAR|SDG|SOS|SSP|SYP|XAF|TND|YER|CLP|INR|TZS|EUR|AZN|AZN|RUB|XAF|BYN|ZMW|MAD|MAD|TZS|EUR|INR|INR|XOF|XOF|BDT|INR|CNY|INR|EUR|INR|BAM|BAM|RUB|ERN|EUR|EUR|EUR|EUR|BDT|INR|RUB|PHP|UGX|USD|USD|USD|IQD|IRR|EUR|CZK|CAD|RUB|GBP|DKK|DKK|KES|EUR|EUR|CHF|EUR|EUR|CHF|EUR|XOF|INR|EUR|XAF|MVR|XOF|BTN|KES|GHS|XOF|EUR|EUR|||AED|XCD|XCD|ALL|ARS|USD|EUR|AUD|BBD|BDT|EUR|EUR|BIF|BMD|BND|BRL|BSD|BWP|BZD|CAD|AUD|CHF|NZD|CLP|XAF|CNY|COP|CVE|AUD|EUR|CZK|EUR|USD|DKK|XCD|EUR|ERN|EUR|EUR|FJD|FKP|USD|EUR|GBP|XCD|GEL|GBP|GHS|GIP|GMD|EUR|GBP|USD|GYD|HKD|HUF|IDR|EUR|ILS|GBP|INR|USD|EUR|GBP|JMD|JPY|KES|AUD|XCD|KRW|KYD|XCD|LRD|ZAR|EUR|EUR|MGA|USD|MMK|MOP|USD|XCD|EUR|MUR|MVR|MWK|MXN|MYR|NAD|AUD|NGN|EUR|NOK|AUD|NZD|NZD|PGK|PHP|PKR|PLN|NZD|USD|EUR|USD|RON|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|EUR|EUR|SLE|SSP|XCG|SZL|USD|THB|NZD|TOP|TRY|TTD|AUD|TWD|TZS|UAH|UGX|USD|USD|USD|XCD|USD|USD|VUV|WST|ZAR|ZMW|ZWG||||XCD|ARS|BBD|BMD|BOB|USD|BRL|BSD|BZD|CAD|CLP|COP|CRC|CUP|XCG|XCD|DOP|EUR|USD|EUR|XCD|XAF|GTQ|GYD|HNL|HTG|EUR|XCD|KYD|XCD|MXN|NIO|PAB|PEN|PHP|USD|PYG|USD|USD|TTD|USD|UYU|XCD|VED|USD|USD|EUR|EUR|XAF|AFN|IRR|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|EUR|PHP|DKK|DKK|EUR|XOF|BIF|XOF|EUR|CAD|CDF|XAF|XAF|CHF|XOF|XAF|DJF|DZD|EUR|XAF|EUR|GNF|EUR|XAF|HTG|KMF|EUR|MAD|EUR|EUR|MGA|XOF|EUR|MRU|MUR|XPF|XOF|XPF|EUR|EUR|RWF|SCR|XOF|SYP|XAF|XOF|TND|VUV|XPF|EUR|EUR|EUR|GBP|EUR|GHS|GBP|ERN|ETB|EUR|PYG|CHF|EUR|CHF|INR|KES|GBP|GHS|XOF|NGN|USD|ILS|INR|INR|CNY|BAM|EUR|EUR|HTG|HUF|AMD||IDR|EUR|NGN|CNY||ISK|CHF|EUR|EUR|EUR|CAD|JPY||XAF|TZS|IDR|GEL|DZD|NGN|KES|NGN|TZS|CVE|BRL|XOF|KES|CNY|KZT|KZT|XAF|DKK|KES|KHR|INR|CNY|KPW|KRW|INR|INR|GNF|LRD|INR|INR|INR|TZS|XAF|EUR|IQD|SYP|TRY|TRY|GBP|INR|INR|INR|INR|KGS|TZS|EUR|UGX|EUR|USD|EUR|AOA|CDF|XAF|XAF|LAK|IQD|IRR|EUR|CDF|KES|KES|EUR|INR|KES|TZS|KES|MUR|MGA|MZN|XAF|NZD|CAD|IQD|MKD|INR|MNT|INR|INR|CAD|INR|BND|MYR|BND|IDR|MYR|SGD|EUR|XAF|USD|MMK|RUB|IRR|NAD|NOK|NOK|ZWG|EUR|EUR|INR|NPR|AWG|EUR|USD|XCG|EUR|SRD|XCG|XAF|NOK|XAF|INR|GNF|ZAR|ZAR|SSP|USD|MWK|UGX|EUR|EUR|ETB|KES|INR|GEL|RUB|USD|PKR|PKR|INR|NGN|PLN|EUR|CAD|PLN|AFN|PKR|AOA|BRL|CHF|CVE|EUR|XAF|XOF|EUR|MOP|MZN|EUR|STN|USD|BOB|USD|PEN|INR|IDR|IDR|BDT|MMK|CHF|BIF|MDL|RON|TZS|BYN|KGS|KZT|MDL|RUB|UAH|RWF|TZS|INR|RUB|KES|INR|INR|TZS|EUR|EUR|PKR|INR|EUR|NOK|SEK|MZN|XOF|XAF|MAD|MAD|MMK|THB|LKR|EUR|EUR|USD|WST|EUR|ZWG|DJF|ETB|KES|SOS|ALL|MKD|EUR|BAM|EUR|RSD|EUR|BAM|EUR|RSD|EUR|SZL|ZAR|ZAR|ZAR|IDR|EUR|EUR|SEK|CDF|KES|TZS|UGX|IQD|SYP|PLN|INR|LKR|MYR|SGD|INR|KES|UGX|TJS|THB|ERN|ETB|ERN|TMT|BWP|ZAR|TOP||EUR|TRY|TWD|ZAR|RUB|XOF|RUB|MAD|CNY|UAH|INR|PKR|INR|PKR|AFN|UZS|UZS|LRD|LRD|ZAR|EUR|VND|MZN|TZS|EUR|CHF|ETB|XOF|ZAR|INR|UGX|XAF|UAH|XOF|NGN|BRL|COP|VED|CNY|CNY|HKD|MOP|CNY|MAD|CNY|HKD|JPY|MOP|MYR|SGD|CNY|HKD|JPY|MOP|MYR|TWD|ZAR)$
   * @example "USD"
   */
  currency: string;
  /**
   * Quantity
   * @format int32
   * @min 1
   * @max 2147483647
   * @example 1
   */
  quantity: number;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Currency Total
   * @format double
   * @example 1
   */
  currencyTotal?: number;
  /**
   * Total
   * @format double
   * @example 1
   */
  total?: number;
  order?: OrderDetailsDto;
}

export interface OrderItemDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: OrderItemDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, OrderItemDetailsDto>;
}

export interface OrderItemImportDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string | null;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Created By Ip
   * @example "string"
   */
  createdByIp?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Created By User Agent
   * @example "string"
   */
  createdByUserAgent?: string | null;
  /**
   * Updated By Ip
   * @example "string"
   */
  updatedByIp?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Updated By User Agent
   * @example "string"
   */
  updatedByUserAgent?: string | null;
  /**
   * Order Id
   * @format int32
   * @example 1
   */
  orderId?: number | null;
  /**
   * Order Ref No
   * @example "string"
   */
  orderRefNo?: string | null;
  /**
   * Line Number
   * @format int32
   * @example 1
   */
  lineNumber?: number | null;
  /**
   * Product Name
   * @example "string"
   */
  productName?: string | null;
  /**
   * Unit Price
   * @format double
   * @example 1
   */
  unitPrice?: number | null;
  /**
   * Currency
   * @pattern ^(NAD|ZAR|XAF|JPY|GHS|ETB|USD||AED|BHD|DJF|DZD|EGP|MAD|ERN|ILS|IQD|JOD|KMF|KWD|LBP|LYD|MAD|MRU|OMR|ILS|QAR|SAR|SDG|SOS|SSP|SYP|XAF|TND|YER|CLP|INR|TZS|EUR|AZN|AZN|RUB|XAF|BYN|ZMW|MAD|MAD|TZS|EUR|INR|INR|XOF|XOF|BDT|INR|CNY|INR|EUR|INR|BAM|BAM|RUB|ERN|EUR|EUR|EUR|EUR|BDT|INR|RUB|PHP|UGX|USD|USD|USD|IQD|IRR|EUR|CZK|CAD|RUB|GBP|DKK|DKK|KES|EUR|EUR|CHF|EUR|EUR|CHF|EUR|XOF|INR|EUR|XAF|MVR|XOF|BTN|KES|GHS|XOF|EUR|EUR|||AED|XCD|XCD|ALL|ARS|USD|EUR|AUD|BBD|BDT|EUR|EUR|BIF|BMD|BND|BRL|BSD|BWP|BZD|CAD|AUD|CHF|NZD|CLP|XAF|CNY|COP|CVE|AUD|EUR|CZK|EUR|USD|DKK|XCD|EUR|ERN|EUR|EUR|FJD|FKP|USD|EUR|GBP|XCD|GEL|GBP|GHS|GIP|GMD|EUR|GBP|USD|GYD|HKD|HUF|IDR|EUR|ILS|GBP|INR|USD|EUR|GBP|JMD|JPY|KES|AUD|XCD|KRW|KYD|XCD|LRD|ZAR|EUR|EUR|MGA|USD|MMK|MOP|USD|XCD|EUR|MUR|MVR|MWK|MXN|MYR|NAD|AUD|NGN|EUR|NOK|AUD|NZD|NZD|PGK|PHP|PKR|PLN|NZD|USD|EUR|USD|RON|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|EUR|EUR|SLE|SSP|XCG|SZL|USD|THB|NZD|TOP|TRY|TTD|AUD|TWD|TZS|UAH|UGX|USD|USD|USD|XCD|USD|USD|VUV|WST|ZAR|ZMW|ZWG||||XCD|ARS|BBD|BMD|BOB|USD|BRL|BSD|BZD|CAD|CLP|COP|CRC|CUP|XCG|XCD|DOP|EUR|USD|EUR|XCD|XAF|GTQ|GYD|HNL|HTG|EUR|XCD|KYD|XCD|MXN|NIO|PAB|PEN|PHP|USD|PYG|USD|USD|TTD|USD|UYU|XCD|VED|USD|USD|EUR|EUR|XAF|AFN|IRR|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|XOF|XAF|GHS|GMD|GNF|XOF|LRD|MRU|XOF|NGN|SLE|XOF|EUR|PHP|DKK|DKK|EUR|XOF|BIF|XOF|EUR|CAD|CDF|XAF|XAF|CHF|XOF|XAF|DJF|DZD|EUR|XAF|EUR|GNF|EUR|XAF|HTG|KMF|EUR|MAD|EUR|EUR|MGA|XOF|EUR|MRU|MUR|XPF|XOF|XPF|EUR|EUR|RWF|SCR|XOF|SYP|XAF|XOF|TND|VUV|XPF|EUR|EUR|EUR|GBP|EUR|GHS|GBP|ERN|ETB|EUR|PYG|CHF|EUR|CHF|INR|KES|GBP|GHS|XOF|NGN|USD|ILS|INR|INR|CNY|BAM|EUR|EUR|HTG|HUF|AMD||IDR|EUR|NGN|CNY||ISK|CHF|EUR|EUR|EUR|CAD|JPY||XAF|TZS|IDR|GEL|DZD|NGN|KES|NGN|TZS|CVE|BRL|XOF|KES|CNY|KZT|KZT|XAF|DKK|KES|KHR|INR|CNY|KPW|KRW|INR|INR|GNF|LRD|INR|INR|INR|TZS|XAF|EUR|IQD|SYP|TRY|TRY|GBP|INR|INR|INR|INR|KGS|TZS|EUR|UGX|EUR|USD|EUR|AOA|CDF|XAF|XAF|LAK|IQD|IRR|EUR|CDF|KES|KES|EUR|INR|KES|TZS|KES|MUR|MGA|MZN|XAF|NZD|CAD|IQD|MKD|INR|MNT|INR|INR|CAD|INR|BND|MYR|BND|IDR|MYR|SGD|EUR|XAF|USD|MMK|RUB|IRR|NAD|NOK|NOK|ZWG|EUR|EUR|INR|NPR|AWG|EUR|USD|XCG|EUR|SRD|XCG|XAF|NOK|XAF|INR|GNF|ZAR|ZAR|SSP|USD|MWK|UGX|EUR|EUR|ETB|KES|INR|GEL|RUB|USD|PKR|PKR|INR|NGN|PLN|EUR|CAD|PLN|AFN|PKR|AOA|BRL|CHF|CVE|EUR|XAF|XOF|EUR|MOP|MZN|EUR|STN|USD|BOB|USD|PEN|INR|IDR|IDR|BDT|MMK|CHF|BIF|MDL|RON|TZS|BYN|KGS|KZT|MDL|RUB|UAH|RWF|TZS|INR|RUB|KES|INR|INR|TZS|EUR|EUR|PKR|INR|EUR|NOK|SEK|MZN|XOF|XAF|MAD|MAD|MMK|THB|LKR|EUR|EUR|USD|WST|EUR|ZWG|DJF|ETB|KES|SOS|ALL|MKD|EUR|BAM|EUR|RSD|EUR|BAM|EUR|RSD|EUR|SZL|ZAR|ZAR|ZAR|IDR|EUR|EUR|SEK|CDF|KES|TZS|UGX|IQD|SYP|PLN|INR|LKR|MYR|SGD|INR|KES|UGX|TJS|THB|ERN|ETB|ERN|TMT|BWP|ZAR|TOP||EUR|TRY|TWD|ZAR|RUB|XOF|RUB|MAD|CNY|UAH|INR|PKR|INR|PKR|AFN|UZS|UZS|LRD|LRD|ZAR|EUR|VND|MZN|TZS|EUR|CHF|ETB|XOF|ZAR|INR|UGX|XAF|UAH|XOF|NGN|BRL|COP|VED|CNY|CNY|HKD|MOP|CNY|MAD|CNY|HKD|JPY|MOP|MYR|SGD|CNY|HKD|JPY|MOP|MYR|TWD|ZAR)$
   * @example "USD"
   */
  currency?: string | null;
  /**
   * Quantity
   * @format int32
   * @example 1
   */
  quantity?: number | null;
}

export interface OrderItemUpdateDto {
  /**
   * Product Name
   * @minLength 1
   * @example "string"
   */
  productName?: string | null;
  /**
   * Unit Price
   * @format double
   * @example 1
   */
  unitPrice?: number | null;
  /**
   * Quantity
   * @format int32
   * @min 1
   * @max 2147483647
   * @example 1
   */
  quantity?: number | null;
  /**
   * Data
   * @example "string"
   */
  data?: string | null;
}

export interface OrderSummaryDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Order Number
   * @example "string"
   */
  orderNumber?: string;
  /**
   * Customer
   * @example "string"
   */
  customer?: string;
  /**
   * Amount
   * @format double
   * @example 1
   */
  amount?: number;
  /**
   * Status
   * @example "string"
   */
  status?: string;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
}

export interface OrderUpdateDto {
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number | null;
  /**
   * Ref No
   * @example "string"
   */
  refNo?: string | null;
  /**
   * Order Number
   * @example "string"
   */
  orderNumber?: string | null;
  /**
   * Affiliate Name
   * @example "string"
   */
  affiliateName?: string | null;
  /**
   * Exchange Rate
   * @format double
   * @example 1
   */
  exchangeRate?: number | null;
  /**
   * Currency
   * @example "string"
   */
  currency?: string | null;
  /**
   * Test Order
   * @example true
   */
  testOrder?: boolean | null;
  /**
   * Data
   * @example "string"
   */
  data?: string | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Status
   * @example "Pending"
   */
  status?: "Pending" | "Paid" | "Cancelled" | "Refunded" | "Failed" | null;
  /**
   * Tags
   * @example ["string1","string2"]
   */
  tags?: string[] | null;
  /**
   * Campaign Id
   * @format int32
   * @example 1
   */
  campaignId?: number | null;
  /**
   * Commission
   * @format double
   * @example 1
   */
  commission?: number | null;
  /**
   * Refund
   * @format double
   * @example 1
   */
  refund?: number | null;
}

export interface PendingContactUpdate {
  /**
   * Field
   * @example "string"
   */
  field?: string;
  /**
   * Old Value
   * @example "string"
   */
  oldValue?: string | null;
  /**
   * Proposed Value
   * @example "string"
   */
  proposedValue?: string | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Ip
   * @example "string"
   */
  ip?: string | null;
  /**
   * User Agent
   * @example "string"
   */
  userAgent?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  /** @format int32 */
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

export interface PromotionCreateDto {
  /**
   * Code
   * @minLength 1
   * @example "string"
   */
  code: string;
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Start Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  startDate: string;
  /**
   * End Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  endDate: string;
}

export interface PromotionDetailsDto {
  /**
   * Code
   * @minLength 1
   * @example "string"
   */
  code: string;
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Start Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  startDate: string;
  /**
   * End Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  endDate: string;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
}

export interface PromotionDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: PromotionDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, PromotionDetailsDto>;
}

export interface PromotionUpdateDto {
  /**
   * Name
   * @example "string"
   */
  name?: string | null;
  /**
   * Start Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  startDate?: string | null;
  /**
   * End Date
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  endDate?: string | null;
}

export interface RedirectDetailsDto {
  /**
   * Content Id
   * @format int32
   * @example 1
   */
  contentId?: number;
  /**
   * From Slug
   * @example "string"
   */
  fromSlug?: string;
  /**
   * To Slug
   * @example "string"
   */
  toSlug?: string;
  /**
   * From Language
   * @example "string"
   */
  fromLanguage?: string;
  /**
   * To Language
   * @example "string"
   */
  toLanguage?: string;
}

export interface ResetPasswordDto {
  /**
   * User Id
   * @minLength 1
   * @example "string"
   */
  userId: string;
  /**
   * Token
   * @minLength 1
   * @example "string"
   */
  token: string;
  /**
   * New Password
   * @minLength 1
   * @example "string"
   */
  newPassword: string;
}

export interface RuleGroup {
  /**
   * Id
   * @minLength 1
   * @example "string"
   */
  id: string;
  /**
   * Connector
   * @example "And"
   */
  connector: "And" | "Or";
  /** Rules */
  rules?: SegmentRule[];
  /** Groups */
  groups?: RuleGroup[];
}

export interface SalesPerformancePointDto {
  /**
   * Period
   * @minLength 1
   * @example "string"
   */
  period: string;
  /**
   * Revenue
   * @format double
   * @example 1
   */
  revenue?: number;
  /**
   * Refunds
   * @format double
   * @example 1
   */
  refunds?: number;
  /**
   * Commissions
   * @format double
   * @example 1
   */
  commissions?: number;
  /**
   * Orders
   * @format int32
   * @example 1
   */
  orders?: number;
}

export interface SegmentCreateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Type
   * @example "Dynamic"
   */
  type: "Dynamic" | "Static";
  definition?: SegmentDefinition;
  /** Contact Ids */
  contactIds?: number[] | null;
}

export interface SegmentDefinition {
  includeRules: RuleGroup;
  excludeRules?: RuleGroup;
}

export interface SegmentDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Type
   * @example "Dynamic"
   */
  type: "Dynamic" | "Static";
  /**
   * Contact Count
   * @format int32
   * @example 1
   */
  contactCount?: number;
  definition?: SegmentDefinition;
  /** Contact Ids */
  contactIds?: number[] | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Created By Ip
   * @example "string"
   */
  createdByIp?: string | null;
  /**
   * Created By User Agent
   * @example "string"
   */
  createdByUserAgent?: string | null;
  /**
   * Updated By Ip
   * @example "string"
   */
  updatedByIp?: string | null;
  /**
   * Updated By User Agent
   * @example "string"
   */
  updatedByUserAgent?: string | null;
}

export interface SegmentDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: SegmentDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, SegmentDetailsDto>;
}

export interface SegmentPreviewResultDto {
  /**
   * Contact Count
   * @format int32
   * @example 1
   */
  contactCount?: number;
  /** Contacts */
  contacts?: ContactDetailsDto[];
}

export interface SegmentRule {
  /**
   * Id
   * @minLength 1
   * @example "string"
   */
  id: string;
  /**
   * Field Id
   * @minLength 1
   * @example "string"
   */
  fieldId: string;
  /**
   * Operator
   * @example "Equals"
   */
  operator:
    | "Equals"
    | "NotEquals"
    | "Contains"
    | "NotContains"
    | "StartsWith"
    | "EndsWith"
    | "IsEmpty"
    | "IsNotEmpty"
    | "GreaterThan"
    | "LessThan"
    | "GreaterThanOrEqual"
    | "LessThanOrEqual"
    | "IsTrue"
    | "IsFalse"
    | "In"
    | "NotIn";
  /** Value */
  value?: any;
}

export interface SegmentUpdateDto {
  /**
   * Name
   * @example "string"
   */
  name?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  definition?: SegmentDefinition;
  /** Contact Ids */
  contactIds?: number[] | null;
}

export interface SeoMetadataDto {
  /**
   * Meta Title
   * @example "string"
   */
  metaTitle?: string | null;
  /**
   * Meta Description
   * @example "string"
   */
  metaDescription?: string | null;
  /**
   * Canonical Url
   * @example "string"
   */
  canonicalUrl?: string | null;
  /**
   * Open Graph Title
   * @example "string"
   */
  openGraphTitle?: string | null;
  /**
   * Open Graph Description
   * @example "string"
   */
  openGraphDescription?: string | null;
  /**
   * Open Graph Image Url
   * @example "string"
   */
  openGraphImageUrl?: string | null;
  /**
   * Robots
   * @example "string"
   */
  robots?: string | null;
  /**
   * Keywords
   * @example ["string1","string2"]
   */
  keywords?: string[] | null;
}

export interface SequenceCreateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language: string;
  /**
   * Stop On Reply
   * @example true
   */
  stopOnReply?: boolean;
  /**
   * Use Contact Time Zone
   * @example true
   */
  useContactTimeZone?: boolean;
  /**
   * Time Zone
   * @format int32
   * @example 1
   */
  timeZone?: number;
  enrollment?: SequenceEnrollmentConfig;
  utmParameters?: Utms;
  /** Steps */
  steps?: SequenceStepCreateDto[];
}

export interface SequenceDeliveryDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Sequence Id
   * @format int32
   * @example 1
   */
  sequenceId?: number;
  /**
   * Sequence Enrollment Id
   * @format int32
   * @example 1
   */
  sequenceEnrollmentId?: number;
  sequenceEnrollment?: SequenceEnrollmentDetailsDto;
  /**
   * Sequence Step Id
   * @format int32
   * @example 1
   */
  sequenceStepId?: number;
  sequenceStep?: SequenceStepDetailsDto;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number;
  contact?: ContactDetailsDto;
  /**
   * Status
   * @example "Scheduled"
   */
  status?: "Scheduled" | "Sent" | "Failed" | "Skipped";
  /**
   * Scheduled At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  scheduledAt?: string | null;
  /**
   * Sent At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  sentAt?: string | null;
  /**
   * Skip Reason
   * @example "string"
   */
  skipReason?: string | null;
  /**
   * Error Message
   * @example "string"
   */
  errorMessage?: string | null;
  /**
   * Email Log Id
   * @format int32
   * @example 1
   */
  emailLogId?: number | null;
  emailLog?: ContactEmailCommunicationDetailsDto;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
}

export interface SequenceDetailsDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language: string;
  /**
   * Stop On Reply
   * @example true
   */
  stopOnReply?: boolean;
  /**
   * Use Contact Time Zone
   * @example true
   */
  useContactTimeZone?: boolean;
  /**
   * Time Zone
   * @format int32
   * @example 1
   */
  timeZone?: number;
  enrollment?: SequenceEnrollmentConfig;
  utmParameters?: Utms;
  /** Steps */
  steps?: SequenceStepDetailsDto[];
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Status
   * @example "Draft"
   */
  status?: "Draft" | "Active" | "Paused" | "Archived";
  /**
   * Last Activated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  lastActivatedAt?: string | null;
  /**
   * Last Paused At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  lastPausedAt?: string | null;
  /**
   * Archived At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  archivedAt?: string | null;
  /**
   * Active Enrollment Count
   * @format int32
   * @example 1
   */
  activeEnrollmentCount?: number;
  /**
   * Completed Enrollment Count
   * @format int32
   * @example 1
   */
  completedEnrollmentCount?: number;
  /**
   * Exited Enrollment Count
   * @format int32
   * @example 1
   */
  exitedEnrollmentCount?: number;
  /**
   * Sent Count
   * @format int32
   * @example 1
   */
  sentCount?: number;
  /**
   * Failed Count
   * @format int32
   * @example 1
   */
  failedCount?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
}

export interface SequenceDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: SequenceDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, SequenceDetailsDto>;
}

export interface SequenceEnrollmentConfig {
  /**
   * Modes
   * @example ["string1","string2"]
   */
  modes?: string[];
  /** Include Segment Ids */
  includeSegmentIds?: number[] | null;
  /** Exclude Segment Ids */
  excludeSegmentIds?: number[] | null;
  /**
   * Reentry Policy
   * @example "OnceEver"
   */
  reentryPolicy?: "OnceEver" | "AllowAfterCompletion" | "Always";
}

export interface SequenceEnrollmentCreateDto {
  /** Contact Ids */
  contactIds: number[];
  /**
   * Enrollment Reason
   * @example "string"
   */
  enrollmentReason?: string | null;
  /**
   * Template Arguments
   * @example {"key1":"value1","key2":"value2"}
   */
  templateArguments?: Record<string, string>;
}

export interface SequenceEnrollmentDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Sequence Id
   * @format int32
   * @example 1
   */
  sequenceId?: number;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number;
  contact?: ContactDetailsDto;
  /**
   * Status
   * @example "Active"
   */
  status?: "Active" | "Completed" | "Exited";
  /**
   * Last Completed Step Id
   * @format int32
   * @example 1
   */
  lastCompletedStepId?: number | null;
  lastCompletedStep?: SequenceStepDetailsDto;
  /**
   * Entered At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  enteredAt?: string;
  /**
   * Completed At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  completedAt?: string | null;
  /**
   * Exited At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  exitedAt?: string | null;
  /**
   * Exit Reason
   * @example "None"
   */
  exitReason?:
    | "None"
    | "Completed"
    | "Failed"
    | "Unsubscribed"
    | "ReplyStopped"
    | "ManuallyRemoved"
    | "Archived"
    | "ExcludedBySegment";
  /**
   * Enrollment Source
   * @example "Manual"
   */
  enrollmentSource?: "Manual" | "Api" | "Segment" | "Migration";
  /**
   * Enrollment Reason
   * @example "string"
   */
  enrollmentReason?: string | null;
  /**
   * Template Arguments
   * @example {"key1":"value1","key2":"value2"}
   */
  templateArguments?: Record<string, string>;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /** Steps */
  steps?: EnrollmentStepTimelineEntryDto[] | null;
}

export interface SequenceEnrollmentStopDto {
  /** Enrollment Ids */
  enrollmentIds: number[];
}

export interface SequenceStatisticsDto {
  /**
   * Active Enrollment Count
   * @format int32
   * @example 1
   */
  activeEnrollmentCount?: number;
  /**
   * Completed Enrollment Count
   * @format int32
   * @example 1
   */
  completedEnrollmentCount?: number;
  /**
   * Exited Enrollment Count
   * @format int32
   * @example 1
   */
  exitedEnrollmentCount?: number;
  /**
   * Sent Count
   * @format int32
   * @example 1
   */
  sentCount?: number;
  /**
   * Failed Count
   * @format int32
   * @example 1
   */
  failedCount?: number;
  /**
   * Steps Count
   * @format int32
   * @example 1
   */
  stepsCount?: number;
}

export interface SequenceStepCreateDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Email Template Id
   * @format int32
   * @example 1
   */
  emailTemplateId: number;
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name: string;
  /**
   * Type
   * @example "Email"
   */
  type?: "Email";
  timing: SequenceStepTiming;
}

export interface SequenceStepDelay {
  /**
   * Value
   * @format int32
   * @example 1
   */
  value?: number;
  /**
   * Unit
   * @example "string"
   */
  unit?: string;
}

export interface SequenceStepDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Sequence Id
   * @format int32
   * @example 1
   */
  sequenceId?: number;
  /**
   * Email Template Id
   * @format int32
   * @example 1
   */
  emailTemplateId?: number;
  /**
   * Name
   * @example "string"
   */
  name?: string;
  /**
   * Type
   * @example "Email"
   */
  type?: "Email";
  timing?: SequenceStepTiming;
  /**
   * Scheduled Count
   * @format int32
   * @example 1
   */
  scheduledCount?: number;
  /**
   * Sent Count
   * @format int32
   * @example 1
   */
  sentCount?: number;
  /**
   * Failed Count
   * @format int32
   * @example 1
   */
  failedCount?: number;
  /**
   * Skipped Count
   * @format int32
   * @example 1
   */
  skippedCount?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
}

export interface SequenceStepTiming {
  delay?: SequenceStepDelay;
  /**
   * Send At
   * @example "string"
   */
  sendAt?: string | null;
  /**
   * Allowed Week Days
   * @example ["string1","string2"]
   */
  allowedWeekDays?: string[] | null;
}

export interface SequenceUpdateDto {
  /**
   * Name
   * @minLength 1
   * @example "string"
   */
  name?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Language
   * @minLength 1
   * @example "string"
   */
  language?: string | null;
  /**
   * Stop On Reply
   * @example true
   */
  stopOnReply?: boolean | null;
  /**
   * Use Contact Time Zone
   * @example true
   */
  useContactTimeZone?: boolean | null;
  /**
   * Time Zone
   * @format int32
   * @example 1
   */
  timeZone?: number | null;
  enrollment?: SequenceEnrollmentConfig;
  utmParameters?: Utms;
  /** Steps */
  steps?: SequenceStepCreateDto[] | null;
}

export interface SettingCreateDto {
  /**
   * Key
   * @minLength 1
   * @maxLength 255
   * @example "string"
   */
  key: string;
  /**
   * Value
   * @example "string"
   */
  value?: string | null;
  /**
   * User Id
   * @example "string"
   */
  userId?: string | null;
  /**
   * Language
   * @maxLength 10
   * @example "string"
   */
  language?: string | null;
}

export interface SettingDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Key
   * @example "string"
   */
  key?: string;
  /**
   * Value
   * @example "string"
   */
  value?: string | null;
  /**
   * User Id
   * @example "string"
   */
  userId?: string | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Required
   * @example true
   */
  required?: boolean;
  /**
   * Type
   * @example "string"
   */
  type?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
}

export interface SettingDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: SettingDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, SettingDetailsDto>;
}

export interface SettingImportDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string | null;
  /**
   * Updated At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  updatedAt?: string | null;
  /**
   * Created By Ip
   * @example "string"
   */
  createdByIp?: string | null;
  /**
   * Created By Id
   * @example "string"
   */
  createdById?: string | null;
  /**
   * Created By User Agent
   * @example "string"
   */
  createdByUserAgent?: string | null;
  /**
   * Updated By Ip
   * @example "string"
   */
  updatedByIp?: string | null;
  /**
   * Updated By Id
   * @example "string"
   */
  updatedById?: string | null;
  /**
   * Updated By User Agent
   * @example "string"
   */
  updatedByUserAgent?: string | null;
  /**
   * Key
   * @minLength 1
   * @maxLength 255
   * @example "string"
   */
  key: string;
  /**
   * Value
   * @example "string"
   */
  value?: string | null;
  /**
   * User Id
   * @example "string"
   */
  userId?: string | null;
  /**
   * Language
   * @maxLength 10
   * @example "string"
   */
  language?: string | null;
}

export interface SettingUpdateDto {
  /**
   * Value
   * @example "string"
   */
  value?: string | null;
}

export interface SettingValueDto {
  /**
   * Key
   * @example "string"
   */
  key?: string;
  /**
   * Value
   * @example "string"
   */
  value?: string | null;
  /**
   * User Id
   * @example "string"
   */
  userId?: string | null;
  /**
   * Language
   * @example "string"
   */
  language?: string | null;
  /**
   * Required
   * @example true
   */
  required?: boolean;
  /**
   * Type
   * @example "string"
   */
  type?: string | null;
  /**
   * Description
   * @example "string"
   */
  description?: string | null;
}

export interface StepEmailPreviewDto {
  /**
   * Subject
   * @example "string"
   */
  subject?: string;
  /**
   * Body
   * @example "string"
   */
  body?: string | null;
  /**
   * From Email
   * @example "string"
   */
  fromEmail?: string;
  /**
   * From Name
   * @example "string"
   */
  fromName?: string;
}

export interface StringStringValuesKeyValuePair {
  key?: string;
  value?: string[];
}

export interface TaskDetailsDto {
  /**
   * Name
   * @example "string"
   */
  name?: string;
  /**
   * Cron Schedule
   * @example "string"
   */
  cronSchedule?: string;
  /**
   * Retry Count
   * @format int32
   * @example 1
   */
  retryCount?: number;
  /**
   * Retry Interval
   * @format int32
   * @example 1
   */
  retryInterval?: number;
  /**
   * Is Running
   * @example true
   */
  isRunning?: boolean;
}

export interface TaskExecutionDto {
  /**
   * Name
   * @example "string"
   */
  name?: string;
  /**
   * Completed
   * @example true
   */
  completed?: boolean;
}

export interface TaskExecutionLogDetailsDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Task Name
   * @example "string"
   */
  taskName?: string;
  /**
   * Scheduled Execution Time
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  scheduledExecutionTime?: string;
  /**
   * Actual Execution Time
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  actualExecutionTime?: string;
  /**
   * Status
   * @example "string"
   */
  status?: string;
  /**
   * Retry Count
   * @format int32
   * @example 1
   */
  retryCount?: number;
  /**
   * Result
   * @example "string"
   */
  result?: string | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Triggered By
   * @example "string"
   */
  triggeredBy?: string;
  duration?: TimeSpan;
}

export interface TimeSpan {
  /** @format int64 */
  ticks?: number;
  /** @format int32 */
  days?: number;
  /** @format int32 */
  hours?: number;
  /** @format int32 */
  milliseconds?: number;
  /** @format int32 */
  microseconds?: number;
  /** @format int32 */
  nanoseconds?: number;
  /** @format int32 */
  minutes?: number;
  /** @format int32 */
  seconds?: number;
  /** @format double */
  totalDays?: number;
  /** @format double */
  totalHours?: number;
  /** @format double */
  totalMilliseconds?: number;
  /** @format double */
  totalMicroseconds?: number;
  /** @format double */
  totalNanoseconds?: number;
  /** @format double */
  totalMinutes?: number;
  /** @format double */
  totalSeconds?: number;
}

export interface TokenExchangeDto {
  /**
   * Microsoft Token
   * @minLength 1
   * @example "string"
   */
  microsoftToken: string;
}

export interface TopAccountDto {
  /**
   * Account Id
   * @format int32
   * @example 1
   */
  accountId?: number;
  /**
   * Name
   * @example "string"
   */
  name?: string;
  /**
   * Revenue
   * @format double
   * @example 1
   */
  revenue?: number;
  /**
   * Change Pct
   * @format double
   * @example 1
   */
  changePct?: number | null;
}

export interface TopAuthorDto {
  /**
   * Author
   * @example "string"
   */
  author?: string;
  /**
   * Count
   * @format int32
   * @example 1
   */
  count?: number;
  /**
   * Change Pct
   * @format double
   * @example 1
   */
  changePct?: number | null;
}

export interface TopContentItemDto {
  /**
   * Content Id
   * @format int32
   * @example 1
   */
  contentId?: number;
  /**
   * Title
   * @example "string"
   */
  title?: string;
  /**
   * Comment Count
   * @format int32
   * @example 1
   */
  commentCount?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
}

export interface UnsubscribeDetailsDto {
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number;
  /**
   * Reason
   * @example "string"
   */
  reason?: string;
  /**
   * Source
   * @example "string"
   */
  source?: string;
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  contact?: ContactDetailsDto;
}

export interface UnsubscribeDetailsDtoInt32SyncResponseDto {
  /** Items */
  items?: UnsubscribeDetailsDto[];
  /** Deleted */
  deleted?: number[];
  /** Base Items */
  baseItems?: Record<string, UnsubscribeDetailsDto>;
}

export interface UnsubscribeDto {
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number;
  /**
   * Reason
   * @example "string"
   */
  reason?: string;
  /**
   * Source
   * @example "string"
   */
  source?: string;
}

export interface UnsubscribeImportDto {
  /**
   * Id
   * @format int32
   * @example 1
   */
  id?: number | null;
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Reason
   * @example "string"
   */
  reason?: string;
  /**
   * Contact Id
   * @format int32
   * @example 1
   */
  contactId?: number;
  /**
   * Contact Email
   * @example "string"
   */
  contactEmail?: string;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string | null;
}

export interface UserCreateDto {
  /**
   * Email
   * @minLength 1
   * @example "string"
   */
  email: string;
  /**
   * User Name
   * @minLength 1
   * @example "string"
   */
  userName: string;
  /**
   * Display Name
   * @minLength 1
   * @example "string"
   */
  displayName: string;
  /** Data */
  data?: Record<string, any>;
  /**
   * Password
   * @example "string"
   */
  password?: string | null;
  /**
   * Generate Password
   * @example true
   */
  generatePassword?: boolean;
  /**
   * Send Password Email
   * @example true
   */
  sendPasswordEmail?: boolean;
  /**
   * Language
   * @example "string"
   */
  language?: string;
}

export interface UserDetailsDto {
  /**
   * Email
   * @minLength 1
   * @example "string"
   */
  email: string;
  /**
   * User Name
   * @minLength 1
   * @example "string"
   */
  userName: string;
  /**
   * Display Name
   * @minLength 1
   * @example "string"
   */
  displayName: string;
  /** Data */
  data?: Record<string, any>;
  /**
   * Id
   * @example "string"
   */
  id?: string;
  /**
   * Created At
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  createdAt?: string;
  /**
   * Last Time Logged In
   * @format date-time
   * @pattern ^(\d{4})-(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])T(2[0-4]|1[0-9]|0[1-9]):(2[0-4]|1[0-9]|0[1-9]):([1-5]?0[0-9]).(\d{7})Z$
   * @example "2023-04-18T12:00:00.0000000Z"
   */
  lastTimeLoggedIn?: string | null;
  /**
   * Avatar Url
   * @example "string"
   */
  avatarUrl?: string;
}

export interface UserUpdateDto {
  /**
   * Email
   * @example "string"
   */
  email?: string | null;
  /**
   * User Name
   * @example "string"
   */
  userName?: string | null;
  /**
   * Display Name
   * @example "string"
   */
  displayName?: string | null;
  /**
   * Avatar Url
   * @example "string"
   */
  avatarUrl?: string | null;
  /** Data */
  data?: Record<string, any>;
  /**
   * Password
   * @example "string"
   */
  password?: string | null;
  /**
   * Generate Password
   * @example true
   */
  generatePassword?: boolean;
  /**
   * Send Password Email
   * @example true
   */
  sendPasswordEmail?: boolean;
  /**
   * Language
   * @example "string"
   */
  language?: string;
}

export interface Utms {
  /**
   * Source
   * @example "string"
   */
  source?: string | null;
  /**
   * Medium
   * @example "string"
   */
  medium?: string | null;
  /**
   * Campaign
   * @example "string"
   */
  campaign?: string | null;
  /**
   * Content
   * @example "string"
   */
  content?: string | null;
  /**
   * Term
   * @example "string"
   */
  term?: string | null;
  /**
   * Id
   * @example "string"
   */
  id?: string | null;
}

export interface VersionDto {
  /**
   * Version
   * @example "string"
   */
  version?: string | null;
  /**
   * Ip
   * @example "string"
   */
  ip?: string | null;
  /**
   * I Pv4
   * @example "string"
   */
  iPv4?: string | null;
  /**
   * I Pv6
   * @example "string"
   */
  iPv6?: string | null;
  /** Headers */
  headers?: StringStringValuesKeyValuePair[];
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title LeadCMS API
 * @version 1.5.13.0
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsTagsList
     * @request GET:/api/accounts/tags
     * @secure
     */
    accountsTagsList: (params: RequestParams = {}) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/accounts/tags`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsCommentsList
     * @request GET:/api/accounts/{id}/comments
     * @secure
     */
    accountsCommentsList: (id: number, params: RequestParams = {}) =>
      this.request<CommentDetailsDto[], void | ProblemDetails>({
        path: `/api/accounts/${id}/comments`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsCommentsCreate
     * @request POST:/api/accounts/{id}/comments
     * @secure
     */
    accountsCommentsCreate: (
      id: number,
      data: CommentCreateBaseDto,
      params: RequestParams = {},
    ) =>
      this.request<CommentDetailsDto, void | ProblemDetails>({
        path: `/api/accounts/${id}/comments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsSyncList
     * @request GET:/api/accounts/sync
     * @secure
     */
    accountsSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        AccountDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/accounts/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsImportCreate
     * @request POST:/api/accounts/import
     * @secure
     */
    accountsImportCreate: (
      data: AccountImportDto[],
      params: RequestParams = {},
    ) =>
      this.request<ImportResult, void | ProblemDetails>({
        path: `/api/accounts/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsDetail
     * @request GET:/api/accounts/{id}
     * @secure
     */
    accountsDetail: (id: number, params: RequestParams = {}) =>
      this.request<AccountDetailsDto, void | ProblemDetails>({
        path: `/api/accounts/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsPartialUpdate
     * @request PATCH:/api/accounts/{id}
     * @secure
     */
    accountsPartialUpdate: (
      id: number,
      data: AccountUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<AccountDetailsDto, void | ProblemDetails>({
        path: `/api/accounts/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsDelete
     * @request DELETE:/api/accounts/{id}
     * @secure
     */
    accountsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/accounts/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsCreate
     * @request POST:/api/accounts
     * @secure
     */
    accountsCreate: (data: AccountCreateDto, params: RequestParams = {}) =>
      this.request<AccountDetailsDto, void | ProblemDetails>({
        path: `/api/accounts`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsList
     * @request GET:/api/accounts
     * @secure
     */
    accountsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<AccountDetailsDto[], void | ProblemDetails>({
        path: `/api/accounts`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsBulkDelete
     * @request DELETE:/api/accounts/bulk
     * @secure
     */
    accountsBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/accounts/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Accounts
     * @name AccountsExportList
     * @request GET:/api/accounts/export
     * @secure
     */
    accountsExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/accounts/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ActivityLogs
     * @name ActivityLogsList
     * @request GET:/api/activity-logs
     * @secure
     */
    activityLogsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ActivityLogDetailsDto[], void | ProblemDetails>({
        path: `/api/activity-logs`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsCreate
     * @request POST:/api/campaigns
     * @secure
     */
    campaignsCreate: (data: CampaignCreateDto, params: RequestParams = {}) =>
      this.request<CampaignDetailsDto, void | ProblemDetails>({
        path: `/api/campaigns`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsList
     * @request GET:/api/campaigns
     * @secure
     */
    campaignsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<CampaignDetailsDto[], void | ProblemDetails>({
        path: `/api/campaigns`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsPartialUpdate
     * @request PATCH:/api/campaigns/{id}
     * @secure
     */
    campaignsPartialUpdate: (
      id: number,
      data: CampaignUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<CampaignDetailsDto, void | ProblemDetails>({
        path: `/api/campaigns/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsDetail
     * @request GET:/api/campaigns/{id}
     * @secure
     */
    campaignsDetail: (id: number, params: RequestParams = {}) =>
      this.request<CampaignDetailsDto, void | ProblemDetails>({
        path: `/api/campaigns/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsDelete
     * @request DELETE:/api/campaigns/{id}
     * @secure
     */
    campaignsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/campaigns/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsLaunchCreate
     * @request POST:/api/campaigns/{id}/launch
     * @secure
     */
    campaignsLaunchCreate: (
      id: number,
      data: CampaignLaunchDto,
      params: RequestParams = {},
    ) =>
      this.request<CampaignDetailsDto, ProblemDetails>({
        path: `/api/campaigns/${id}/launch`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsCancelCreate
     * @request POST:/api/campaigns/{id}/cancel
     * @secure
     */
    campaignsCancelCreate: (id: number, params: RequestParams = {}) =>
      this.request<CampaignDetailsDto, ProblemDetails>({
        path: `/api/campaigns/${id}/cancel`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsPauseCreate
     * @request POST:/api/campaigns/{id}/pause
     * @secure
     */
    campaignsPauseCreate: (id: number, params: RequestParams = {}) =>
      this.request<CampaignDetailsDto, ProblemDetails>({
        path: `/api/campaigns/${id}/pause`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsResumeCreate
     * @request POST:/api/campaigns/{id}/resume
     * @secure
     */
    campaignsResumeCreate: (id: number, params: RequestParams = {}) =>
      this.request<CampaignDetailsDto, ProblemDetails>({
        path: `/api/campaigns/${id}/resume`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsStatisticsList
     * @request GET:/api/campaigns/{id}/statistics
     * @secure
     */
    campaignsStatisticsList: (id: number, params: RequestParams = {}) =>
      this.request<CampaignStatisticsDto, ProblemDetails>({
        path: `/api/campaigns/${id}/statistics`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsPreviewCreate
     * @request POST:/api/campaigns/preview
     * @secure
     */
    campaignsPreviewCreate: (
      data: CampaignPreviewRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<CampaignPreviewResultDto, ProblemDetails>({
        path: `/api/campaigns/preview`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsRecipientsList
     * @request GET:/api/campaigns/{id}/recipients
     * @secure
     */
    campaignsRecipientsList: (
      id: number,
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<CampaignRecipientDetailsDto[], ProblemDetails>({
        path: `/api/campaigns/${id}/recipients`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsBulkDelete
     * @request DELETE:/api/campaigns/bulk
     * @secure
     */
    campaignsBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/campaigns/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsExportList
     * @request GET:/api/campaigns/export
     * @secure
     */
    campaignsExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/campaigns/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Campaigns
     * @name CampaignsSyncList
     * @request GET:/api/campaigns/sync
     * @secure
     */
    campaignsSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/campaigns/sync`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsList
     * @request GET:/api/comments
     * @secure
     */
    commentsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<CommentDetailsDto[], void | ProblemDetails>({
        path: `/api/comments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsCreate
     * @request POST:/api/comments
     * @secure
     */
    commentsCreate: (data: CommentCreateDto, params: RequestParams = {}) =>
      this.request<CommentDetailsDto, void | ProblemDetails>({
        path: `/api/comments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsWithStatisticsList
     * @request GET:/api/comments/with-statistics
     * @secure
     */
    commentsWithStatisticsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<CommentsWithStatisticsDto, ProblemDetails>({
        path: `/api/comments/with-statistics`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsDetail
     * @request GET:/api/comments/{id}
     * @secure
     */
    commentsDetail: (id: number, params: RequestParams = {}) =>
      this.request<CommentDetailsDto, void | ProblemDetails>({
        path: `/api/comments/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsPartialUpdate
     * @request PATCH:/api/comments/{id}
     * @secure
     */
    commentsPartialUpdate: (
      id: number,
      data: CommentUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<CommentDetailsDto, void | ProblemDetails>({
        path: `/api/comments/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsDelete
     * @request DELETE:/api/comments/{id}
     * @secure
     */
    commentsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/comments/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsTagsList
     * @request GET:/api/comments/tags
     * @secure
     */
    commentsTagsList: (
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<string[], ProblemDetails>({
        path: `/api/comments/tags`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsTranslationDraftDetail
     * @request GET:/api/comments/{id}/translation-draft/{language}
     * @secure
     */
    commentsTranslationDraftDetail: (
      id: number,
      language: string,
      query?: {
        /** @default "EmptyCopy" */
        transformer?: "EmptyCopy" | "KeepOriginal";
      },
      params: RequestParams = {},
    ) =>
      this.request<CommentDetailsDto, void | ProblemDetails>({
        path: `/api/comments/${id}/translation-draft/${language}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsTranslationsList
     * @request GET:/api/comments/{id}/translations
     * @secure
     */
    commentsTranslationsList: (id: number, params: RequestParams = {}) =>
      this.request<CommentDetailsDto[], void | ProblemDetails>({
        path: `/api/comments/${id}/translations`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsSyncList
     * @request GET:/api/comments/sync
     * @secure
     */
    commentsSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        CommentDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/comments/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsImportCreate
     * @request POST:/api/comments/import
     * @secure
     */
    commentsImportCreate: (
      data: CommentImportDto[],
      params: RequestParams = {},
    ) =>
      this.request<ImportResult, void | ProblemDetails>({
        path: `/api/comments/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsBulkDelete
     * @request DELETE:/api/comments/bulk
     * @secure
     */
    commentsBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/comments/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsExportList
     * @request GET:/api/comments/export
     * @secure
     */
    commentsExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/comments/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Config
     * @name ConfigList
     * @request GET:/api/config
     * @secure
     */
    configList: (params: RequestParams = {}) =>
      this.request<ConfigDto, any>({
        path: `/api/config`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsDetail
     * @request GET:/api/contacts/{id}
     * @secure
     */
    contactsDetail: (id: number, params: RequestParams = {}) =>
      this.request<ContactDetailsDto, void | ProblemDetails>({
        path: `/api/contacts/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsPartialUpdate
     * @request PATCH:/api/contacts/{id}
     * @secure
     */
    contactsPartialUpdate: (
      id: number,
      data: ContactUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<ContactDetailsDto, void | ProblemDetails>({
        path: `/api/contacts/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsDelete
     * @request DELETE:/api/contacts/{id}
     * @secure
     */
    contactsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/contacts/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsList
     * @request GET:/api/contacts
     * @secure
     */
    contactsList: (
      query?: {
        query?: string;
        /**
         * Filter contacts to the evaluated members of the specified segment before applying the remaining query filters
         * @format int32
         */
        segmentId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ContactDetailsDto[], void | ProblemDetails>({
        path: `/api/contacts`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsCreate
     * @request POST:/api/contacts
     * @secure
     */
    contactsCreate: (data: ContactCreateDto, params: RequestParams = {}) =>
      this.request<ContactDetailsDto, void | ProblemDetails>({
        path: `/api/contacts`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsTagsList
     * @request GET:/api/contacts/tags
     * @secure
     */
    contactsTagsList: (
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/contacts/tags`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsExportList
     * @request GET:/api/contacts/export
     * @secure
     */
    contactsExportList: (
      query?: {
        query?: string;
        /**
         * Filter contacts to the evaluated members of the specified segment before applying the remaining query filters
         * @format int32
         */
        segmentId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/contacts/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsEmailCommunicationsList
     * @request GET:/api/contacts/{id}/email-communications
     * @secure
     */
    contactsEmailCommunicationsList: (id: number, params: RequestParams = {}) =>
      this.request<
        ContactEmailCommunicationListItemDto[],
        void | ProblemDetails
      >({
        path: `/api/contacts/${id}/email-communications`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsEmailCommunicationsDetail
     * @request GET:/api/contacts/{id}/email-communications/{emailLogId}
     * @secure
     */
    contactsEmailCommunicationsDetail: (
      id: number,
      emailLogId: number,
      params: RequestParams = {},
    ) =>
      this.request<ContactEmailCommunicationDetailsDto, void | ProblemDetails>({
        path: `/api/contacts/${id}/email-communications/${emailLogId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsEmailCommunicationsStatsList
     * @request GET:/api/contacts/{id}/email-communications/stats
     * @secure
     */
    contactsEmailCommunicationsStatsList: (
      id: number,
      query?: {
        /** @format date-time */
        from?: string;
        /** @format date-time */
        to?: string;
        /** @default "Day" */
        groupBy?: "Day" | "Week" | "Month";
      },
      params: RequestParams = {},
    ) =>
      this.request<ContactEmailCommunicationStatsDto, void | ProblemDetails>({
        path: `/api/contacts/${id}/email-communications/stats`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsCommentsList
     * @request GET:/api/contacts/{id}/comments
     * @secure
     */
    contactsCommentsList: (id: number, params: RequestParams = {}) =>
      this.request<CommentDetailsDto[], void | ProblemDetails>({
        path: `/api/contacts/${id}/comments`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsCommentsCreate
     * @request POST:/api/contacts/{id}/comments
     * @secure
     */
    contactsCommentsCreate: (
      id: number,
      data: CommentCreateBaseDto,
      params: RequestParams = {},
    ) =>
      this.request<CommentDetailsDto, void | ProblemDetails>({
        path: `/api/contacts/${id}/comments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsSyncList
     * @request GET:/api/contacts/sync
     * @secure
     */
    contactsSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
        /**
         * Filter contacts to the evaluated members of the specified segment before applying the remaining query filters
         * @format int32
         */
        segmentId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        ContactDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/contacts/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsImportCreate
     * @request POST:/api/contacts/import
     * @secure
     */
    contactsImportCreate: (
      data: ContactImportDto[],
      params: RequestParams = {},
    ) =>
      this.request<ImportResult, void | ProblemDetails>({
        path: `/api/contacts/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contacts
     * @name ContactsBulkDelete
     * @request DELETE:/api/contacts/bulk
     * @secure
     */
    contactsBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/contacts/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentList
     * @request GET:/api/content
     * @secure
     */
    contentList: (
      query?: {
        query?: string;
        /**
         * Include translation mappings in the response
         * @default false
         */
        includeTranslations?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ContentDetailsDto[], void | ProblemDetails>({
        path: `/api/content`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentCreate
     * @request POST:/api/content
     * @secure
     */
    contentCreate: (data: ContentCreateDto, params: RequestParams = {}) =>
      this.request<ContentDetailsDto, void | ProblemDetails>({
        path: `/api/content`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentWithStatisticsList
     * @request GET:/api/content/with-statistics
     * @secure
     */
    contentWithStatisticsList: (
      query?: {
        query?: string;
        /**
         * Include translation mappings in the response
         * @default false
         */
        includeTranslations?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ContentWithStatisticsDto, ProblemDetails>({
        path: `/api/content/with-statistics`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentDetail
     * @request GET:/api/content/{id}
     * @secure
     */
    contentDetail: (
      id: number,
      query?: {
        /**
         * Include translation mappings in the response
         * @default false
         */
        includeTranslations?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ContentDetailsDto, void | ProblemDetails>({
        path: `/api/content/${id}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentPartialUpdate
     * @request PATCH:/api/content/{id}
     * @secure
     */
    contentPartialUpdate: (
      id: number,
      data: ContentUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<ContentDetailsDto, void | ProblemDetails>({
        path: `/api/content/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentUpdate
     * @request PUT:/api/content/{id}
     * @secure
     */
    contentUpdate: (
      id: number,
      data: ContentCreateDto,
      params: RequestParams = {},
    ) =>
      this.request<ContentDetailsDto, void | ProblemDetails>({
        path: `/api/content/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentDelete
     * @request DELETE:/api/content/{id}
     * @secure
     */
    contentDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/content/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentTagsList
     * @request GET:/api/content/tags
     * @secure
     */
    contentTagsList: (
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/content/tags`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentCategoriesList
     * @request GET:/api/content/categories
     * @secure
     */
    contentCategoriesList: (
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/content/categories`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentAuthorsList
     * @request GET:/api/content/authors
     * @secure
     */
    contentAuthorsList: (
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/content/authors`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentCategoriesDetail
     * @request GET:/api/content/categories/{contentType}
     * @secure
     */
    contentCategoriesDetail: (
      contentType: string,
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/content/categories/${contentType}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentAuthorsDetail
     * @request GET:/api/content/authors/{contentType}
     * @secure
     */
    contentAuthorsDetail: (
      contentType: string,
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/content/authors/${contentType}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentTagsDetail
     * @request GET:/api/content/tags/{contentType}
     * @secure
     */
    contentTagsDetail: (
      contentType: string,
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/content/tags/${contentType}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentCommentsList
     * @request GET:/api/content/{id}/comments
     * @secure
     */
    contentCommentsList: (id: number, params: RequestParams = {}) =>
      this.request<CommentDetailsDto[], void | ProblemDetails>({
        path: `/api/content/${id}/comments`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentCommentsCreate
     * @request POST:/api/content/{id}/comments
     * @secure
     */
    contentCommentsCreate: (
      id: number,
      data: CommentCreateBaseDto,
      params: RequestParams = {},
    ) =>
      this.request<CommentDetailsDto, void | ProblemDetails>({
        path: `/api/content/${id}/comments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentSyncList
     * @request GET:/api/content/sync
     * @secure
     */
    contentSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
        /**
         * Include base versions of modified items for three-way merge support
         * @default false
         */
        includeBase?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        ContentDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/content/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentDraftPartialUpdate
     * @request PATCH:/api/content/{id}/draft
     * @secure
     */
    contentDraftPartialUpdate: (
      id: number,
      data: ContentUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/content/${id}/draft`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentDraftCreate
     * @request POST:/api/content/draft
     * @secure
     */
    contentDraftCreate: (data: ContentUpdateDto, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/content/draft`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentTranslationDraftDetail
     * @request GET:/api/content/{id}/translation-draft/{language}
     * @secure
     */
    contentTranslationDraftDetail: (
      id: number,
      language: string,
      query?: {
        /** @default "EmptyCopy" */
        transformer?: "EmptyCopy" | "KeepOriginal";
      },
      params: RequestParams = {},
    ) =>
      this.request<ContentDetailsDto, void | ProblemDetails>({
        path: `/api/content/${id}/translation-draft/${language}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentTranslationsList
     * @request GET:/api/content/{id}/translations
     * @secure
     */
    contentTranslationsList: (id: number, params: RequestParams = {}) =>
      this.request<ContentDetailsDto[], void | ProblemDetails>({
        path: `/api/content/${id}/translations`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentChangeLogList
     * @request GET:/api/content/{id}/change-log
     * @secure
     */
    contentChangeLogList: (
      id: number,
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        ContentUpdateDtoChangeLogDetailsDto[],
        void | ProblemDetails
      >({
        path: `/api/content/${id}/change-log`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentMdxComponentsDetail
     * @request GET:/api/content/mdx-components/{contentType}
     * @secure
     */
    contentMdxComponentsDetail: (
      contentType: string,
      query?: {
        /** @default true */
        useCache?: boolean;
        /**
         * @format int32
         * @default 1
         */
        maxCacheAgeHours?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<MdxComponentAnalysisDto, void | ProblemDetails>({
        path: `/api/content/mdx-components/${contentType}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentImportCreate
     * @request POST:/api/content/import
     * @secure
     */
    contentImportCreate: (
      data: ContentImportDto[],
      params: RequestParams = {},
    ) =>
      this.request<ImportResult, void | ProblemDetails>({
        path: `/api/content/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentBulkDelete
     * @request DELETE:/api/content/bulk
     * @secure
     */
    contentBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/content/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentExportList
     * @request GET:/api/content/export
     * @secure
     */
    contentExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/content/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentAiDraftCreate
     * @request POST:/api/content/ai-draft
     * @secure
     */
    contentAiDraftCreate: (
      data: ContentGenerationRequest,
      params: RequestParams = {},
    ) =>
      this.request<ContentCreateDto, any>({
        path: `/api/content/ai-draft`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentAiEditCreate
     * @request POST:/api/content/ai-edit
     * @secure
     */
    contentAiEditCreate: (
      data: ContentEditRequest,
      params: RequestParams = {},
    ) =>
      this.request<ContentCreateDto, any>({
        path: `/api/content/ai-edit`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentAiTranslationDraftDetail
     * @request GET:/api/content/{id}/ai-translation-draft/{language}
     * @secure
     */
    contentAiTranslationDraftDetail: (
      id: number,
      language: string,
      params: RequestParams = {},
    ) =>
      this.request<ContentDetailsDto, ProblemDetails>({
        path: `/api/content/${id}/ai-translation-draft/${language}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ContentTypes
     * @name ContentTypesList
     * @request GET:/api/content-types
     * @secure
     */
    contentTypesList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ContentTypeDetailsDto[], void | ProblemDetails>({
        path: `/api/content-types`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ContentTypes
     * @name ContentTypesCreate
     * @request POST:/api/content-types
     * @secure
     */
    contentTypesCreate: (
      data: ContentTypeCreateDto,
      params: RequestParams = {},
    ) =>
      this.request<ContentTypeDetailsDto, void | ProblemDetails>({
        path: `/api/content-types`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ContentTypes
     * @name ContentTypesDetail
     * @request GET:/api/content-types/{id}
     * @secure
     */
    contentTypesDetail: (id: number, params: RequestParams = {}) =>
      this.request<ContentTypeDetailsDto, void | ProblemDetails>({
        path: `/api/content-types/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ContentTypes
     * @name ContentTypesPartialUpdate
     * @request PATCH:/api/content-types/{id}
     * @secure
     */
    contentTypesPartialUpdate: (
      id: number,
      data: ContentTypeUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<ContentTypeDetailsDto, void | ProblemDetails>({
        path: `/api/content-types/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ContentTypes
     * @name ContentTypesDelete
     * @request DELETE:/api/content-types/{id}
     * @secure
     */
    contentTypesDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/content-types/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ContentTypes
     * @name ContentTypesSyncList
     * @request GET:/api/content-types/sync
     * @secure
     */
    contentTypesSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        ContentTypeDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/content-types/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ContentTypes
     * @name ContentTypesImportCreate
     * @request POST:/api/content-types/import
     * @secure
     */
    contentTypesImportCreate: (
      data: ContentTypeImportDto[],
      params: RequestParams = {},
    ) =>
      this.request<ImportResult, void | ProblemDetails>({
        path: `/api/content-types/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ContentTypes
     * @name ContentTypesBulkDelete
     * @request DELETE:/api/content-types/bulk
     * @secure
     */
    contentTypesBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/content-types/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ContentTypes
     * @name ContentTypesExportList
     * @request GET:/api/content-types/export
     * @secure
     */
    contentTypesExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/content-types/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Continents
     * @name ContinentsList
     * @request GET:/api/continents
     * @secure
     */
    continentsList: (params: RequestParams = {}) =>
      this.request<Record<string, string>, ProblemDetails>({
        path: `/api/continents`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Countries
     * @name CountriesList
     * @request GET:/api/countries
     * @secure
     */
    countriesList: (params: RequestParams = {}) =>
      this.request<Record<string, string>, ProblemDetails>({
        path: `/api/countries`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentAiCoverCreate
     * @request POST:/api/content/ai-cover
     * @secure
     */
    contentAiCoverCreate: (
      data: CoverImageGenerationRequest,
      params: RequestParams = {},
    ) =>
      this.request<MediaDetailsDto, ProblemDetails>({
        path: `/api/content/ai-cover`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Content
     * @name ContentAiCoverEditCreate
     * @request POST:/api/content/ai-cover/edit
     * @secure
     */
    contentAiCoverEditCreate: (
      data: CoverImageEditRequest,
      params: RequestParams = {},
    ) =>
      this.request<MediaDetailsDto, ProblemDetails>({
        path: `/api/content/ai-cover/edit`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Currencies
     * @name CurrenciesList
     * @request GET:/api/currencies
     * @secure
     */
    currenciesList: (params: RequestParams = {}) =>
      this.request<CurrencyInfoDto[], ProblemDetails>({
        path: `/api/currencies`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCrmMetricsList
     * @request GET:/api/dashboard/crm/metrics
     * @secure
     */
    dashboardCrmMetricsList: (
      query?: {
        /** @format date-time */
        From?: string;
        /** @format date-time */
        To?: string;
        Period?: string;
        Compare?: boolean;
        GroupBy?: "Day" | "Week" | "Month" | "Quarter" | "Year";
        CountryCode?:
          | "ZZ"
          | "AF"
          | "AL"
          | "AQ"
          | "DZ"
          | "AS"
          | "AD"
          | "AO"
          | "AG"
          | "AZ"
          | "AR"
          | "AU"
          | "AT"
          | "BS"
          | "BH"
          | "BD"
          | "AM"
          | "BB"
          | "BE"
          | "BM"
          | "BT"
          | "BO"
          | "BA"
          | "BW"
          | "BV"
          | "BR"
          | "BZ"
          | "IO"
          | "SB"
          | "VG"
          | "BN"
          | "BG"
          | "MM"
          | "BI"
          | "BY"
          | "KH"
          | "CM"
          | "CA"
          | "CV"
          | "KY"
          | "CF"
          | "LK"
          | "TD"
          | "CL"
          | "CN"
          | "TW"
          | "CX"
          | "CC"
          | "CO"
          | "KM"
          | "YT"
          | "CG"
          | "CD"
          | "CK"
          | "CR"
          | "HR"
          | "CU"
          | "CY"
          | "CZ"
          | "BJ"
          | "DK"
          | "DM"
          | "DO"
          | "EC"
          | "SV"
          | "GQ"
          | "ET"
          | "ER"
          | "EE"
          | "FO"
          | "FK"
          | "GS"
          | "FJ"
          | "FI"
          | "AX"
          | "FR"
          | "GF"
          | "PF"
          | "TF"
          | "DJ"
          | "GA"
          | "GE"
          | "GM"
          | "PS"
          | "DE"
          | "GH"
          | "GI"
          | "KI"
          | "GR"
          | "GL"
          | "GD"
          | "GP"
          | "GU"
          | "GT"
          | "GN"
          | "GY"
          | "HT"
          | "HM"
          | "VA"
          | "HN"
          | "HK"
          | "HU"
          | "IS"
          | "IN"
          | "ID"
          | "IR"
          | "IQ"
          | "IE"
          | "IL"
          | "IT"
          | "CI"
          | "JM"
          | "JP"
          | "KZ"
          | "JO"
          | "KE"
          | "KP"
          | "KR"
          | "KW"
          | "KG"
          | "LA"
          | "LB"
          | "LS"
          | "LV"
          | "LR"
          | "LY"
          | "LI"
          | "LT"
          | "LU"
          | "MO"
          | "MG"
          | "MW"
          | "MY"
          | "MV"
          | "ML"
          | "MT"
          | "MQ"
          | "MR"
          | "MU"
          | "MX"
          | "MC"
          | "MN"
          | "MD"
          | "ME"
          | "MS"
          | "MA"
          | "MZ"
          | "OM"
          | "NA"
          | "NR"
          | "NP"
          | "NL"
          | "CW"
          | "AW"
          | "SX"
          | "BQ"
          | "NC"
          | "VU"
          | "NZ"
          | "NI"
          | "NE"
          | "NG"
          | "NU"
          | "NF"
          | "NO"
          | "MP"
          | "UM"
          | "FM"
          | "MH"
          | "PW"
          | "PK"
          | "PA"
          | "PG"
          | "PY"
          | "PE"
          | "PH"
          | "PN"
          | "PL"
          | "PT"
          | "GW"
          | "TL"
          | "PR"
          | "QA"
          | "RE"
          | "RO"
          | "RU"
          | "RW"
          | "BL"
          | "SH"
          | "KN"
          | "AI"
          | "LC"
          | "MF"
          | "PM"
          | "VC"
          | "SM"
          | "ST"
          | "SA"
          | "SN"
          | "RS"
          | "SC"
          | "SL"
          | "SG"
          | "SK"
          | "VN"
          | "SI"
          | "SO"
          | "ZA"
          | "ZW"
          | "ES"
          | "SS"
          | "SD"
          | "EH"
          | "SR"
          | "SJ"
          | "SZ"
          | "SE"
          | "CH"
          | "SY"
          | "TJ"
          | "TH"
          | "TG"
          | "TK"
          | "TO"
          | "TT"
          | "AE"
          | "TN"
          | "TR"
          | "TM"
          | "TC"
          | "TV"
          | "UG"
          | "UA"
          | "MK"
          | "EG"
          | "GB"
          | "GG"
          | "JE"
          | "IM"
          | "TZ"
          | "US"
          | "VI"
          | "BF"
          | "UY"
          | "UZ"
          | "VE"
          | "WF"
          | "WS"
          | "YE"
          | "ZM";
        /** @format int32 */
        AccountId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<CrmMetricsDto, void | ProblemDetails>({
        path: `/api/dashboard/crm/metrics`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCmsMetricsList
     * @request GET:/api/dashboard/cms/metrics
     * @secure
     */
    dashboardCmsMetricsList: (
      query?: {
        /** @format date-time */
        From?: string;
        /** @format date-time */
        To?: string;
        Period?: string;
        Compare?: boolean;
        GroupBy?: "Day" | "Week" | "Month" | "Quarter" | "Year";
        CountryCode?:
          | "ZZ"
          | "AF"
          | "AL"
          | "AQ"
          | "DZ"
          | "AS"
          | "AD"
          | "AO"
          | "AG"
          | "AZ"
          | "AR"
          | "AU"
          | "AT"
          | "BS"
          | "BH"
          | "BD"
          | "AM"
          | "BB"
          | "BE"
          | "BM"
          | "BT"
          | "BO"
          | "BA"
          | "BW"
          | "BV"
          | "BR"
          | "BZ"
          | "IO"
          | "SB"
          | "VG"
          | "BN"
          | "BG"
          | "MM"
          | "BI"
          | "BY"
          | "KH"
          | "CM"
          | "CA"
          | "CV"
          | "KY"
          | "CF"
          | "LK"
          | "TD"
          | "CL"
          | "CN"
          | "TW"
          | "CX"
          | "CC"
          | "CO"
          | "KM"
          | "YT"
          | "CG"
          | "CD"
          | "CK"
          | "CR"
          | "HR"
          | "CU"
          | "CY"
          | "CZ"
          | "BJ"
          | "DK"
          | "DM"
          | "DO"
          | "EC"
          | "SV"
          | "GQ"
          | "ET"
          | "ER"
          | "EE"
          | "FO"
          | "FK"
          | "GS"
          | "FJ"
          | "FI"
          | "AX"
          | "FR"
          | "GF"
          | "PF"
          | "TF"
          | "DJ"
          | "GA"
          | "GE"
          | "GM"
          | "PS"
          | "DE"
          | "GH"
          | "GI"
          | "KI"
          | "GR"
          | "GL"
          | "GD"
          | "GP"
          | "GU"
          | "GT"
          | "GN"
          | "GY"
          | "HT"
          | "HM"
          | "VA"
          | "HN"
          | "HK"
          | "HU"
          | "IS"
          | "IN"
          | "ID"
          | "IR"
          | "IQ"
          | "IE"
          | "IL"
          | "IT"
          | "CI"
          | "JM"
          | "JP"
          | "KZ"
          | "JO"
          | "KE"
          | "KP"
          | "KR"
          | "KW"
          | "KG"
          | "LA"
          | "LB"
          | "LS"
          | "LV"
          | "LR"
          | "LY"
          | "LI"
          | "LT"
          | "LU"
          | "MO"
          | "MG"
          | "MW"
          | "MY"
          | "MV"
          | "ML"
          | "MT"
          | "MQ"
          | "MR"
          | "MU"
          | "MX"
          | "MC"
          | "MN"
          | "MD"
          | "ME"
          | "MS"
          | "MA"
          | "MZ"
          | "OM"
          | "NA"
          | "NR"
          | "NP"
          | "NL"
          | "CW"
          | "AW"
          | "SX"
          | "BQ"
          | "NC"
          | "VU"
          | "NZ"
          | "NI"
          | "NE"
          | "NG"
          | "NU"
          | "NF"
          | "NO"
          | "MP"
          | "UM"
          | "FM"
          | "MH"
          | "PW"
          | "PK"
          | "PA"
          | "PG"
          | "PY"
          | "PE"
          | "PH"
          | "PN"
          | "PL"
          | "PT"
          | "GW"
          | "TL"
          | "PR"
          | "QA"
          | "RE"
          | "RO"
          | "RU"
          | "RW"
          | "BL"
          | "SH"
          | "KN"
          | "AI"
          | "LC"
          | "MF"
          | "PM"
          | "VC"
          | "SM"
          | "ST"
          | "SA"
          | "SN"
          | "RS"
          | "SC"
          | "SL"
          | "SG"
          | "SK"
          | "VN"
          | "SI"
          | "SO"
          | "ZA"
          | "ZW"
          | "ES"
          | "SS"
          | "SD"
          | "EH"
          | "SR"
          | "SJ"
          | "SZ"
          | "SE"
          | "CH"
          | "SY"
          | "TJ"
          | "TH"
          | "TG"
          | "TK"
          | "TO"
          | "TT"
          | "AE"
          | "TN"
          | "TR"
          | "TM"
          | "TC"
          | "TV"
          | "UG"
          | "UA"
          | "MK"
          | "EG"
          | "GB"
          | "GG"
          | "JE"
          | "IM"
          | "TZ"
          | "US"
          | "VI"
          | "BF"
          | "UY"
          | "UZ"
          | "VE"
          | "WF"
          | "WS"
          | "YE"
          | "ZM";
        /** @format int32 */
        AccountId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<CmsMetricsDto, void | ProblemDetails>({
        path: `/api/dashboard/cms/metrics`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCrmSalesPerformanceList
     * @request GET:/api/dashboard/crm/sales-performance
     * @secure
     */
    dashboardCrmSalesPerformanceList: (
      query?: {
        /** @format date-time */
        From?: string;
        /** @format date-time */
        To?: string;
        Period?: string;
        Compare?: boolean;
        GroupBy?: "Day" | "Week" | "Month" | "Quarter" | "Year";
        CountryCode?:
          | "ZZ"
          | "AF"
          | "AL"
          | "AQ"
          | "DZ"
          | "AS"
          | "AD"
          | "AO"
          | "AG"
          | "AZ"
          | "AR"
          | "AU"
          | "AT"
          | "BS"
          | "BH"
          | "BD"
          | "AM"
          | "BB"
          | "BE"
          | "BM"
          | "BT"
          | "BO"
          | "BA"
          | "BW"
          | "BV"
          | "BR"
          | "BZ"
          | "IO"
          | "SB"
          | "VG"
          | "BN"
          | "BG"
          | "MM"
          | "BI"
          | "BY"
          | "KH"
          | "CM"
          | "CA"
          | "CV"
          | "KY"
          | "CF"
          | "LK"
          | "TD"
          | "CL"
          | "CN"
          | "TW"
          | "CX"
          | "CC"
          | "CO"
          | "KM"
          | "YT"
          | "CG"
          | "CD"
          | "CK"
          | "CR"
          | "HR"
          | "CU"
          | "CY"
          | "CZ"
          | "BJ"
          | "DK"
          | "DM"
          | "DO"
          | "EC"
          | "SV"
          | "GQ"
          | "ET"
          | "ER"
          | "EE"
          | "FO"
          | "FK"
          | "GS"
          | "FJ"
          | "FI"
          | "AX"
          | "FR"
          | "GF"
          | "PF"
          | "TF"
          | "DJ"
          | "GA"
          | "GE"
          | "GM"
          | "PS"
          | "DE"
          | "GH"
          | "GI"
          | "KI"
          | "GR"
          | "GL"
          | "GD"
          | "GP"
          | "GU"
          | "GT"
          | "GN"
          | "GY"
          | "HT"
          | "HM"
          | "VA"
          | "HN"
          | "HK"
          | "HU"
          | "IS"
          | "IN"
          | "ID"
          | "IR"
          | "IQ"
          | "IE"
          | "IL"
          | "IT"
          | "CI"
          | "JM"
          | "JP"
          | "KZ"
          | "JO"
          | "KE"
          | "KP"
          | "KR"
          | "KW"
          | "KG"
          | "LA"
          | "LB"
          | "LS"
          | "LV"
          | "LR"
          | "LY"
          | "LI"
          | "LT"
          | "LU"
          | "MO"
          | "MG"
          | "MW"
          | "MY"
          | "MV"
          | "ML"
          | "MT"
          | "MQ"
          | "MR"
          | "MU"
          | "MX"
          | "MC"
          | "MN"
          | "MD"
          | "ME"
          | "MS"
          | "MA"
          | "MZ"
          | "OM"
          | "NA"
          | "NR"
          | "NP"
          | "NL"
          | "CW"
          | "AW"
          | "SX"
          | "BQ"
          | "NC"
          | "VU"
          | "NZ"
          | "NI"
          | "NE"
          | "NG"
          | "NU"
          | "NF"
          | "NO"
          | "MP"
          | "UM"
          | "FM"
          | "MH"
          | "PW"
          | "PK"
          | "PA"
          | "PG"
          | "PY"
          | "PE"
          | "PH"
          | "PN"
          | "PL"
          | "PT"
          | "GW"
          | "TL"
          | "PR"
          | "QA"
          | "RE"
          | "RO"
          | "RU"
          | "RW"
          | "BL"
          | "SH"
          | "KN"
          | "AI"
          | "LC"
          | "MF"
          | "PM"
          | "VC"
          | "SM"
          | "ST"
          | "SA"
          | "SN"
          | "RS"
          | "SC"
          | "SL"
          | "SG"
          | "SK"
          | "VN"
          | "SI"
          | "SO"
          | "ZA"
          | "ZW"
          | "ES"
          | "SS"
          | "SD"
          | "EH"
          | "SR"
          | "SJ"
          | "SZ"
          | "SE"
          | "CH"
          | "SY"
          | "TJ"
          | "TH"
          | "TG"
          | "TK"
          | "TO"
          | "TT"
          | "AE"
          | "TN"
          | "TR"
          | "TM"
          | "TC"
          | "TV"
          | "UG"
          | "UA"
          | "MK"
          | "EG"
          | "GB"
          | "GG"
          | "JE"
          | "IM"
          | "TZ"
          | "US"
          | "VI"
          | "BF"
          | "UY"
          | "UZ"
          | "VE"
          | "WF"
          | "WS"
          | "YE"
          | "ZM";
        /** @format int32 */
        AccountId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SalesPerformancePointDto[], any>({
        path: `/api/dashboard/crm/sales-performance`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCrmTopAccountsList
     * @request GET:/api/dashboard/crm/top-accounts
     * @secure
     */
    dashboardCrmTopAccountsList: (
      query?: {
        /** @format date-time */
        From?: string;
        /** @format date-time */
        To?: string;
        Period?: string;
        Compare?: boolean;
        GroupBy?: "Day" | "Week" | "Month" | "Quarter" | "Year";
        CountryCode?:
          | "ZZ"
          | "AF"
          | "AL"
          | "AQ"
          | "DZ"
          | "AS"
          | "AD"
          | "AO"
          | "AG"
          | "AZ"
          | "AR"
          | "AU"
          | "AT"
          | "BS"
          | "BH"
          | "BD"
          | "AM"
          | "BB"
          | "BE"
          | "BM"
          | "BT"
          | "BO"
          | "BA"
          | "BW"
          | "BV"
          | "BR"
          | "BZ"
          | "IO"
          | "SB"
          | "VG"
          | "BN"
          | "BG"
          | "MM"
          | "BI"
          | "BY"
          | "KH"
          | "CM"
          | "CA"
          | "CV"
          | "KY"
          | "CF"
          | "LK"
          | "TD"
          | "CL"
          | "CN"
          | "TW"
          | "CX"
          | "CC"
          | "CO"
          | "KM"
          | "YT"
          | "CG"
          | "CD"
          | "CK"
          | "CR"
          | "HR"
          | "CU"
          | "CY"
          | "CZ"
          | "BJ"
          | "DK"
          | "DM"
          | "DO"
          | "EC"
          | "SV"
          | "GQ"
          | "ET"
          | "ER"
          | "EE"
          | "FO"
          | "FK"
          | "GS"
          | "FJ"
          | "FI"
          | "AX"
          | "FR"
          | "GF"
          | "PF"
          | "TF"
          | "DJ"
          | "GA"
          | "GE"
          | "GM"
          | "PS"
          | "DE"
          | "GH"
          | "GI"
          | "KI"
          | "GR"
          | "GL"
          | "GD"
          | "GP"
          | "GU"
          | "GT"
          | "GN"
          | "GY"
          | "HT"
          | "HM"
          | "VA"
          | "HN"
          | "HK"
          | "HU"
          | "IS"
          | "IN"
          | "ID"
          | "IR"
          | "IQ"
          | "IE"
          | "IL"
          | "IT"
          | "CI"
          | "JM"
          | "JP"
          | "KZ"
          | "JO"
          | "KE"
          | "KP"
          | "KR"
          | "KW"
          | "KG"
          | "LA"
          | "LB"
          | "LS"
          | "LV"
          | "LR"
          | "LY"
          | "LI"
          | "LT"
          | "LU"
          | "MO"
          | "MG"
          | "MW"
          | "MY"
          | "MV"
          | "ML"
          | "MT"
          | "MQ"
          | "MR"
          | "MU"
          | "MX"
          | "MC"
          | "MN"
          | "MD"
          | "ME"
          | "MS"
          | "MA"
          | "MZ"
          | "OM"
          | "NA"
          | "NR"
          | "NP"
          | "NL"
          | "CW"
          | "AW"
          | "SX"
          | "BQ"
          | "NC"
          | "VU"
          | "NZ"
          | "NI"
          | "NE"
          | "NG"
          | "NU"
          | "NF"
          | "NO"
          | "MP"
          | "UM"
          | "FM"
          | "MH"
          | "PW"
          | "PK"
          | "PA"
          | "PG"
          | "PY"
          | "PE"
          | "PH"
          | "PN"
          | "PL"
          | "PT"
          | "GW"
          | "TL"
          | "PR"
          | "QA"
          | "RE"
          | "RO"
          | "RU"
          | "RW"
          | "BL"
          | "SH"
          | "KN"
          | "AI"
          | "LC"
          | "MF"
          | "PM"
          | "VC"
          | "SM"
          | "ST"
          | "SA"
          | "SN"
          | "RS"
          | "SC"
          | "SL"
          | "SG"
          | "SK"
          | "VN"
          | "SI"
          | "SO"
          | "ZA"
          | "ZW"
          | "ES"
          | "SS"
          | "SD"
          | "EH"
          | "SR"
          | "SJ"
          | "SZ"
          | "SE"
          | "CH"
          | "SY"
          | "TJ"
          | "TH"
          | "TG"
          | "TK"
          | "TO"
          | "TT"
          | "AE"
          | "TN"
          | "TR"
          | "TM"
          | "TC"
          | "TV"
          | "UG"
          | "UA"
          | "MK"
          | "EG"
          | "GB"
          | "GG"
          | "JE"
          | "IM"
          | "TZ"
          | "US"
          | "VI"
          | "BF"
          | "UY"
          | "UZ"
          | "VE"
          | "WF"
          | "WS"
          | "YE"
          | "ZM";
        /** @format int32 */
        AccountId?: number;
        /**
         * @format int32
         * @default 5
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<TopAccountDto[], any>({
        path: `/api/dashboard/crm/top-accounts`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCrmRecentOrdersList
     * @request GET:/api/dashboard/crm/recent-orders
     * @secure
     */
    dashboardCrmRecentOrdersList: (
      query?: {
        /**
         * @format int32
         * @default 5
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<OrderSummaryDto[], any>({
        path: `/api/dashboard/crm/recent-orders`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCrmContactGrowthList
     * @request GET:/api/dashboard/crm/contact-growth
     * @secure
     */
    dashboardCrmContactGrowthList: (
      query?: {
        /** @format date-time */
        From?: string;
        /** @format date-time */
        To?: string;
        Period?: string;
        Compare?: boolean;
        GroupBy?: "Day" | "Week" | "Month" | "Quarter" | "Year";
        CountryCode?:
          | "ZZ"
          | "AF"
          | "AL"
          | "AQ"
          | "DZ"
          | "AS"
          | "AD"
          | "AO"
          | "AG"
          | "AZ"
          | "AR"
          | "AU"
          | "AT"
          | "BS"
          | "BH"
          | "BD"
          | "AM"
          | "BB"
          | "BE"
          | "BM"
          | "BT"
          | "BO"
          | "BA"
          | "BW"
          | "BV"
          | "BR"
          | "BZ"
          | "IO"
          | "SB"
          | "VG"
          | "BN"
          | "BG"
          | "MM"
          | "BI"
          | "BY"
          | "KH"
          | "CM"
          | "CA"
          | "CV"
          | "KY"
          | "CF"
          | "LK"
          | "TD"
          | "CL"
          | "CN"
          | "TW"
          | "CX"
          | "CC"
          | "CO"
          | "KM"
          | "YT"
          | "CG"
          | "CD"
          | "CK"
          | "CR"
          | "HR"
          | "CU"
          | "CY"
          | "CZ"
          | "BJ"
          | "DK"
          | "DM"
          | "DO"
          | "EC"
          | "SV"
          | "GQ"
          | "ET"
          | "ER"
          | "EE"
          | "FO"
          | "FK"
          | "GS"
          | "FJ"
          | "FI"
          | "AX"
          | "FR"
          | "GF"
          | "PF"
          | "TF"
          | "DJ"
          | "GA"
          | "GE"
          | "GM"
          | "PS"
          | "DE"
          | "GH"
          | "GI"
          | "KI"
          | "GR"
          | "GL"
          | "GD"
          | "GP"
          | "GU"
          | "GT"
          | "GN"
          | "GY"
          | "HT"
          | "HM"
          | "VA"
          | "HN"
          | "HK"
          | "HU"
          | "IS"
          | "IN"
          | "ID"
          | "IR"
          | "IQ"
          | "IE"
          | "IL"
          | "IT"
          | "CI"
          | "JM"
          | "JP"
          | "KZ"
          | "JO"
          | "KE"
          | "KP"
          | "KR"
          | "KW"
          | "KG"
          | "LA"
          | "LB"
          | "LS"
          | "LV"
          | "LR"
          | "LY"
          | "LI"
          | "LT"
          | "LU"
          | "MO"
          | "MG"
          | "MW"
          | "MY"
          | "MV"
          | "ML"
          | "MT"
          | "MQ"
          | "MR"
          | "MU"
          | "MX"
          | "MC"
          | "MN"
          | "MD"
          | "ME"
          | "MS"
          | "MA"
          | "MZ"
          | "OM"
          | "NA"
          | "NR"
          | "NP"
          | "NL"
          | "CW"
          | "AW"
          | "SX"
          | "BQ"
          | "NC"
          | "VU"
          | "NZ"
          | "NI"
          | "NE"
          | "NG"
          | "NU"
          | "NF"
          | "NO"
          | "MP"
          | "UM"
          | "FM"
          | "MH"
          | "PW"
          | "PK"
          | "PA"
          | "PG"
          | "PY"
          | "PE"
          | "PH"
          | "PN"
          | "PL"
          | "PT"
          | "GW"
          | "TL"
          | "PR"
          | "QA"
          | "RE"
          | "RO"
          | "RU"
          | "RW"
          | "BL"
          | "SH"
          | "KN"
          | "AI"
          | "LC"
          | "MF"
          | "PM"
          | "VC"
          | "SM"
          | "ST"
          | "SA"
          | "SN"
          | "RS"
          | "SC"
          | "SL"
          | "SG"
          | "SK"
          | "VN"
          | "SI"
          | "SO"
          | "ZA"
          | "ZW"
          | "ES"
          | "SS"
          | "SD"
          | "EH"
          | "SR"
          | "SJ"
          | "SZ"
          | "SE"
          | "CH"
          | "SY"
          | "TJ"
          | "TH"
          | "TG"
          | "TK"
          | "TO"
          | "TT"
          | "AE"
          | "TN"
          | "TR"
          | "TM"
          | "TC"
          | "TV"
          | "UG"
          | "UA"
          | "MK"
          | "EG"
          | "GB"
          | "GG"
          | "JE"
          | "IM"
          | "TZ"
          | "US"
          | "VI"
          | "BF"
          | "UY"
          | "UZ"
          | "VE"
          | "WF"
          | "WS"
          | "YE"
          | "ZM";
        /** @format int32 */
        AccountId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ContactGrowthPointDto[], any>({
        path: `/api/dashboard/crm/contact-growth`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCmsTopContentList
     * @request GET:/api/dashboard/cms/top-content
     * @secure
     */
    dashboardCmsTopContentList: (
      query?: {
        /** @format date-time */
        From?: string;
        /** @format date-time */
        To?: string;
        Period?: string;
        Compare?: boolean;
        GroupBy?: "Day" | "Week" | "Month" | "Quarter" | "Year";
        CountryCode?:
          | "ZZ"
          | "AF"
          | "AL"
          | "AQ"
          | "DZ"
          | "AS"
          | "AD"
          | "AO"
          | "AG"
          | "AZ"
          | "AR"
          | "AU"
          | "AT"
          | "BS"
          | "BH"
          | "BD"
          | "AM"
          | "BB"
          | "BE"
          | "BM"
          | "BT"
          | "BO"
          | "BA"
          | "BW"
          | "BV"
          | "BR"
          | "BZ"
          | "IO"
          | "SB"
          | "VG"
          | "BN"
          | "BG"
          | "MM"
          | "BI"
          | "BY"
          | "KH"
          | "CM"
          | "CA"
          | "CV"
          | "KY"
          | "CF"
          | "LK"
          | "TD"
          | "CL"
          | "CN"
          | "TW"
          | "CX"
          | "CC"
          | "CO"
          | "KM"
          | "YT"
          | "CG"
          | "CD"
          | "CK"
          | "CR"
          | "HR"
          | "CU"
          | "CY"
          | "CZ"
          | "BJ"
          | "DK"
          | "DM"
          | "DO"
          | "EC"
          | "SV"
          | "GQ"
          | "ET"
          | "ER"
          | "EE"
          | "FO"
          | "FK"
          | "GS"
          | "FJ"
          | "FI"
          | "AX"
          | "FR"
          | "GF"
          | "PF"
          | "TF"
          | "DJ"
          | "GA"
          | "GE"
          | "GM"
          | "PS"
          | "DE"
          | "GH"
          | "GI"
          | "KI"
          | "GR"
          | "GL"
          | "GD"
          | "GP"
          | "GU"
          | "GT"
          | "GN"
          | "GY"
          | "HT"
          | "HM"
          | "VA"
          | "HN"
          | "HK"
          | "HU"
          | "IS"
          | "IN"
          | "ID"
          | "IR"
          | "IQ"
          | "IE"
          | "IL"
          | "IT"
          | "CI"
          | "JM"
          | "JP"
          | "KZ"
          | "JO"
          | "KE"
          | "KP"
          | "KR"
          | "KW"
          | "KG"
          | "LA"
          | "LB"
          | "LS"
          | "LV"
          | "LR"
          | "LY"
          | "LI"
          | "LT"
          | "LU"
          | "MO"
          | "MG"
          | "MW"
          | "MY"
          | "MV"
          | "ML"
          | "MT"
          | "MQ"
          | "MR"
          | "MU"
          | "MX"
          | "MC"
          | "MN"
          | "MD"
          | "ME"
          | "MS"
          | "MA"
          | "MZ"
          | "OM"
          | "NA"
          | "NR"
          | "NP"
          | "NL"
          | "CW"
          | "AW"
          | "SX"
          | "BQ"
          | "NC"
          | "VU"
          | "NZ"
          | "NI"
          | "NE"
          | "NG"
          | "NU"
          | "NF"
          | "NO"
          | "MP"
          | "UM"
          | "FM"
          | "MH"
          | "PW"
          | "PK"
          | "PA"
          | "PG"
          | "PY"
          | "PE"
          | "PH"
          | "PN"
          | "PL"
          | "PT"
          | "GW"
          | "TL"
          | "PR"
          | "QA"
          | "RE"
          | "RO"
          | "RU"
          | "RW"
          | "BL"
          | "SH"
          | "KN"
          | "AI"
          | "LC"
          | "MF"
          | "PM"
          | "VC"
          | "SM"
          | "ST"
          | "SA"
          | "SN"
          | "RS"
          | "SC"
          | "SL"
          | "SG"
          | "SK"
          | "VN"
          | "SI"
          | "SO"
          | "ZA"
          | "ZW"
          | "ES"
          | "SS"
          | "SD"
          | "EH"
          | "SR"
          | "SJ"
          | "SZ"
          | "SE"
          | "CH"
          | "SY"
          | "TJ"
          | "TH"
          | "TG"
          | "TK"
          | "TO"
          | "TT"
          | "AE"
          | "TN"
          | "TR"
          | "TM"
          | "TC"
          | "TV"
          | "UG"
          | "UA"
          | "MK"
          | "EG"
          | "GB"
          | "GG"
          | "JE"
          | "IM"
          | "TZ"
          | "US"
          | "VI"
          | "BF"
          | "UY"
          | "UZ"
          | "VE"
          | "WF"
          | "WS"
          | "YE"
          | "ZM";
        /** @format int32 */
        AccountId?: number;
        /**
         * @format int32
         * @default 5
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<TopContentItemDto[], any>({
        path: `/api/dashboard/cms/top-content`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCmsContentDistributionList
     * @request GET:/api/dashboard/cms/content-distribution
     * @secure
     */
    dashboardCmsContentDistributionList: (
      query?: {
        /** @format date-time */
        From?: string;
        /** @format date-time */
        To?: string;
        Period?: string;
        Compare?: boolean;
        GroupBy?: "Day" | "Week" | "Month" | "Quarter" | "Year";
        CountryCode?:
          | "ZZ"
          | "AF"
          | "AL"
          | "AQ"
          | "DZ"
          | "AS"
          | "AD"
          | "AO"
          | "AG"
          | "AZ"
          | "AR"
          | "AU"
          | "AT"
          | "BS"
          | "BH"
          | "BD"
          | "AM"
          | "BB"
          | "BE"
          | "BM"
          | "BT"
          | "BO"
          | "BA"
          | "BW"
          | "BV"
          | "BR"
          | "BZ"
          | "IO"
          | "SB"
          | "VG"
          | "BN"
          | "BG"
          | "MM"
          | "BI"
          | "BY"
          | "KH"
          | "CM"
          | "CA"
          | "CV"
          | "KY"
          | "CF"
          | "LK"
          | "TD"
          | "CL"
          | "CN"
          | "TW"
          | "CX"
          | "CC"
          | "CO"
          | "KM"
          | "YT"
          | "CG"
          | "CD"
          | "CK"
          | "CR"
          | "HR"
          | "CU"
          | "CY"
          | "CZ"
          | "BJ"
          | "DK"
          | "DM"
          | "DO"
          | "EC"
          | "SV"
          | "GQ"
          | "ET"
          | "ER"
          | "EE"
          | "FO"
          | "FK"
          | "GS"
          | "FJ"
          | "FI"
          | "AX"
          | "FR"
          | "GF"
          | "PF"
          | "TF"
          | "DJ"
          | "GA"
          | "GE"
          | "GM"
          | "PS"
          | "DE"
          | "GH"
          | "GI"
          | "KI"
          | "GR"
          | "GL"
          | "GD"
          | "GP"
          | "GU"
          | "GT"
          | "GN"
          | "GY"
          | "HT"
          | "HM"
          | "VA"
          | "HN"
          | "HK"
          | "HU"
          | "IS"
          | "IN"
          | "ID"
          | "IR"
          | "IQ"
          | "IE"
          | "IL"
          | "IT"
          | "CI"
          | "JM"
          | "JP"
          | "KZ"
          | "JO"
          | "KE"
          | "KP"
          | "KR"
          | "KW"
          | "KG"
          | "LA"
          | "LB"
          | "LS"
          | "LV"
          | "LR"
          | "LY"
          | "LI"
          | "LT"
          | "LU"
          | "MO"
          | "MG"
          | "MW"
          | "MY"
          | "MV"
          | "ML"
          | "MT"
          | "MQ"
          | "MR"
          | "MU"
          | "MX"
          | "MC"
          | "MN"
          | "MD"
          | "ME"
          | "MS"
          | "MA"
          | "MZ"
          | "OM"
          | "NA"
          | "NR"
          | "NP"
          | "NL"
          | "CW"
          | "AW"
          | "SX"
          | "BQ"
          | "NC"
          | "VU"
          | "NZ"
          | "NI"
          | "NE"
          | "NG"
          | "NU"
          | "NF"
          | "NO"
          | "MP"
          | "UM"
          | "FM"
          | "MH"
          | "PW"
          | "PK"
          | "PA"
          | "PG"
          | "PY"
          | "PE"
          | "PH"
          | "PN"
          | "PL"
          | "PT"
          | "GW"
          | "TL"
          | "PR"
          | "QA"
          | "RE"
          | "RO"
          | "RU"
          | "RW"
          | "BL"
          | "SH"
          | "KN"
          | "AI"
          | "LC"
          | "MF"
          | "PM"
          | "VC"
          | "SM"
          | "ST"
          | "SA"
          | "SN"
          | "RS"
          | "SC"
          | "SL"
          | "SG"
          | "SK"
          | "VN"
          | "SI"
          | "SO"
          | "ZA"
          | "ZW"
          | "ES"
          | "SS"
          | "SD"
          | "EH"
          | "SR"
          | "SJ"
          | "SZ"
          | "SE"
          | "CH"
          | "SY"
          | "TJ"
          | "TH"
          | "TG"
          | "TK"
          | "TO"
          | "TT"
          | "AE"
          | "TN"
          | "TR"
          | "TM"
          | "TC"
          | "TV"
          | "UG"
          | "UA"
          | "MK"
          | "EG"
          | "GB"
          | "GG"
          | "JE"
          | "IM"
          | "TZ"
          | "US"
          | "VI"
          | "BF"
          | "UY"
          | "UZ"
          | "VE"
          | "WF"
          | "WS"
          | "YE"
          | "ZM";
        /** @format int32 */
        AccountId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ContentDistributionItemDto[], any>({
        path: `/api/dashboard/cms/content-distribution`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCmsRecentContentList
     * @request GET:/api/dashboard/cms/recent-content
     * @secure
     */
    dashboardCmsRecentContentList: (
      query?: {
        /**
         * @format int32
         * @default 5
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ContentSummaryDto[], any>({
        path: `/api/dashboard/cms/recent-content`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCmsContentGrowthList
     * @request GET:/api/dashboard/cms/content-growth
     * @secure
     */
    dashboardCmsContentGrowthList: (
      query?: {
        /** @format date-time */
        From?: string;
        /** @format date-time */
        To?: string;
        Period?: string;
        Compare?: boolean;
        GroupBy?: "Day" | "Week" | "Month" | "Quarter" | "Year";
        CountryCode?:
          | "ZZ"
          | "AF"
          | "AL"
          | "AQ"
          | "DZ"
          | "AS"
          | "AD"
          | "AO"
          | "AG"
          | "AZ"
          | "AR"
          | "AU"
          | "AT"
          | "BS"
          | "BH"
          | "BD"
          | "AM"
          | "BB"
          | "BE"
          | "BM"
          | "BT"
          | "BO"
          | "BA"
          | "BW"
          | "BV"
          | "BR"
          | "BZ"
          | "IO"
          | "SB"
          | "VG"
          | "BN"
          | "BG"
          | "MM"
          | "BI"
          | "BY"
          | "KH"
          | "CM"
          | "CA"
          | "CV"
          | "KY"
          | "CF"
          | "LK"
          | "TD"
          | "CL"
          | "CN"
          | "TW"
          | "CX"
          | "CC"
          | "CO"
          | "KM"
          | "YT"
          | "CG"
          | "CD"
          | "CK"
          | "CR"
          | "HR"
          | "CU"
          | "CY"
          | "CZ"
          | "BJ"
          | "DK"
          | "DM"
          | "DO"
          | "EC"
          | "SV"
          | "GQ"
          | "ET"
          | "ER"
          | "EE"
          | "FO"
          | "FK"
          | "GS"
          | "FJ"
          | "FI"
          | "AX"
          | "FR"
          | "GF"
          | "PF"
          | "TF"
          | "DJ"
          | "GA"
          | "GE"
          | "GM"
          | "PS"
          | "DE"
          | "GH"
          | "GI"
          | "KI"
          | "GR"
          | "GL"
          | "GD"
          | "GP"
          | "GU"
          | "GT"
          | "GN"
          | "GY"
          | "HT"
          | "HM"
          | "VA"
          | "HN"
          | "HK"
          | "HU"
          | "IS"
          | "IN"
          | "ID"
          | "IR"
          | "IQ"
          | "IE"
          | "IL"
          | "IT"
          | "CI"
          | "JM"
          | "JP"
          | "KZ"
          | "JO"
          | "KE"
          | "KP"
          | "KR"
          | "KW"
          | "KG"
          | "LA"
          | "LB"
          | "LS"
          | "LV"
          | "LR"
          | "LY"
          | "LI"
          | "LT"
          | "LU"
          | "MO"
          | "MG"
          | "MW"
          | "MY"
          | "MV"
          | "ML"
          | "MT"
          | "MQ"
          | "MR"
          | "MU"
          | "MX"
          | "MC"
          | "MN"
          | "MD"
          | "ME"
          | "MS"
          | "MA"
          | "MZ"
          | "OM"
          | "NA"
          | "NR"
          | "NP"
          | "NL"
          | "CW"
          | "AW"
          | "SX"
          | "BQ"
          | "NC"
          | "VU"
          | "NZ"
          | "NI"
          | "NE"
          | "NG"
          | "NU"
          | "NF"
          | "NO"
          | "MP"
          | "UM"
          | "FM"
          | "MH"
          | "PW"
          | "PK"
          | "PA"
          | "PG"
          | "PY"
          | "PE"
          | "PH"
          | "PN"
          | "PL"
          | "PT"
          | "GW"
          | "TL"
          | "PR"
          | "QA"
          | "RE"
          | "RO"
          | "RU"
          | "RW"
          | "BL"
          | "SH"
          | "KN"
          | "AI"
          | "LC"
          | "MF"
          | "PM"
          | "VC"
          | "SM"
          | "ST"
          | "SA"
          | "SN"
          | "RS"
          | "SC"
          | "SL"
          | "SG"
          | "SK"
          | "VN"
          | "SI"
          | "SO"
          | "ZA"
          | "ZW"
          | "ES"
          | "SS"
          | "SD"
          | "EH"
          | "SR"
          | "SJ"
          | "SZ"
          | "SE"
          | "CH"
          | "SY"
          | "TJ"
          | "TH"
          | "TG"
          | "TK"
          | "TO"
          | "TT"
          | "AE"
          | "TN"
          | "TR"
          | "TM"
          | "TC"
          | "TV"
          | "UG"
          | "UA"
          | "MK"
          | "EG"
          | "GB"
          | "GG"
          | "JE"
          | "IM"
          | "TZ"
          | "US"
          | "VI"
          | "BF"
          | "UY"
          | "UZ"
          | "VE"
          | "WF"
          | "WS"
          | "YE"
          | "ZM";
        /** @format int32 */
        AccountId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ContentGrowthPointDto[], any>({
        path: `/api/dashboard/cms/content-growth`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCmsTopAuthorsList
     * @request GET:/api/dashboard/cms/top-authors
     * @secure
     */
    dashboardCmsTopAuthorsList: (
      query?: {
        /** @format date-time */
        From?: string;
        /** @format date-time */
        To?: string;
        Period?: string;
        Compare?: boolean;
        GroupBy?: "Day" | "Week" | "Month" | "Quarter" | "Year";
        CountryCode?:
          | "ZZ"
          | "AF"
          | "AL"
          | "AQ"
          | "DZ"
          | "AS"
          | "AD"
          | "AO"
          | "AG"
          | "AZ"
          | "AR"
          | "AU"
          | "AT"
          | "BS"
          | "BH"
          | "BD"
          | "AM"
          | "BB"
          | "BE"
          | "BM"
          | "BT"
          | "BO"
          | "BA"
          | "BW"
          | "BV"
          | "BR"
          | "BZ"
          | "IO"
          | "SB"
          | "VG"
          | "BN"
          | "BG"
          | "MM"
          | "BI"
          | "BY"
          | "KH"
          | "CM"
          | "CA"
          | "CV"
          | "KY"
          | "CF"
          | "LK"
          | "TD"
          | "CL"
          | "CN"
          | "TW"
          | "CX"
          | "CC"
          | "CO"
          | "KM"
          | "YT"
          | "CG"
          | "CD"
          | "CK"
          | "CR"
          | "HR"
          | "CU"
          | "CY"
          | "CZ"
          | "BJ"
          | "DK"
          | "DM"
          | "DO"
          | "EC"
          | "SV"
          | "GQ"
          | "ET"
          | "ER"
          | "EE"
          | "FO"
          | "FK"
          | "GS"
          | "FJ"
          | "FI"
          | "AX"
          | "FR"
          | "GF"
          | "PF"
          | "TF"
          | "DJ"
          | "GA"
          | "GE"
          | "GM"
          | "PS"
          | "DE"
          | "GH"
          | "GI"
          | "KI"
          | "GR"
          | "GL"
          | "GD"
          | "GP"
          | "GU"
          | "GT"
          | "GN"
          | "GY"
          | "HT"
          | "HM"
          | "VA"
          | "HN"
          | "HK"
          | "HU"
          | "IS"
          | "IN"
          | "ID"
          | "IR"
          | "IQ"
          | "IE"
          | "IL"
          | "IT"
          | "CI"
          | "JM"
          | "JP"
          | "KZ"
          | "JO"
          | "KE"
          | "KP"
          | "KR"
          | "KW"
          | "KG"
          | "LA"
          | "LB"
          | "LS"
          | "LV"
          | "LR"
          | "LY"
          | "LI"
          | "LT"
          | "LU"
          | "MO"
          | "MG"
          | "MW"
          | "MY"
          | "MV"
          | "ML"
          | "MT"
          | "MQ"
          | "MR"
          | "MU"
          | "MX"
          | "MC"
          | "MN"
          | "MD"
          | "ME"
          | "MS"
          | "MA"
          | "MZ"
          | "OM"
          | "NA"
          | "NR"
          | "NP"
          | "NL"
          | "CW"
          | "AW"
          | "SX"
          | "BQ"
          | "NC"
          | "VU"
          | "NZ"
          | "NI"
          | "NE"
          | "NG"
          | "NU"
          | "NF"
          | "NO"
          | "MP"
          | "UM"
          | "FM"
          | "MH"
          | "PW"
          | "PK"
          | "PA"
          | "PG"
          | "PY"
          | "PE"
          | "PH"
          | "PN"
          | "PL"
          | "PT"
          | "GW"
          | "TL"
          | "PR"
          | "QA"
          | "RE"
          | "RO"
          | "RU"
          | "RW"
          | "BL"
          | "SH"
          | "KN"
          | "AI"
          | "LC"
          | "MF"
          | "PM"
          | "VC"
          | "SM"
          | "ST"
          | "SA"
          | "SN"
          | "RS"
          | "SC"
          | "SL"
          | "SG"
          | "SK"
          | "VN"
          | "SI"
          | "SO"
          | "ZA"
          | "ZW"
          | "ES"
          | "SS"
          | "SD"
          | "EH"
          | "SR"
          | "SJ"
          | "SZ"
          | "SE"
          | "CH"
          | "SY"
          | "TJ"
          | "TH"
          | "TG"
          | "TK"
          | "TO"
          | "TT"
          | "AE"
          | "TN"
          | "TR"
          | "TM"
          | "TC"
          | "TV"
          | "UG"
          | "UA"
          | "MK"
          | "EG"
          | "GB"
          | "GG"
          | "JE"
          | "IM"
          | "TZ"
          | "US"
          | "VI"
          | "BF"
          | "UY"
          | "UZ"
          | "VE"
          | "WF"
          | "WS"
          | "YE"
          | "ZM";
        /** @format int32 */
        AccountId?: number;
        /**
         * @format int32
         * @default 5
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<TopAuthorDto[], any>({
        path: `/api/dashboard/cms/top-authors`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardCmsRecentCommentsList
     * @request GET:/api/dashboard/cms/recent-comments
     * @secure
     */
    dashboardCmsRecentCommentsList: (
      query?: {
        /**
         * @format int32
         * @default 4
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<CommentSummaryDto[], any>({
        path: `/api/dashboard/cms/recent-comments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelines
     * @name DealPipelinesSyncList
     * @request GET:/api/deal-pipelines/sync
     * @secure
     */
    dealPipelinesSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        DealPipelineDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/deal-pipelines/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelines
     * @name DealPipelinesDetail
     * @request GET:/api/deal-pipelines/{id}
     * @secure
     */
    dealPipelinesDetail: (id: number, params: RequestParams = {}) =>
      this.request<DealPipelineDetailsDto, void | ProblemDetails>({
        path: `/api/deal-pipelines/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelines
     * @name DealPipelinesPartialUpdate
     * @request PATCH:/api/deal-pipelines/{id}
     * @secure
     */
    dealPipelinesPartialUpdate: (
      id: number,
      data: DealPipelineUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<DealPipelineDetailsDto, void | ProblemDetails>({
        path: `/api/deal-pipelines/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelines
     * @name DealPipelinesDelete
     * @request DELETE:/api/deal-pipelines/{id}
     * @secure
     */
    dealPipelinesDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/deal-pipelines/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelines
     * @name DealPipelinesCreate
     * @request POST:/api/deal-pipelines
     * @secure
     */
    dealPipelinesCreate: (
      data: DealPipelineCreateDto,
      params: RequestParams = {},
    ) =>
      this.request<DealPipelineDetailsDto, void | ProblemDetails>({
        path: `/api/deal-pipelines`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelines
     * @name DealPipelinesList
     * @request GET:/api/deal-pipelines
     * @secure
     */
    dealPipelinesList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DealPipelineDetailsDto[], void | ProblemDetails>({
        path: `/api/deal-pipelines`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelines
     * @name DealPipelinesBulkDelete
     * @request DELETE:/api/deal-pipelines/bulk
     * @secure
     */
    dealPipelinesBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/deal-pipelines/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelines
     * @name DealPipelinesExportList
     * @request GET:/api/deal-pipelines/export
     * @secure
     */
    dealPipelinesExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/deal-pipelines/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelineStages
     * @name DealPipelineStagesCreate
     * @request POST:/api/deal-pipeline-stages
     * @secure
     */
    dealPipelineStagesCreate: (
      data: DealPipelineStageCreateDto,
      params: RequestParams = {},
    ) =>
      this.request<DealPipelineStageDetailsDto, void | ProblemDetails>({
        path: `/api/deal-pipeline-stages`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelineStages
     * @name DealPipelineStagesList
     * @request GET:/api/deal-pipeline-stages
     * @secure
     */
    dealPipelineStagesList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DealPipelineStageDetailsDto[], void | ProblemDetails>({
        path: `/api/deal-pipeline-stages`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelineStages
     * @name DealPipelineStagesPartialUpdate
     * @request PATCH:/api/deal-pipeline-stages/{id}
     * @secure
     */
    dealPipelineStagesPartialUpdate: (
      id: number,
      data: DealPipelineStageUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<DealPipelineStageDetailsDto, void | ProblemDetails>({
        path: `/api/deal-pipeline-stages/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelineStages
     * @name DealPipelineStagesDetail
     * @request GET:/api/deal-pipeline-stages/{id}
     * @secure
     */
    dealPipelineStagesDetail: (id: number, params: RequestParams = {}) =>
      this.request<DealPipelineStageDetailsDto, void | ProblemDetails>({
        path: `/api/deal-pipeline-stages/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelineStages
     * @name DealPipelineStagesDelete
     * @request DELETE:/api/deal-pipeline-stages/{id}
     * @secure
     */
    dealPipelineStagesDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/deal-pipeline-stages/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelineStages
     * @name DealPipelineStagesSyncList
     * @request GET:/api/deal-pipeline-stages/sync
     * @secure
     */
    dealPipelineStagesSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        DealPipelineStageDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/deal-pipeline-stages/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelineStages
     * @name DealPipelineStagesBulkDelete
     * @request DELETE:/api/deal-pipeline-stages/bulk
     * @secure
     */
    dealPipelineStagesBulkDelete: (
      data: number[],
      params: RequestParams = {},
    ) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/deal-pipeline-stages/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags DealPipelineStages
     * @name DealPipelineStagesExportList
     * @request GET:/api/deal-pipeline-stages/export
     * @secure
     */
    dealPipelineStagesExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/deal-pipeline-stages/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deals
     * @name DealsTagsList
     * @request GET:/api/deals/tags
     * @secure
     */
    dealsTagsList: (params: RequestParams = {}) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/deals/tags`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deals
     * @name DealsCreate
     * @request POST:/api/deals
     * @secure
     */
    dealsCreate: (data: DealCreateDto, params: RequestParams = {}) =>
      this.request<DealDetailsDto, void | ProblemDetails>({
        path: `/api/deals`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deals
     * @name DealsList
     * @request GET:/api/deals
     * @secure
     */
    dealsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DealDetailsDto[], void | ProblemDetails>({
        path: `/api/deals`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deals
     * @name DealsPartialUpdate
     * @request PATCH:/api/deals/{id}
     * @secure
     */
    dealsPartialUpdate: (
      id: number,
      data: DealUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<DealDetailsDto, void | ProblemDetails>({
        path: `/api/deals/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deals
     * @name DealsDetail
     * @request GET:/api/deals/{id}
     * @secure
     */
    dealsDetail: (id: number, params: RequestParams = {}) =>
      this.request<DealDetailsDto, void | ProblemDetails>({
        path: `/api/deals/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deals
     * @name DealsDelete
     * @request DELETE:/api/deals/{id}
     * @secure
     */
    dealsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/deals/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deals
     * @name DealsSyncList
     * @request GET:/api/deals/sync
     * @secure
     */
    dealsSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DealDetailsDtoInt32SyncResponseDto, void | ProblemDetails>({
        path: `/api/deals/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deals
     * @name DealsBulkDelete
     * @request DELETE:/api/deals/bulk
     * @secure
     */
    dealsBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/deals/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deals
     * @name DealsExportList
     * @request GET:/api/deals/export
     * @secure
     */
    dealsExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/deals/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deployments
     * @name DeploymentsTargetsList
     * @request GET:/api/deployments/targets
     * @secure
     */
    deploymentsTargetsList: (params: RequestParams = {}) =>
      this.request<DeploymentTargetDto[], ProblemDetails>({
        path: `/api/deployments/targets`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deployments
     * @name DeploymentsList
     * @request GET:/api/deployments
     * @secure
     */
    deploymentsList: (
      query?: {
        /**
         * @format int32
         * @default 20
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<DeploymentRecordDto[], ProblemDetails>({
        path: `/api/deployments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deployments
     * @name DeploymentsDetail
     * @request GET:/api/deployments/{id}
     * @secure
     */
    deploymentsDetail: (id: string, params: RequestParams = {}) =>
      this.request<DeploymentDetailsDto, ProblemDetails>({
        path: `/api/deployments/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deployments
     * @name DeploymentsStatsList
     * @request GET:/api/deployments/stats
     * @secure
     */
    deploymentsStatsList: (params: RequestParams = {}) =>
      this.request<DeploymentStatsDto, ProblemDetails>({
        path: `/api/deployments/stats`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deployments
     * @name DeploymentsTriggerCreate
     * @request POST:/api/deployments/trigger
     * @secure
     */
    deploymentsTriggerCreate: (
      data: DeploymentTriggerRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<DeploymentTriggerResultDto, ProblemDetails>({
        path: `/api/deployments/trigger`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Deployments
     * @name DeploymentsNotifyCreate
     * @request POST:/api/deployments/notify
     * @secure
     */
    deploymentsNotifyCreate: (params: RequestParams = {}) =>
      this.request<void, ProblemDetails>({
        path: `/api/deployments/notify`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Domains
     * @name DomainsTagsList
     * @request GET:/api/domains/tags
     * @secure
     */
    domainsTagsList: (params: RequestParams = {}) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/domains/tags`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Domains
     * @name DomainsVerifyDetail
     * @request GET:/api/domains/verify/{name}
     * @secure
     */
    domainsVerifyDetail: (
      name: string,
      query?: {
        /** @default false */
        force?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<DomainDetailsDto, void | ProblemDetails>({
        path: `/api/domains/verify/${name}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Domains
     * @name DomainsSyncList
     * @request GET:/api/domains/sync
     * @secure
     */
    domainsSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DomainDetailsDtoInt32SyncResponseDto, void | ProblemDetails>(
        {
          path: `/api/domains/sync`,
          method: "GET",
          query: query,
          secure: true,
          format: "json",
          ...params,
        },
      ),

    /**
     * No description
     *
     * @tags Domains
     * @name DomainsImportCreate
     * @request POST:/api/domains/import
     * @secure
     */
    domainsImportCreate: (
      data: DomainImportDto[],
      params: RequestParams = {},
    ) =>
      this.request<ImportResult, void | ProblemDetails>({
        path: `/api/domains/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Domains
     * @name DomainsDetail
     * @request GET:/api/domains/{id}
     * @secure
     */
    domainsDetail: (id: number, params: RequestParams = {}) =>
      this.request<DomainDetailsDto, void | ProblemDetails>({
        path: `/api/domains/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Domains
     * @name DomainsPartialUpdate
     * @request PATCH:/api/domains/{id}
     * @secure
     */
    domainsPartialUpdate: (
      id: number,
      data: DomainUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<DomainDetailsDto, void | ProblemDetails>({
        path: `/api/domains/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Domains
     * @name DomainsDelete
     * @request DELETE:/api/domains/{id}
     * @secure
     */
    domainsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/domains/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Domains
     * @name DomainsCreate
     * @request POST:/api/domains
     * @secure
     */
    domainsCreate: (data: DomainCreateDto, params: RequestParams = {}) =>
      this.request<DomainDetailsDto, void | ProblemDetails>({
        path: `/api/domains`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Domains
     * @name DomainsList
     * @request GET:/api/domains
     * @secure
     */
    domainsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DomainDetailsDto[], void | ProblemDetails>({
        path: `/api/domains`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Domains
     * @name DomainsBulkDelete
     * @request DELETE:/api/domains/bulk
     * @secure
     */
    domainsBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/domains/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Domains
     * @name DomainsExportList
     * @request GET:/api/domains/export
     * @secure
     */
    domainsExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/domains/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Email
     * @name EmailVerifyDetail
     * @request GET:/api/email/verify/{email}
     * @secure
     */
    emailVerifyDetail: (email: string, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/email/verify/${email}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailGroups
     * @name EmailGroupsTranslationDraftDetail
     * @request GET:/api/email-groups/{id}/translation-draft/{language}
     * @secure
     */
    emailGroupsTranslationDraftDetail: (
      id: number,
      language: string,
      query?: {
        /** @default "EmptyCopy" */
        transformer?: "EmptyCopy" | "KeepOriginal";
      },
      params: RequestParams = {},
    ) =>
      this.request<EmailGroupDetailsDto, void | ProblemDetails>({
        path: `/api/email-groups/${id}/translation-draft/${language}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailGroups
     * @name EmailGroupsTranslationsList
     * @request GET:/api/email-groups/{id}/translations
     * @secure
     */
    emailGroupsTranslationsList: (id: number, params: RequestParams = {}) =>
      this.request<EmailGroupDetailsDto[], void | ProblemDetails>({
        path: `/api/email-groups/${id}/translations`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailGroups
     * @name EmailGroupsSyncList
     * @request GET:/api/email-groups/sync
     * @secure
     */
    emailGroupsSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        EmailGroupDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/email-groups/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailGroups
     * @name EmailGroupsDetail
     * @request GET:/api/email-groups/{id}
     * @secure
     */
    emailGroupsDetail: (id: number, params: RequestParams = {}) =>
      this.request<EmailGroupDetailsDto, void | ProblemDetails>({
        path: `/api/email-groups/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailGroups
     * @name EmailGroupsPartialUpdate
     * @request PATCH:/api/email-groups/{id}
     * @secure
     */
    emailGroupsPartialUpdate: (
      id: number,
      data: EmailGroupUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<EmailGroupDetailsDto, void | ProblemDetails>({
        path: `/api/email-groups/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailGroups
     * @name EmailGroupsDelete
     * @request DELETE:/api/email-groups/{id}
     * @secure
     */
    emailGroupsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/email-groups/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailGroups
     * @name EmailGroupsCreate
     * @request POST:/api/email-groups
     * @secure
     */
    emailGroupsCreate: (
      data: EmailGroupCreateDto,
      params: RequestParams = {},
    ) =>
      this.request<EmailGroupDetailsDto, void | ProblemDetails>({
        path: `/api/email-groups`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailGroups
     * @name EmailGroupsList
     * @request GET:/api/email-groups
     * @secure
     */
    emailGroupsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<EmailGroupDetailsDto[], void | ProblemDetails>({
        path: `/api/email-groups`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailGroups
     * @name EmailGroupsBulkDelete
     * @request DELETE:/api/email-groups/bulk
     * @secure
     */
    emailGroupsBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/email-groups/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailGroups
     * @name EmailGroupsExportList
     * @request GET:/api/email-groups/export
     * @secure
     */
    emailGroupsExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/email-groups/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesAiTranslationDraftDetail
     * @request GET:/api/email-templates/{id}/ai-translation-draft/{language}
     * @secure
     */
    emailTemplatesAiTranslationDraftDetail: (
      id: number,
      language: string,
      query?: {
        /** @format int32 */
        emailGroupId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<EmailTemplateDetailsDto, ProblemDetails>({
        path: `/api/email-templates/${id}/ai-translation-draft/${language}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesAiDraftCreate
     * @request POST:/api/email-templates/ai-draft
     * @secure
     */
    emailTemplatesAiDraftCreate: (
      data: EmailTemplateGenerationRequest,
      params: RequestParams = {},
    ) =>
      this.request<EmailTemplateDetailsDto, ProblemDetails>({
        path: `/api/email-templates/ai-draft`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesAiEditCreate
     * @request POST:/api/email-templates/ai-edit
     * @secure
     */
    emailTemplatesAiEditCreate: (
      data: EmailTemplateEditRequest,
      params: RequestParams = {},
    ) =>
      this.request<EmailTemplateDetailsDto, ProblemDetails>({
        path: `/api/email-templates/ai-edit`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesCreate
     * @request POST:/api/email-templates
     * @secure
     */
    emailTemplatesCreate: (
      data: EmailTemplateCreateDto,
      params: RequestParams = {},
    ) =>
      this.request<EmailTemplateDetailsDto, void | ProblemDetails>({
        path: `/api/email-templates`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesList
     * @request GET:/api/email-templates
     * @secure
     */
    emailTemplatesList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<EmailTemplateDetailsDto[], void | ProblemDetails>({
        path: `/api/email-templates`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesPartialUpdate
     * @request PATCH:/api/email-templates/{id}
     * @secure
     */
    emailTemplatesPartialUpdate: (
      id: number,
      data: EmailTemplateUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<EmailTemplateDetailsDto, void | ProblemDetails>({
        path: `/api/email-templates/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesDetail
     * @request GET:/api/email-templates/{id}
     * @secure
     */
    emailTemplatesDetail: (id: number, params: RequestParams = {}) =>
      this.request<EmailTemplateDetailsDto, void | ProblemDetails>({
        path: `/api/email-templates/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesDelete
     * @request DELETE:/api/email-templates/{id}
     * @secure
     */
    emailTemplatesDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/email-templates/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesPreviewCreate
     * @request POST:/api/email-templates/preview
     * @secure
     */
    emailTemplatesPreviewCreate: (
      data: EmailTemplatePreviewRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<EmailTemplatePreviewResultDto, ProblemDetails>({
        path: `/api/email-templates/preview`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesSendTestCreate
     * @request POST:/api/email-templates/send-test
     * @secure
     */
    emailTemplatesSendTestCreate: (
      data: EmailTemplateSendTestDto,
      params: RequestParams = {},
    ) =>
      this.request<void, ProblemDetails>({
        path: `/api/email-templates/send-test`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesSenderNamesList
     * @request GET:/api/email-templates/sender-names
     * @secure
     */
    emailTemplatesSenderNamesList: (
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/email-templates/sender-names`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesSenderEmailsList
     * @request GET:/api/email-templates/sender-emails
     * @secure
     */
    emailTemplatesSenderEmailsList: (
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/email-templates/sender-emails`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesTranslationDraftDetail
     * @request GET:/api/email-templates/{id}/translation-draft/{language}
     * @secure
     */
    emailTemplatesTranslationDraftDetail: (
      id: number,
      language: string,
      query?: {
        /** @default "EmptyCopy" */
        transformer?: "EmptyCopy" | "KeepOriginal";
      },
      params: RequestParams = {},
    ) =>
      this.request<EmailTemplateDetailsDto, void | ProblemDetails>({
        path: `/api/email-templates/${id}/translation-draft/${language}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesTranslationsList
     * @request GET:/api/email-templates/{id}/translations
     * @secure
     */
    emailTemplatesTranslationsList: (id: number, params: RequestParams = {}) =>
      this.request<EmailTemplateDetailsDto[], void | ProblemDetails>({
        path: `/api/email-templates/${id}/translations`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesSyncList
     * @request GET:/api/email-templates/sync
     * @secure
     */
    emailTemplatesSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
        /**
         * Include base versions of modified items for three-way merge support
         * @default false
         */
        includeBase?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        EmailTemplateDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/email-templates/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesChangeLogList
     * @request GET:/api/email-templates/{id}/change-log
     * @secure
     */
    emailTemplatesChangeLogList: (
      id: number,
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        EmailTemplateUpdateDtoChangeLogDetailsDto[],
        void | ProblemDetails
      >({
        path: `/api/email-templates/${id}/change-log`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesBulkDelete
     * @request DELETE:/api/email-templates/bulk
     * @secure
     */
    emailTemplatesBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/email-templates/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailTemplates
     * @name EmailTemplatesExportList
     * @request GET:/api/email-templates/export
     * @secure
     */
    emailTemplatesExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/email-templates/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesCreate
     * @request POST:/api/files
     * @secure
     */
    filesCreate: (
      data: {
        /** @format binary */
        File: File;
        ScopeUid: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<FileDetailsDto, void | ProblemDetails>({
        path: `/api/files`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesDetail
     * @request GET:/api/files/{pathToFile}
     * @secure
     */
    filesDetail: (pathToFile: string, params: RequestParams = {}) =>
      this.request<void, ProblemDetails>({
        path: `/api/files/${pathToFile}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Identity
     * @name IdentityAzureLoginList
     * @request GET:/api/identity/azure-login
     * @secure
     */
    identityAzureLoginList: (
      query?: {
        /** @default "/" */
        returnUrl?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/identity/azure-login`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Identity
     * @name IdentityAzureLoginCallbackList
     * @request GET:/api/identity/azure-login-callback
     * @secure
     */
    identityAzureLoginCallbackList: (
      query?: {
        /** @default "/" */
        returnUrl?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/identity/azure-login-callback`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Identity
     * @name IdentityLoginCreate
     * @request POST:/api/identity/login
     * @secure
     */
    identityLoginCreate: (data: LoginDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/identity/login`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Identity
     * @name IdentityForgotPasswordCreate
     * @request POST:/api/identity/forgot-password
     * @secure
     */
    identityForgotPasswordCreate: (
      data: ForgotPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/identity/forgot-password`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Identity
     * @name IdentityResetPasswordCreate
     * @request POST:/api/identity/reset-password
     * @secure
     */
    identityResetPasswordCreate: (
      data: ResetPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/identity/reset-password`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Identity
     * @name IdentityChangePasswordCreate
     * @request POST:/api/identity/change-password
     * @secure
     */
    identityChangePasswordCreate: (
      data: ChangePasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/identity/change-password`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Identity
     * @name IdentityExchangeTokenCreate
     * @request POST:/api/identity/exchange-token
     * @secure
     */
    identityExchangeTokenCreate: (
      data: TokenExchangeDto,
      params: RequestParams = {},
    ) =>
      this.request<JWTokenDto, void | ProblemDetails>({
        path: `/api/identity/exchange-token`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Identity
     * @name IdentityDeviceInitiateCreate
     * @request POST:/api/identity/device/initiate
     * @secure
     */
    identityDeviceInitiateCreate: (params: RequestParams = {}) =>
      this.request<DeviceAuthInitiateDto, ProblemDetails>({
        path: `/api/identity/device/initiate`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Identity
     * @name IdentityDevicePollCreate
     * @request POST:/api/identity/device/poll
     * @secure
     */
    identityDevicePollCreate: (
      data: DeviceAuthPollDto,
      params: RequestParams = {},
    ) =>
      this.request<JWTokenDto, void | ProblemDetails>({
        path: `/api/identity/device/poll`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Identity
     * @name IdentityDeviceVerifyCreate
     * @request POST:/api/identity/device/verify
     * @secure
     */
    identityDeviceVerifyCreate: (
      data: DeviceAuthVerificationDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/identity/device/verify`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Identity
     * @name IdentityDeviceDenyCreate
     * @request POST:/api/identity/device/deny
     * @secure
     */
    identityDeviceDenyCreate: (
      data: DeviceAuthVerificationDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/identity/device/deny`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Links
     * @name LinksCreate
     * @request POST:/api/links
     * @secure
     */
    linksCreate: (data: LinkCreateDto, params: RequestParams = {}) =>
      this.request<LinkDetailsDto, void | ProblemDetails>({
        path: `/api/links`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Links
     * @name LinksList
     * @request GET:/api/links
     * @secure
     */
    linksList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<LinkDetailsDto[], void | ProblemDetails>({
        path: `/api/links`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Links
     * @name LinksSyncList
     * @request GET:/api/links/sync
     * @secure
     */
    linksSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<LinkDetailsDtoInt32SyncResponseDto, void | ProblemDetails>({
        path: `/api/links/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Links
     * @name LinksImportCreate
     * @request POST:/api/links/import
     * @secure
     */
    linksImportCreate: (data: LinkImportDto[], params: RequestParams = {}) =>
      this.request<ImportResult, void | ProblemDetails>({
        path: `/api/links/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Links
     * @name LinksDetail
     * @request GET:/api/links/{id}
     * @secure
     */
    linksDetail: (id: number, params: RequestParams = {}) =>
      this.request<LinkDetailsDto, void | ProblemDetails>({
        path: `/api/links/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Links
     * @name LinksPartialUpdate
     * @request PATCH:/api/links/{id}
     * @secure
     */
    linksPartialUpdate: (
      id: number,
      data: LinkUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<LinkDetailsDto, void | ProblemDetails>({
        path: `/api/links/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Links
     * @name LinksDelete
     * @request DELETE:/api/links/{id}
     * @secure
     */
    linksDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/links/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Links
     * @name LinksBulkDelete
     * @request DELETE:/api/links/bulk
     * @secure
     */
    linksBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/links/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Links
     * @name LinksExportList
     * @request GET:/api/links/export
     * @secure
     */
    linksExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/links/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Locks
     * @name LocksDetail
     * @request GET:/api/locks/{key}
     * @secure
     */
    locksDetail: (key: string, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/locks/${key}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Locks
     * @name LocksReleaseList
     * @request GET:/api/locks/{key}/release
     * @secure
     */
    locksReleaseList: (key: string, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/locks/${key}/release`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Logs
     * @name LogsList
     * @request GET:/api/logs
     * @secure
     */
    logsList: (params: RequestParams = {}) =>
      this.request<LogRecord[], void | ProblemDetails>({
        path: `/api/logs`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersMeList
     * @request GET:/api/users/me
     * @secure
     */
    usersMeList: (params: RequestParams = {}) =>
      this.request<UserDetailsDto, void | ProblemDetails>({
        path: `/api/users/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersMePartialUpdate
     * @request PATCH:/api/users/me
     * @secure
     */
    usersMePartialUpdate: (data: UserUpdateDto, params: RequestParams = {}) =>
      this.request<UserDetailsDto, void | ProblemDetails>({
        path: `/api/users/me`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaCreate
     * @request POST:/api/media
     * @secure
     */
    mediaCreate: (
      data: {
        /** @format binary */
        File: File;
        ScopeUid: string;
        Description?: string;
        Tags?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<MediaDetailsDto, void | ProblemDetails>({
        path: `/api/media`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaList
     * @request GET:/api/media
     * @secure
     */
    mediaList: (
      query?: {
        query?: string;
        scopeUid?: string;
        /** @default false */
        includeFolders?: boolean;
        order?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<MediaDetailsDto[], ProblemDetails>({
        path: `/api/media`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaPartialUpdate
     * @request PATCH:/api/media
     * @secure
     */
    mediaPartialUpdate: (
      data: {
        /** @format binary */
        File?: File;
        ScopeUid: string;
        FileName: string;
        Description?: string;
        Tags?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<MediaDetailsDto, void | ProblemDetails>({
        path: `/api/media`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaDetail
     * @request GET:/api/media/{pathToFile}
     * @secure
     */
    mediaDetail: (
      pathToFile: string,
      query?: {
        /** @default false */
        original?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, ProblemDetails>({
        path: `/api/media/${pathToFile}`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaDelete
     * @request DELETE:/api/media/{pathToFile}
     * @secure
     */
    mediaDelete: (pathToFile: string, params: RequestParams = {}) =>
      this.request<void, ProblemDetails>({
        path: `/api/media/${pathToFile}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaBulkDelete
     * @request DELETE:/api/media/bulk
     * @secure
     */
    mediaBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/media/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaTagsList
     * @request GET:/api/media/tags
     * @secure
     */
    mediaTagsList: (params: RequestParams = {}) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/media/tags`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaOptimizeAllCreate
     * @request POST:/api/media/optimize-all
     * @secure
     */
    mediaOptimizeAllCreate: (
      data: MediaBulkOptimizeRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<MediaOptimizeResponseDto, void | ProblemDetails>({
        path: `/api/media/optimize-all`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaResetCreate
     * @request POST:/api/media/reset
     * @secure
     */
    mediaResetCreate: (
      data: MediaTransformRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<MediaDetailsDto, void | ProblemDetails>({
        path: `/api/media/reset`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaResetAllCreate
     * @request POST:/api/media/reset-all
     * @secure
     */
    mediaResetAllCreate: (
      data: MediaBulkResetRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<MediaOptimizeResponseDto, void | ProblemDetails>({
        path: `/api/media/reset-all`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaRenameFolderCreate
     * @request POST:/api/media/rename-folder
     * @secure
     */
    mediaRenameFolderCreate: (
      data: MediaBulkRenameRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<MediaOptimizeResponseDto, void | ProblemDetails>({
        path: `/api/media/rename-folder`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaDeleteFolderCreate
     * @request POST:/api/media/delete-folder
     * @secure
     */
    mediaDeleteFolderCreate: (
      data: MediaBulkDeleteRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<MediaOptimizeResponseDto, void | ProblemDetails>({
        path: `/api/media/delete-folder`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaRenameCreate
     * @request POST:/api/media/rename
     * @secure
     */
    mediaRenameCreate: (
      data: MediaRenameRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<MediaDetailsDto, void | ProblemDetails>({
        path: `/api/media/rename`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaOptimizeCreate
     * @request POST:/api/media/optimize
     * @secure
     */
    mediaOptimizeCreate: (
      data: MediaTransformRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<MediaDetailsDto, void | ProblemDetails>({
        path: `/api/media/optimize`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaResizeCreate
     * @request POST:/api/media/resize
     * @secure
     */
    mediaResizeCreate: (
      data: MediaResizeRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<MediaDetailsDto, void | ProblemDetails>({
        path: `/api/media/resize`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaCropCreate
     * @request POST:/api/media/crop
     * @secure
     */
    mediaCropCreate: (data: MediaCropRequestDto, params: RequestParams = {}) =>
      this.request<MediaDetailsDto, void | ProblemDetails>({
        path: `/api/media/crop`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaSyncList
     * @request GET:/api/media/sync
     * @secure
     */
    mediaSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        MediaDetailsDtoMediaDeletedDtoSyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/media/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaFormatsList
     * @request GET:/api/media/formats
     * @secure
     */
    mediaFormatsList: (params: RequestParams = {}) =>
      this.request<string[], any>({
        path: `/api/media/formats`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name MediaReindexUsageCreate
     * @request POST:/api/media/reindex-usage
     * @secure
     */
    mediaReindexUsageCreate: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/media/reindex-usage`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags OrderItems
     * @name OrderItemsCreate
     * @request POST:/api/order-items
     * @secure
     */
    orderItemsCreate: (data: OrderItemCreateDto, params: RequestParams = {}) =>
      this.request<OrderItemDetailsDto, void | ProblemDetails>({
        path: `/api/order-items`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags OrderItems
     * @name OrderItemsList
     * @request GET:/api/order-items
     * @secure
     */
    orderItemsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<OrderItemDetailsDto[], void | ProblemDetails>({
        path: `/api/order-items`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags OrderItems
     * @name OrderItemsPartialUpdate
     * @request PATCH:/api/order-items/{id}
     * @secure
     */
    orderItemsPartialUpdate: (
      id: number,
      data: OrderItemUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<OrderItemDetailsDto, void | ProblemDetails>({
        path: `/api/order-items/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags OrderItems
     * @name OrderItemsDelete
     * @request DELETE:/api/order-items/{id}
     * @secure
     */
    orderItemsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/order-items/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags OrderItems
     * @name OrderItemsDetail
     * @request GET:/api/order-items/{id}
     * @secure
     */
    orderItemsDetail: (id: number, params: RequestParams = {}) =>
      this.request<OrderItemDetailsDto, void | ProblemDetails>({
        path: `/api/order-items/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags OrderItems
     * @name OrderItemsBulkDelete
     * @request DELETE:/api/order-items/bulk
     * @secure
     */
    orderItemsBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/order-items/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags OrderItems
     * @name OrderItemsSyncList
     * @request GET:/api/order-items/sync
     * @secure
     */
    orderItemsSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        OrderItemDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/order-items/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags OrderItems
     * @name OrderItemsImportCreate
     * @request POST:/api/order-items/import
     * @secure
     */
    orderItemsImportCreate: (
      data: OrderItemImportDto[],
      params: RequestParams = {},
    ) =>
      this.request<ImportResult, void | ProblemDetails>({
        path: `/api/order-items/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags OrderItems
     * @name OrderItemsExportList
     * @request GET:/api/order-items/export
     * @secure
     */
    orderItemsExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/order-items/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersTagsList
     * @request GET:/api/orders/tags
     * @secure
     */
    ordersTagsList: (params: RequestParams = {}) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/orders/tags`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersCommentsList
     * @request GET:/api/orders/{id}/comments
     * @secure
     */
    ordersCommentsList: (id: number, params: RequestParams = {}) =>
      this.request<CommentDetailsDto[], void | ProblemDetails>({
        path: `/api/orders/${id}/comments`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersCommentsCreate
     * @request POST:/api/orders/{id}/comments
     * @secure
     */
    ordersCommentsCreate: (
      id: number,
      data: CommentCreateBaseDto,
      params: RequestParams = {},
    ) =>
      this.request<CommentDetailsDto, void | ProblemDetails>({
        path: `/api/orders/${id}/comments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersCurrenciesList
     * @request GET:/api/orders/currencies
     * @secure
     */
    ordersCurrenciesList: (params: RequestParams = {}) =>
      this.request<string[], void | ProblemDetails>({
        path: `/api/orders/currencies`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersSyncList
     * @request GET:/api/orders/sync
     * @secure
     */
    ordersSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<OrderDetailsDtoInt32SyncResponseDto, void | ProblemDetails>({
        path: `/api/orders/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersImportCreate
     * @request POST:/api/orders/import
     * @secure
     */
    ordersImportCreate: (data: OrderImportDto[], params: RequestParams = {}) =>
      this.request<ImportResult, void | ProblemDetails>({
        path: `/api/orders/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersDetail
     * @request GET:/api/orders/{id}
     * @secure
     */
    ordersDetail: (id: number, params: RequestParams = {}) =>
      this.request<OrderDetailsDto, void | ProblemDetails>({
        path: `/api/orders/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersPartialUpdate
     * @request PATCH:/api/orders/{id}
     * @secure
     */
    ordersPartialUpdate: (
      id: number,
      data: OrderUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<OrderDetailsDto, void | ProblemDetails>({
        path: `/api/orders/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersDelete
     * @request DELETE:/api/orders/{id}
     * @secure
     */
    ordersDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/orders/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersCreate
     * @request POST:/api/orders
     * @secure
     */
    ordersCreate: (data: OrderCreateDto, params: RequestParams = {}) =>
      this.request<OrderDetailsDto, void | ProblemDetails>({
        path: `/api/orders`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersList
     * @request GET:/api/orders
     * @secure
     */
    ordersList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<OrderDetailsDto[], void | ProblemDetails>({
        path: `/api/orders`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersBulkDelete
     * @request DELETE:/api/orders/bulk
     * @secure
     */
    ordersBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/orders/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name OrdersExportList
     * @request GET:/api/orders/export
     * @secure
     */
    ordersExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/orders/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Promotions
     * @name PromotionsSyncList
     * @request GET:/api/promotions/sync
     * @secure
     */
    promotionsSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        PromotionDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/promotions/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Promotions
     * @name PromotionsDetail
     * @request GET:/api/promotions/{id}
     * @secure
     */
    promotionsDetail: (id: number, params: RequestParams = {}) =>
      this.request<PromotionDetailsDto, void | ProblemDetails>({
        path: `/api/promotions/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Promotions
     * @name PromotionsPartialUpdate
     * @request PATCH:/api/promotions/{id}
     * @secure
     */
    promotionsPartialUpdate: (
      id: number,
      data: PromotionUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<PromotionDetailsDto, void | ProblemDetails>({
        path: `/api/promotions/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Promotions
     * @name PromotionsDelete
     * @request DELETE:/api/promotions/{id}
     * @secure
     */
    promotionsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/promotions/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Promotions
     * @name PromotionsCreate
     * @request POST:/api/promotions
     * @secure
     */
    promotionsCreate: (data: PromotionCreateDto, params: RequestParams = {}) =>
      this.request<PromotionDetailsDto, void | ProblemDetails>({
        path: `/api/promotions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Promotions
     * @name PromotionsList
     * @request GET:/api/promotions
     * @secure
     */
    promotionsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PromotionDetailsDto[], void | ProblemDetails>({
        path: `/api/promotions`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Promotions
     * @name PromotionsBulkDelete
     * @request DELETE:/api/promotions/bulk
     * @secure
     */
    promotionsBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/promotions/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Promotions
     * @name PromotionsExportList
     * @request GET:/api/promotions/export
     * @secure
     */
    promotionsExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/promotions/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Redirects
     * @name RedirectsDiscoverList
     * @request GET:/api/redirects/discover
     * @secure
     */
    redirectsDiscoverList: (params: RequestParams = {}) =>
      this.request<RedirectDetailsDto[], void | ProblemDetails>({
        path: `/api/redirects/discover`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Segments
     * @name SegmentsCreate
     * @request POST:/api/segments
     * @secure
     */
    segmentsCreate: (data: SegmentCreateDto, params: RequestParams = {}) =>
      this.request<SegmentDetailsDto, void | ProblemDetails>({
        path: `/api/segments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Segments
     * @name SegmentsList
     * @request GET:/api/segments
     * @secure
     */
    segmentsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SegmentDetailsDto[], void | ProblemDetails>({
        path: `/api/segments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Segments
     * @name SegmentsPartialUpdate
     * @request PATCH:/api/segments/{id}
     * @secure
     */
    segmentsPartialUpdate: (
      id: number,
      data: SegmentUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<SegmentDetailsDto, void | ProblemDetails>({
        path: `/api/segments/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Segments
     * @name SegmentsDetail
     * @request GET:/api/segments/{id}
     * @secure
     */
    segmentsDetail: (id: number, params: RequestParams = {}) =>
      this.request<SegmentDetailsDto, void | ProblemDetails>({
        path: `/api/segments/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Segments
     * @name SegmentsDelete
     * @request DELETE:/api/segments/{id}
     * @secure
     */
    segmentsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/segments/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Segments
     * @name SegmentsPreviewCreate
     * @request POST:/api/segments/preview
     * @secure
     */
    segmentsPreviewCreate: (
      data: SegmentDefinition,
      params: RequestParams = {},
    ) =>
      this.request<SegmentPreviewResultDto, void | ProblemDetails>({
        path: `/api/segments/preview`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Segments
     * @name SegmentsContactsList
     * @request GET:/api/segments/{id}/contacts
     * @secure
     */
    segmentsContactsList: (
      id: number,
      query?: {
        query?: string;
        /** @format int32 */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ContactDetailsDto[], void | ProblemDetails>({
        path: `/api/segments/${id}/contacts`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Segments
     * @name SegmentsRecalculateCreate
     * @request POST:/api/segments/{id}/recalculate
     * @secure
     */
    segmentsRecalculateCreate: (id: number, params: RequestParams = {}) =>
      this.request<SegmentDetailsDto, void | ProblemDetails>({
        path: `/api/segments/${id}/recalculate`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Segments
     * @name SegmentsSyncList
     * @request GET:/api/segments/sync
     * @secure
     */
    segmentsSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        SegmentDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/segments/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Segments
     * @name SegmentsBulkDelete
     * @request DELETE:/api/segments/bulk
     * @secure
     */
    segmentsBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/segments/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Segments
     * @name SegmentsExportList
     * @request GET:/api/segments/export
     * @secure
     */
    segmentsExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/segments/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags SequenceContacts
     * @name SequencesContactsList
     * @request GET:/api/sequences/{sequenceId}/contacts
     * @secure
     */
    sequencesContactsList: (
      sequenceId: number,
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ContactDetailsDto[], void | ProblemDetails>({
        path: `/api/sequences/${sequenceId}/contacts`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SequenceDeliveries
     * @name SequencesDeliveriesList
     * @request GET:/api/sequences/{sequenceId}/deliveries
     * @secure
     */
    sequencesDeliveriesList: (
      sequenceId: number,
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SequenceDeliveryDetailsDto[], void>({
        path: `/api/sequences/${sequenceId}/deliveries`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SequenceDeliveries
     * @name SequencesDeliveriesDetail
     * @request GET:/api/sequences/{sequenceId}/deliveries/{deliveryId}
     * @secure
     */
    sequencesDeliveriesDetail: (
      sequenceId: number,
      deliveryId: number,
      params: RequestParams = {},
    ) =>
      this.request<SequenceDeliveryDetailsDto, void | ProblemDetails>({
        path: `/api/sequences/${sequenceId}/deliveries/${deliveryId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SequenceEnrollments
     * @name SequencesEnrollmentsList
     * @request GET:/api/sequences/{sequenceId}/enrollments
     * @secure
     */
    sequencesEnrollmentsList: (
      sequenceId: number,
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SequenceEnrollmentDetailsDto[], void>({
        path: `/api/sequences/${sequenceId}/enrollments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SequenceEnrollments
     * @name SequencesEnrollmentsCreate
     * @request POST:/api/sequences/{sequenceId}/enrollments
     * @secure
     */
    sequencesEnrollmentsCreate: (
      sequenceId: number,
      data: SequenceEnrollmentCreateDto,
      params: RequestParams = {},
    ) =>
      this.request<SequenceEnrollmentDetailsDto[], void | ProblemDetails>({
        path: `/api/sequences/${sequenceId}/enrollments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SequenceEnrollments
     * @name SequencesEnrollmentsDetail
     * @request GET:/api/sequences/{sequenceId}/enrollments/{enrollmentId}
     * @secure
     */
    sequencesEnrollmentsDetail: (
      sequenceId: number,
      enrollmentId: number,
      params: RequestParams = {},
    ) =>
      this.request<SequenceEnrollmentDetailsDto, void | ProblemDetails>({
        path: `/api/sequences/${sequenceId}/enrollments/${enrollmentId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SequenceEnrollments
     * @name SequencesEnrollmentsDelete
     * @request DELETE:/api/sequences/{sequenceId}/enrollments/{enrollmentId}
     * @secure
     */
    sequencesEnrollmentsDelete: (
      sequenceId: number,
      enrollmentId: number,
      params: RequestParams = {},
    ) =>
      this.request<SequenceEnrollmentDetailsDto, void | ProblemDetails>({
        path: `/api/sequences/${sequenceId}/enrollments/${enrollmentId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SequenceEnrollments
     * @name SequencesEnrollmentsStopCreate
     * @request POST:/api/sequences/{sequenceId}/enrollments/stop
     * @secure
     */
    sequencesEnrollmentsStopCreate: (
      sequenceId: number,
      data: SequenceEnrollmentStopDto,
      params: RequestParams = {},
    ) =>
      this.request<SequenceEnrollmentDetailsDto[], void | ProblemDetails>({
        path: `/api/sequences/${sequenceId}/enrollments/stop`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesDetail
     * @request GET:/api/sequences/{id}
     * @secure
     */
    sequencesDetail: (id: number, params: RequestParams = {}) =>
      this.request<SequenceDetailsDto, void | ProblemDetails>({
        path: `/api/sequences/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesUpdate
     * @request PUT:/api/sequences/{id}
     * @secure
     */
    sequencesUpdate: (
      id: number,
      data: SequenceCreateDto,
      params: RequestParams = {},
    ) =>
      this.request<SequenceDetailsDto, void | ProblemDetails>({
        path: `/api/sequences/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesPartialUpdate
     * @request PATCH:/api/sequences/{id}
     * @secure
     */
    sequencesPartialUpdate: (
      id: number,
      data: SequenceUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<SequenceDetailsDto, void | ProblemDetails>({
        path: `/api/sequences/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesDelete
     * @request DELETE:/api/sequences/{id}
     * @secure
     */
    sequencesDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/sequences/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesCreate
     * @request POST:/api/sequences
     * @secure
     */
    sequencesCreate: (data: SequenceCreateDto, params: RequestParams = {}) =>
      this.request<SequenceDetailsDto, void | ProblemDetails>({
        path: `/api/sequences`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesList
     * @request GET:/api/sequences
     * @secure
     */
    sequencesList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SequenceDetailsDto[], void | ProblemDetails>({
        path: `/api/sequences`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesActivateCreate
     * @request POST:/api/sequences/{id}/activate
     * @secure
     */
    sequencesActivateCreate: (id: number, params: RequestParams = {}) =>
      this.request<SequenceDetailsDto, ProblemDetails>({
        path: `/api/sequences/${id}/activate`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesPauseCreate
     * @request POST:/api/sequences/{id}/pause
     * @secure
     */
    sequencesPauseCreate: (id: number, params: RequestParams = {}) =>
      this.request<SequenceDetailsDto, ProblemDetails>({
        path: `/api/sequences/${id}/pause`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesArchiveCreate
     * @request POST:/api/sequences/{id}/archive
     * @secure
     */
    sequencesArchiveCreate: (id: number, params: RequestParams = {}) =>
      this.request<SequenceDetailsDto, ProblemDetails>({
        path: `/api/sequences/${id}/archive`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesStatisticsList
     * @request GET:/api/sequences/{id}/statistics
     * @secure
     */
    sequencesStatisticsList: (id: number, params: RequestParams = {}) =>
      this.request<SequenceStatisticsDto, ProblemDetails>({
        path: `/api/sequences/${id}/statistics`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesSyncList
     * @request GET:/api/sequences/sync
     * @secure
     */
    sequencesSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        SequenceDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/sequences/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesBulkDelete
     * @request DELETE:/api/sequences/bulk
     * @secure
     */
    sequencesBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/sequences/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sequences
     * @name SequencesExportList
     * @request GET:/api/sequences/export
     * @secure
     */
    sequencesExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/sequences/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsCreate
     * @request POST:/api/settings
     * @secure
     */
    settingsCreate: (data: SettingCreateDto, params: RequestParams = {}) =>
      this.request<SettingDetailsDto, void | ProblemDetails>({
        path: `/api/settings`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsList
     * @request GET:/api/settings
     * @secure
     */
    settingsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SettingDetailsDto[], void | ProblemDetails>({
        path: `/api/settings`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsSystemList
     * @request GET:/api/settings/system
     * @secure
     */
    settingsSystemList: (
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SettingDetailsDto[], void | ProblemDetails>({
        path: `/api/settings/system`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsSystemDetail
     * @request GET:/api/settings/system/{key}
     * @secure
     */
    settingsSystemDetail: (
      key: string,
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SettingDetailsDto, void | ProblemDetails>({
        path: `/api/settings/system/${key}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsSystemUpdate
     * @request PUT:/api/settings/system/{key}
     * @secure
     */
    settingsSystemUpdate: (
      key: string,
      query?: {
        value?: string;
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SettingDetailsDto, void | ProblemDetails>({
        path: `/api/settings/system/${key}`,
        method: "PUT",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsSystemDelete
     * @request DELETE:/api/settings/system/{key}
     * @secure
     */
    settingsSystemDelete: (
      key: string,
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/settings/system/${key}`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsUserList
     * @request GET:/api/settings/user
     * @secure
     */
    settingsUserList: (
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, SettingValueDto>, void | ProblemDetails>({
        path: `/api/settings/user`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsUserDetail
     * @request GET:/api/settings/user/{key}
     * @secure
     */
    settingsUserDetail: (
      key: string,
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SettingValueDto, void | ProblemDetails>({
        path: `/api/settings/user/${key}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsUserUpdate
     * @request PUT:/api/settings/user/{key}
     * @secure
     */
    settingsUserUpdate: (
      key: string,
      query?: {
        value?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SettingDetailsDto, void | ProblemDetails>({
        path: `/api/settings/user/${key}`,
        method: "PUT",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsUserDelete
     * @request DELETE:/api/settings/user/{key}
     * @secure
     */
    settingsUserDelete: (key: string, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/settings/user/${key}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsUserOverridesList
     * @request GET:/api/settings/user/overrides
     * @secure
     */
    settingsUserOverridesList: (params: RequestParams = {}) =>
      this.request<SettingDetailsDto[], void | ProblemDetails>({
        path: `/api/settings/user/overrides`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsSyncList
     * @request GET:/api/settings/sync
     * @secure
     */
    settingsSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        SettingDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/settings/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsImportCreate
     * @request POST:/api/settings/import
     * @secure
     */
    settingsImportCreate: (
      data: SettingImportDto[],
      params: RequestParams = {},
    ) =>
      this.request<ImportResult, void | ProblemDetails>({
        path: `/api/settings/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsDetail
     * @request GET:/api/settings/{id}
     * @secure
     */
    settingsDetail: (id: number, params: RequestParams = {}) =>
      this.request<SettingDetailsDto, void | ProblemDetails>({
        path: `/api/settings/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsPartialUpdate
     * @request PATCH:/api/settings/{id}
     * @secure
     */
    settingsPartialUpdate: (
      id: number,
      data: SettingUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<SettingDetailsDto, void | ProblemDetails>({
        path: `/api/settings/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsDelete
     * @request DELETE:/api/settings/{id}
     * @secure
     */
    settingsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/settings/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsBulkDelete
     * @request DELETE:/api/settings/bulk
     * @secure
     */
    settingsBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/settings/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Settings
     * @name SettingsExportList
     * @request GET:/api/settings/export
     * @secure
     */
    settingsExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/settings/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sse
     * @name SseSupportedEntitiesList
     * @request GET:/api/sse/supported-entities
     * @secure
     */
    sseSupportedEntitiesList: (params: RequestParams = {}) =>
      this.request<string[], void>({
        path: `/api/sse/supported-entities`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sse
     * @name SseConnectionInfoList
     * @request GET:/api/sse/connection-info
     * @secure
     */
    sseConnectionInfoList: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/sse/connection-info`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sse
     * @name SseStreamList
     * @request GET:/api/sse/stream
     * @secure
     */
    sseStreamList: (
      query?: {
        /** @default "*" */
        entities?: string;
        /** @default false */
        includeContent?: boolean;
        /** @default false */
        includeLiveDrafts?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/sse/stream`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Sse
     * @name SseStatsList
     * @request GET:/api/sse/stats
     * @secure
     */
    sseStatsList: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/sse/stats`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Statistics
     * @name StatisticsCreate
     * @request POST:/api/statistics
     * @secure
     */
    statisticsCreate: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/statistics`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tasks
     * @name TasksList
     * @request GET:/api/tasks
     * @secure
     */
    tasksList: (params: RequestParams = {}) =>
      this.request<TaskDetailsDto[], void | ProblemDetails>({
        path: `/api/tasks`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tasks
     * @name TasksDetail
     * @request GET:/api/tasks/{name}
     * @secure
     */
    tasksDetail: (name: string, params: RequestParams = {}) =>
      this.request<TaskDetailsDto, void | ProblemDetails>({
        path: `/api/tasks/${name}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tasks
     * @name TasksStartDetail
     * @request GET:/api/tasks/start/{name}
     * @secure
     */
    tasksStartDetail: (name: string, params: RequestParams = {}) =>
      this.request<TaskDetailsDto, void | ProblemDetails>({
        path: `/api/tasks/start/${name}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tasks
     * @name TasksStopDetail
     * @request GET:/api/tasks/stop/{name}
     * @secure
     */
    tasksStopDetail: (name: string, params: RequestParams = {}) =>
      this.request<TaskDetailsDto, void | ProblemDetails>({
        path: `/api/tasks/stop/${name}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tasks
     * @name TasksExecuteDetail
     * @request GET:/api/tasks/execute/{name}
     * @secure
     */
    tasksExecuteDetail: (name: string, params: RequestParams = {}) =>
      this.request<TaskExecutionDto, void | ProblemDetails>({
        path: `/api/tasks/execute/${name}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tasks
     * @name TasksLogsList
     * @request GET:/api/tasks/logs
     * @secure
     */
    tasksLogsList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<TaskExecutionLogDetailsDto[], void | ProblemDetails>({
        path: `/api/tasks/logs`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Unsubscribes
     * @name UnsubscribesSyncList
     * @request GET:/api/unsubscribes/sync
     * @secure
     */
    unsubscribesSyncList: (
      query?: {
        syncToken?: string;
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        UnsubscribeDetailsDtoInt32SyncResponseDto,
        void | ProblemDetails
      >({
        path: `/api/unsubscribes/sync`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Unsubscribes
     * @name UnsubscribesImportCreate
     * @request POST:/api/unsubscribes/import
     * @secure
     */
    unsubscribesImportCreate: (
      data: UnsubscribeImportDto[],
      params: RequestParams = {},
    ) =>
      this.request<ImportResult, void | ProblemDetails>({
        path: `/api/unsubscribes/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Unsubscribes
     * @name UnsubscribesDetail
     * @request GET:/api/unsubscribes/{id}
     * @secure
     */
    unsubscribesDetail: (id: number, params: RequestParams = {}) =>
      this.request<UnsubscribeDetailsDto, void | ProblemDetails>({
        path: `/api/unsubscribes/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Unsubscribes
     * @name UnsubscribesPartialUpdate
     * @request PATCH:/api/unsubscribes/{id}
     * @secure
     */
    unsubscribesPartialUpdate: (
      id: number,
      data: UnsubscribeDto,
      params: RequestParams = {},
    ) =>
      this.request<UnsubscribeDetailsDto, void | ProblemDetails>({
        path: `/api/unsubscribes/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Unsubscribes
     * @name UnsubscribesDelete
     * @request DELETE:/api/unsubscribes/{id}
     * @secure
     */
    unsubscribesDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/unsubscribes/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Unsubscribes
     * @name UnsubscribesCreate
     * @request POST:/api/unsubscribes
     * @secure
     */
    unsubscribesCreate: (data: UnsubscribeDto, params: RequestParams = {}) =>
      this.request<UnsubscribeDetailsDto, void | ProblemDetails>({
        path: `/api/unsubscribes`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Unsubscribes
     * @name UnsubscribesList
     * @request GET:/api/unsubscribes
     * @secure
     */
    unsubscribesList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<UnsubscribeDetailsDto[], void | ProblemDetails>({
        path: `/api/unsubscribes`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Unsubscribes
     * @name UnsubscribesBulkDelete
     * @request DELETE:/api/unsubscribes/bulk
     * @secure
     */
    unsubscribesBulkDelete: (data: number[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/unsubscribes/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Unsubscribes
     * @name UnsubscribesExportList
     * @request GET:/api/unsubscribes/export
     * @secure
     */
    unsubscribesExportList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | ProblemDetails>({
        path: `/api/unsubscribes/export`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersList
     * @request GET:/api/users
     * @secure
     */
    usersList: (
      query?: {
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<UserDetailsDto[], void | ProblemDetails>({
        path: `/api/users`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersCreate
     * @request POST:/api/users
     * @secure
     */
    usersCreate: (data: UserCreateDto, params: RequestParams = {}) =>
      this.request<UserDetailsDto, void | ProblemDetails>({
        path: `/api/users`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersDetail
     * @request GET:/api/users/{id}
     * @secure
     */
    usersDetail: (id: string, params: RequestParams = {}) =>
      this.request<UserDetailsDto, void | ProblemDetails>({
        path: `/api/users/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersPartialUpdate
     * @request PATCH:/api/users/{id}
     * @secure
     */
    usersPartialUpdate: (
      id: string,
      data: UserUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<UserDetailsDto, void | ProblemDetails>({
        path: `/api/users/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersDelete
     * @request DELETE:/api/users/{id}
     * @secure
     */
    usersDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/users/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersBulkDelete
     * @request DELETE:/api/users/bulk
     * @secure
     */
    usersBulkDelete: (data: string[], params: RequestParams = {}) =>
      this.request<void, void | ProblemDetails>({
        path: `/api/users/bulk`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Version
     * @name VersionList
     * @request GET:/api/version
     * @secure
     */
    versionList: (params: RequestParams = {}) =>
      this.request<VersionDto, void>({
        path: `/api/version`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  go = {
    /**
     * No description
     *
     * @tags Links
     * @name GetGo
     * @request GET:/go/{uid}
     * @secure
     */
    getGo: (uid: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/go/${uid}`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
}
