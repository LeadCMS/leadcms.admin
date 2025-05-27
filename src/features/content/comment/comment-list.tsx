import React, { useEffect, useState } from "react";
import { useRequestContext } from "../../../providers/request-provider";
import { CommentExtendedDto, CommentForm } from "./comment-form";
import { CommentsContainer, CommentsTitle } from "../index.styled";

interface CommentListProps {
  contentId?: number;
}

export const CommentList = ({ contentId }: CommentListProps) => {
  const { client } = useRequestContext();
  const [comments, setComments] = useState<CommentExtendedDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setIsLoading(true);
        setComments([]);
        if (contentId) {
          const filter = [
            `filter[where][contentId]=${contentId}`,
            "filter[where][approved]=Approved",
          ].join("&");

          const { data } = await client.api.commentsList(
            {
              query: filter,
            },
            {
              signal: controller.signal,
            }
          );
          const getReplays = (parentId: number): CommentExtendedDto[] => {
            return data
              .filter((i) => i.parentId == parentId)
              .map(
                (i) =>
                  ({
                    ...i,
                    replays: i.id && getReplays(i.id),
                  } as CommentExtendedDto)
              );
          };

          const extendedResult = data
            .filter((i) => !i.parentId)
            .map(
              (i) =>
                ({
                  ...i,
                  replays: i.id && getReplays(i.id),
                } as CommentExtendedDto)
            );

          setComments(extendedResult);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [contentId]);

  return (
    <CommentsContainer>
      {isLoading && <div>Loading...</div>}
      {!isLoading && comments && comments.length > 0 && (
        <div>
          <CommentsTitle>Comments:</CommentsTitle>
          {comments.map((comment, i) => (
            <CommentForm key={i} comment={comment} />
          ))}
        </div>
      )}
    </CommentsContainer>
  );
};
