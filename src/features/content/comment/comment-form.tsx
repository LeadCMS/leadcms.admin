import { CommentDetailsDto } from "../../../lib/network/swagger-client";
import { CommentContainer, CommentDateContainer } from "../index.styled";

export interface CommentExtendedDto extends CommentDetailsDto {
  replays?: CommentExtendedDto[];
}

interface CommentFormProps {
  comment: CommentExtendedDto;
}

export const CommentForm = ({ comment }: CommentFormProps) => {
  return (
    <CommentContainer>
      <div>
        <a href={`mailto:${comment.authorEmail}`}>{comment.authorName}</a>{" "}
        {
          <CommentDateContainer>
            {comment.createdAt && (
              <>created: {comment.createdAt && new Date(comment.createdAt).toLocaleDateString()}</>
            )}
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <>
                , updated: {comment.updatedAt && new Date(comment.updatedAt).toLocaleDateString()}
              </>
            )}
          </CommentDateContainer>
        }
      </div>
      <div>{comment.body}</div>
      <div></div>
      <div style={{ marginLeft: 50 }}>
        {comment.replays &&
          comment.replays.map((comment, i) => <CommentForm key={i} comment={comment} />)}
      </div>
    </CommentContainer>
  );
};
