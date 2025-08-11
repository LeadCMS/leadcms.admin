import { AccountDetailsDto } from "@lib/network/swagger-client";
import { CoreModule, viewFormRoute } from "@lib/router";
import { useRequestContext } from "@providers/request-provider";
import { useEffect, useState } from "react";
import { DataView, DataViewNoLabel } from "components/data-view";
import { getContinentByCode, getCountryByCode } from "utils/general-helper";
import { Grid } from "@mui/material";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { DataManagementBlock } from "@components/data-management";
import { AccountUrlHref } from "@features/accounts/index.styled";
import { useOutletContext } from "react-router-dom";
import { useRouteParams } from "typesafe-routes";

interface DataViewRow {
  label: string;
  value: unknown;
}

export const AccountView = () => {
  const context = useRequestContext();
  const { setBusy } = useModuleWrapperContext();
  const { client } = context;
  const { account } = useOutletContext<{ account: AccountDetailsDto | null }>();
  const { id } = useRouteParams(viewFormRoute);
  const [country, setCountry] = useState<string>();
  const [continent, setContinent] = useState<string>();
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

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
        {
          label: "Revenue",
          value:
            account.revenue !== null && account.revenue !== undefined
              ? currencyFormatter.format(account.revenue)
              : "",
        },
        { label: "Employees range", value: account.employeesRange || "" },
      ]
    : undefined;

  const accountLocationData: DataViewRow[] | undefined = account
    ? [
        { label: "City", value: account.cityName || "" },
        { label: "Country", value: country || "" },
        { label: "Continent", value: continent || "" },
      ]
    : undefined;

  const accountOtherData: DataViewRow[] | undefined = account
    ? [
        { label: "Tags", value: account.tags?.join(", ") || "" },
        { label: "Source", value: account.source || "" },
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
        <Grid size={{ xs: 12, sm: 6 }}>
          <DataManagementBlock
            header="Data Management"
            description="Please be aware that what
            has been deleted can never be brought back."
            entity="account"
            handleDeleteAsync={(idVal) => client.api.accountsDelete(idVal as number)}
            itemId={id}
            successNavigationRoute={CoreModule.accounts}
          ></DataManagementBlock>
        </Grid>
      </Grid>
    </>
  );
};
