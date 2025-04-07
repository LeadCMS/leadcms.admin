import {
  CustomFieldSourceDictionary,
  DictItem,
  GenericDataGridProps,
  GenericFormProps,
  GenericModule,
  getSchemaDto,
} from "@components/generic-components";
import { CoreModule, getCoreModuleRoute, getEditFormRoute, getViewFormRoute } from "@lib/router";
import { useNavigate, useParams } from "react-router-dom";

import swaggerJson from "@lib/network/swagger.json";
import { useRequestContext } from "@providers/request-provider";
import { CommentCreateDto, CommentDetailsDto, CommentUpdateDto } from "@lib/network/swagger-client";
import { useEffect, useState } from "react";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";

export const CommentsModule = () => {
  const { client } = useRequestContext();
  const navigate = useNavigate();
  const { setBusy } = useModuleWrapperContext();

  const [contentDict, setContentDict] = useState<CustomFieldSourceDictionary>();
  const [commentsDict, setCommentsDict] = useState<CustomFieldSourceDictionary>();

  useEffect(() => {
    const abortController = new AbortController();
    setBusy(async () => {
      const { data } = await client.api.contentList();
      const dictItems = (data || []).map(
        (item) =>
          ({
            value: item.id,
            displayText: `${item.id}: ${item.title}`,
          }) as DictItem,
      );
      setContentDict({ label: "Content", items: dictItems });
    });
    return () => {
      abortController.abort("cancelled");
    };
  }, [client]);

  useEffect(() => {
    const abortController = new AbortController();
    setBusy(async () => {
      const { data } = await client.api.commentsList();
      const dictItems = (data || []).map(
        (item) =>
          ({
            value: item.id,
            displayText: `${item.id}: ${item.body}`,
          }) as DictItem,
      );
      setCommentsDict({ label: "Parent", items: dictItems });
    });
    return () => {
      abortController.abort("cancelled");
    };
  }, [client]);

  const formProps: GenericFormProps<CommentDetailsDto, CommentCreateDto, CommentUpdateDto> = {
    detailsSchema: getSchemaDto("CommentDetailsDto", swaggerJson.components.schemas),
    updateSchema: getSchemaDto("CommentUpdateDto", swaggerJson.components.schemas),
    createSchema: getSchemaDto("CommentCreateDto", swaggerJson.components.schemas),
    editable: false,
    getItemFn: client.api.commentsDetail,
    updateItemFn: client.api.commentsPartialUpdate,
    createItemFn: client.api.commentsCreate,
    getItemId: () => undefined,
    customDictionaries: {
      contentId: contentDict,
      parentId: commentsDict,
    },
  };

  const tableProps: GenericDataGridProps<CommentDetailsDto> = {
    key: "comments-table",
    initiallyShownColumns: ["authorName", "authorEmail", "source"],
    schema: getSchemaDto("CommentDetailsDto", swaggerJson.components.schemas),
    getItemsFn: client.api.commentsList,
    detailsNavigate: (item) => {
      item.id && navigate(getViewFormRoute(item.id), { state: item });
    },
    editNavigate: (item) => {
      item.id && navigate(getEditFormRoute(item.id), { state: item });
    },
  };

  const deleteProps = {
    header: "Data Management",
    description: "Please be aware that what has been deleted can never be brought back.",
    entity: "comment",
    listRoute: CoreModule.comments,
    deleteItemFn: client.api.commentsDelete,
  };

  const module = GenericModule({
    moduleName: "Comments",
    modulePath: CoreModule.comments,
    addButtonContent: "Add comment",
    tableProps: tableProps,
    extraActions: {
      export: {
        showButton: true,
        exportItemsFn: client.api.commentsExportList,
      },
      import: {
        showButton: true,
        importItemsFn: client.api.commentsImportCreate,
        importSchema: getSchemaDto("CommentImportDto", swaggerJson.components.schemas),
      },
    },
    viewFormProps: {
      ...formProps,
      mode: "details",
      editable: false,
      deleteOptionProps: deleteProps,
      getItemId: () => {
        const params = useParams();
        return Number(params && params["*"] && params["*"].match(/^(\d+)\/view$/)?.[1]);
      },
    },
    editFormProps: {
      ...formProps,
      mode: "update",
      editable: true,
      getItemId: () => {
        const params = useParams();
        return Number(params && params["*"] && params["*"].match(/^(\d+)\/edit$/)?.[1]);
      },
      onSaved: () => {
        navigate(getCoreModuleRoute(CoreModule.comments));
      },
    },
    createFormProps: {
      ...formProps,
      mode: "create",
      editable: true,
      onSaved: () => {
        navigate(getCoreModuleRoute(CoreModule.comments));
      },
    },
  });

  return module;
};
