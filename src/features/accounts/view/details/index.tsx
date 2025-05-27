import { AccountDetailsDto } from "@lib/network/swagger-client";
import { CoreModule, viewFormRoute } from "@lib/router";
import { useRequestContext } from "@providers/request-provider";
import { useEffect, useState } from "react";
import { useRouteParams } from "typesafe-routes";
import { DataView, DataViewNoLabel } from "components/data-view";
import { getContinentByCode, getCountryByCode } from "utils/general-helper";
import { Grid } from "@mui/material";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { DataManagementBlock } from "@components/data-management";
import { AccountUrlHref } from "@features/accounts/index.styled";

interface DataViewRow {
  label: string;
  value: any;
}

export const AccountView = () => {
  const context = useRequestContext();
  const { setBusy } = useModuleWrapperContext();
  const { client } = context;
  const { id } = useRouteParams(viewFormRoute);
  const [account, setAccount] = useState<AccountDetailsDto>();
  const [country, setCountry] = useState<string>();
  const [continent, setContinent] = useState<string>();

  useEffect(() => {
    setBusy(async () => {
      try {
        const { data } = await client.api.accountsDetail(id);
        setAccount(data);
        const country = await getCountryByCode(context, data.countryCode!);
        if (country) setCountry(country);
        const continent = await getContinentByCode(context, data.continentCode!);
        if (continent) setContinent(continent);
      } catch (e) {
        console.log(e);
      }
    });
  }, [client]);

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

  const accountAboutData: DataViewRow[] | undefined = account && [
    { label: "Name", value: account.name || "" },
    { label: "Site url", value: accountSiteUrl || "" },
    { label: "Revenue", value: account.revenue || "" },
    { label: "Employees range", value: account.employeesRange || "" },
  ];

  const accountLocationData: DataViewRow[] | undefined = account && [
    { label: "City", value: account.cityName || "" },
    { label: "Country", value: country || "" },
    { label: "Continent", value: continent || "" },
  ];

  const accountOtherData: DataViewRow[] | undefined = account && [
    { label: "Tags", value: account.tags?.join(", ") || "" },
    { label: "Source", value: account.source || "" },
  ];

  const accountSocialMediaData: DataViewRow[] | undefined =
    account?.socialMedia &&
    Object.entries(account.socialMedia!).map(([label, value]) => ({
      label,
      value: getAbsoluteUrl(value),
    }));

  return (
    <>
      <Grid container spacing={3} marginTop={4} paddingRight={4}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <DataView header="About" rows={accountAboutData} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <DataView header="Location" rows={accountLocationData} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <DataViewNoLabel header="Social media" rows={accountSocialMediaData} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <DataView header="Other" rows={accountOtherData} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DataManagementBlock
            header="Data Management"
            description="Please be aware that what
            has been deleted can never be brought back."
            entity="account"
            handleDeleteAsync={(id) => client.api.accountsDelete(id as number)}
            itemId={id}
            successNavigationRoute={CoreModule.accounts}
          ></DataManagementBlock>
        </Grid>
      </Grid>
    </>
  );
};
