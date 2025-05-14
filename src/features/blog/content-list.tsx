import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import { ContentDetailsDto } from "@lib/network/swagger-client";
import { ContentListContainer, TimestampContainer, DummyDiv } from "./index.styled";
import { useEffect, useState } from "react";
import { Add, Upload, Download } from "@mui/icons-material";
import { useRequestContext } from "@providers/request-provider";
import { SearchBar } from "@components/search-bar";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { blogBreadcrumbLinks } from "@features/blog/constants";
import { ModuleWrapper } from "@components/module-wrapper";
import InfiniteScroll from "react-infinite-scroll-component";
import { totalCountHeaderName } from "@providers/query-provider";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { useNavigate } from "react-router-dom";

export const ContentList = () => {
  const { setBusy } = useModuleWrapperContext();
  const { client } = useRequestContext();
  const [contentItems, setContentItems] = useState<ContentDetailsDto[]>([]);
  const [contentItemsCount, setContentItemsCount] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>("");

  const searchBar = (
    <SearchBar
      setSearchTermOnChange={(value) => setSearchText(value)}
      searchBoxLabel="Content"
      initialValue={searchText}
    />
  );

  const extraActions = [
    <Button key={"import-btn"} startIcon={<Upload />} disabled={true}>
      Import
    </Button>,
    <Button key={"export-btn"} startIcon={<Download />} disabled={true}>
      Export
    </Button>,
  ];

  const addButton = (
    <Button variant="contained" href={`${location}/new`} startIcon={<Add />}>
      Add content
    </Button>
  );

  const fetchData = async () => {
    const filter = searchText
      ? { query: searchText, "filter[skip]": contentItems.length }
      : { "filter[order]": "createdAt desc", "filter[skip]": contentItems.length };
    const { data } = await client.api.contentList(filter);
    setContentItems((current) => [...current, ...data]);
  };

  useEffect(() => {
    const controller = new AbortController();

    setBusy(async () => {
      try {
        const filter = searchText ? { query: searchText } : { "filter[order]": "createdAt desc" };
        const { data, headers } = await client.api.contentList(filter, {
          signal: controller.signal,
        });
        const totalCount = Number(headers.get(totalCountHeaderName));
        setContentItemsCount(totalCount);
        setContentItems(data);
      } catch (e) {
        console.log(e);
      }
    });

    return () => {
      controller.abort();
    };
  }, [client, searchText]);
  return (
    <ModuleWrapper
      breadcrumbs={blogBreadcrumbLinks}
      currentBreadcrumb={"Content"}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      <ContentListContainer>
        {contentItemsCount > 0 && (
          <InfiniteScroll
            dataLength={contentItems.length}
            next={fetchData}
            hasMore={contentItemsCount !== contentItems.length}
            loader={<h4>Loading...</h4>}
            hasChildren={true}
            scrollableTarget="scrollTarget"
            style={{ overflow: "unset" }}
          >
            <Grid container spacing={10}>
              {contentItems.map((item, index) => (
                <ItemCard key={index} item={item} index={index} />
              ))}
            </Grid>
          </InfiniteScroll>
        )}
      </ContentListContainer>
    </ModuleWrapper>
  );
};

interface ItemProps {
  index: number;
  item: ContentDetailsDto;
}

const ItemCard = ({ item, index }: ItemProps) => {
  const navigate = useNavigate();

  const onClickView = () => {
    navigate(`${item.id}/view`);
  };

  const onClickEdit = () => {
    navigate(`${item.id}/edit`);
  };

  if (!item || !item.id) {
    return <DummyDiv />;
  }
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`card-${index}`}>
      <Card
        sx={{ height: 500 }}
        style={{
          position: "relative",
        }}
        variant="outlined"
      >
        <CardActionArea style={{ marginBottom: 50 }} onClick={onClickEdit}>
          <CardMedia
            component="img"
            height="140"
            image={buildAbsoluteUrl(item.coverImageUrl)}
            alt={item.coverImageAlt || ""}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(item.description || "").substring(0, 255)}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions style={{ position: "absolute", bottom: 0, width: "100%" }}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <Button size="small" color="primary" onClick={onClickView}>
                View
              </Button>
              <Button size="small" color="primary" onClick={onClickEdit}>
                Edit
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }} sx={{ display: "flex", justifyContent: "flex-end" }}>
              <TimestampContainer>
                {item.publishedAt && new Date(item.publishedAt).toLocaleDateString()}
              </TimestampContainer>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    </Grid>
  );
};
