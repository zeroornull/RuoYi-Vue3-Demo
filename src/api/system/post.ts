import { http } from "../../http";
import type {
  EntityId,
  IdCollection,
  Post,
  PostPageResponse,
  PostQuery,
  PostUpsertRequest,
} from "../../types/api";
import type { ApiResponse, EmptyResponse } from "../../types/http";
import { encodeIdCollection, encodePathSegment } from "../shared";

export function listPost(query: PostQuery): Promise<PostPageResponse> {
  return http.get<PostPageResponse>("/system/post/list", { params: query });
}

export function getPost(postId: EntityId): Promise<ApiResponse<Post>> {
  return http.get<ApiResponse<Post>>(`/system/post/${encodePathSegment(postId)}`);
}

export function addPost(data: PostUpsertRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/system/post", data);
}

export function updatePost(data: PostUpsertRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/post", data);
}

export function delPost(postIds: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(`/system/post/${encodeIdCollection(postIds)}`);
}
