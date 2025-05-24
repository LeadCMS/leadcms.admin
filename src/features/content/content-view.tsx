import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ContentDetailsDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import {
  AuthorContainer,
  ContentDeleteContainer,
  ContentEditContainer,
  ContentItemContainer,
  CoverImage,
  DescriptionContainer,
  HeaderContainer,
  TagsContainer,
  TimestampContainer,
  TitleContainer,
} from "./index.styled";
import { Chip } from "@mui/material";
import MarkdownViewer from "@components/markdown-viewer";
import { CommentList } from "./comment/comment-list";
import graymatter from "gray-matter";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { blogFormBreadcrumbLinks } from "@features/content/constants";
import { ModuleWrapper } from "@components/module-wrapper";
import { DataManagementBlock } from "@components/data-management";
import { CoreModule } from "@lib/router";

const coreApi = process.env.CORE_API;

export const ContentView = () => {
  const { setBusy } = useModuleWrapperContext();

  const { client } = useRequestContext();
  const { id } = useParams();
  const [contentItem, setContentItem] = useState<ContentDetailsDto>();
  const [body, setBody] = useState<string>("");

  useEffect(() => {
    setBusy(async () => {
      try {
        if (client && id) {
          const { data } = await client.api.contentDetail(Number(id));
          const mattered = graymatter(data.body);
          setBody(mattered.content);
          setContentItem(data);
        }
      } catch (e) {
        console.log(e);
      }
    });
  }, [client, id]);

  return (
    <ModuleWrapper
      breadcrumbs={blogFormBreadcrumbLinks}
      currentBreadcrumb={contentItem?.title || ""}
    >
      <ContentEditContainer>
        {contentItem && (
          <ContentItemContainer data-color-mode="light">
            <HeaderContainer>
              <CoverImage
                src={coreApi + "" + contentItem.coverImageUrl || ""}
                alt={contentItem.coverImageAlt || ""}
              />
              <div>
                <TitleContainer>{contentItem.title}</TitleContainer>
                <TagsContainer>
                  Tags:{" "}
                  <>
                    {`${contentItem.tags || ""}`
                      .split(";")
                      .filter((i) => i)
                      .filter((v, index, items) => items.indexOf(v) === index)
                      .map((s, index) => (
                        <Chip size={"small"} key={index} label={s} variant="outlined" />
                      ))}
                  </>
                </TagsContainer>
                <TagsContainer>
                  Category: <Chip size={"small"} label={contentItem.category} variant="outlined" />
                </TagsContainer>
                <AuthorContainer>Author: {contentItem.author}</AuthorContainer>
                <TimestampContainer>
                  Updated:{" "}
                  {contentItem.updatedAt && new Date(contentItem.updatedAt).toLocaleDateString()}
                </TimestampContainer>
                <DescriptionContainer>Description: {contentItem.description}</DescriptionContainer>
              </div>
            </HeaderContainer>
            <MarkdownViewer source={body} />

            {contentItem.allowComments && (
              <>
                <hr />
                <CommentList contentId={contentItem.id} />
              </>
            )}
          </ContentItemContainer>
        )}
      </ContentEditContainer>
      <ContentDeleteContainer>
        <DataManagementBlock
          header="Data Management"
          description="Please be aware that what
            has been deleted can never be brought back."
          entity="content"
          handleDeleteAsync={(id) => client.api.contentDelete(id as number)}
          itemId={+id!}
          successNavigationRoute={CoreModule.content}
        ></DataManagementBlock>
      </ContentDeleteContainer>
    </ModuleWrapper>
  );
};
