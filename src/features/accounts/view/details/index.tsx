import { AccountDetailsDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useEffect, useMemo, useState } from "react";
import { DataView, DataViewNoLabel } from "components/data-view";
import { getContinentByCode, getCountryByCode } from "utils/general-helper";
import { Grid } from "@mui/material";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { AccountUrlHref } from "@features/accounts/index.styled";
import { useOutletContext } from "react-router-dom";

interface DataViewRow {
  label: string;
  value: unknown;
}

export const AccountView = () => {
  const context = useRequestContext();
  const { setBusy } = useModuleWrapperContext();
  const { account } = useOutletContext<{ account: AccountDetailsDto | null }>();
  const [country, setCountry] = useState<string>();
  const [continent, setContinent] = useState<string>();
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  useEffect(() => {
    if (!account) return;
    setBusy(async () => {
      try {
        if (account.countryCode) {
          const c = await getCountryByCode(context, account.countryCode);
          if (c) setCountry(c);
        }
        if (account.continentCode) {
          const cont = await getContinentByCode(context, account.continentCode);
          if (cont) setContinent(cont);
        }
      } catch (e) {
        console.log(e);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.countryCode, account?.continentCode]);

  const getAbsoluteUrl = (url: string) => {
    const absoluteUrl =
      url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    return (
      <AccountUrlHref href={absoluteUrl} target="_blank" rel="noopener noreferrer">
        {absoluteUrl}
      </AccountUrlHref>
    );
  };

  const accountSiteUrl = account && account.siteUrl && (
    <AccountUrlHref href={account.siteUrl} target="_blank" rel="noopener noreferrer">
      {account.siteUrl}
    </AccountUrlHref>
  );

  const accountAboutData: DataViewRow[] | undefined = account
    ? [
        { label: "Name", value: account.name || "" },
        { label: "Site url", value: accountSiteUrl || "" },
        { label: "Id", value: account.id ?? "" },
        {
          label: "Revenue",
          value:
            account.revenue !== null && account.revenue !== undefined
              ? currencyFormatter.format(account.revenue)
              : "",
        },
        {
          label: "Profit",
          value:
            account.profit !== null && account.profit !== undefined
              ? currencyFormatter.format(account.profit)
              : "",
        },
        { label: "TIN", value: account.tin || "" },
        { label: "Employees range", value: account.employeesRange || "" },
        { label: "Source", value: account.source || "" },
        {
          label: "Created",
          value: account.createdAt ? dateFormatter.format(new Date(account.createdAt)) : "",
        },
        {
          label: "Updated",
          value: account.updatedAt ? dateFormatter.format(new Date(account.updatedAt)) : "",
        },
      ]
    : undefined;

  const accountLocationData: DataViewRow[] | undefined = account
    ? [
        { label: "Address", value: account.address || "" },
        { label: "State", value: account.state || "" },
        { label: "City", value: account.cityName || "" },
        { label: "Country", value: country || "" },
        { label: "Continent", value: continent || "" },
        { label: "Country code", value: account.countryCode || "" },
        { label: "Continent code", value: account.continentCode || "" },
      ]
    : undefined;

  const accountOtherData: DataViewRow[] | undefined = account
    ? [
        { label: "Tags", value: account.tags?.join(", ") || "" },
        {
          label: "Contacts",
          value: account.contacts ? account.contacts.length : "",
        },
        {
          label: "Domains",
          value: account.domains ? account.domains.length : "",
        },
      ]
    : undefined;

  const socialEntries = account
    ? Object.entries(account.socialMedia ?? {}).filter(
        ([, value]) => typeof value === "string" && value.trim() !== ""
      )
    : undefined;

  const accountSocialMediaData: DataViewRow[] | undefined = socialEntries
    ? socialEntries.map(([label, value]) => ({ label, value: getAbsoluteUrl(value) }))
    : undefined;

  const hasLocation = !!(
    (account?.cityName && account.cityName.trim()) ||
    (account?.address && account.address.trim()) ||
    (country && country.trim()) ||
    (continent && continent.trim())
  );

  const hasOther = !!(
    (account?.tags && account.tags.length > 0) ||
    (account?.source && account.source.trim())
  );

  const hasSocial = !!(socialEntries && socialEntries.length > 0);

  return (
    <>
      <Grid container spacing={3} marginTop={4} paddingRight={4}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <DataView header="About" rows={accountAboutData} />
        </Grid>
        {hasLocation && (
          <Grid size={{ xs: 12, sm: 3 }}>
            <DataView header="Location" rows={accountLocationData} />
          </Grid>
        )}
        {hasSocial && (
          <Grid size={{ xs: 12, sm: 3 }}>
            <DataViewNoLabel header="Social media" rows={accountSocialMediaData} />
          </Grid>
        )}
        {hasOther && (
          <Grid size={{ xs: 12, sm: 3 }}>
            <DataView header="Other" rows={accountOtherData} />
          </Grid>
        )}
      </Grid>
    </>
  );
};
