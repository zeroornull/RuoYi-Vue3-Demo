import type { Post, PostQuery, PostUpsertRequest } from "../../../types/api/system";

export const POST_PAGE_NAME = "Post";

export type PostListQuery = PostQuery & { pageNum: number; pageSize: number };

export function emptyPostQuery(): PostListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    postCode: "",
    postName: "",
  };
}

export function emptyPostForm(): PostUpsertRequest {
  return {
    postCode: "",
    postName: "",
    postSort: 0,
    status: "0",
    remark: "",
  };
}

export function postToForm(row: Post): PostUpsertRequest {
  return {
    postId: row.postId,
    postCode: row.postCode,
    postName: row.postName,
    postSort: row.postSort,
    status: row.status,
    remark: row.remark ?? "",
  };
}
