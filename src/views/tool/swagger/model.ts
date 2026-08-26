import { swaggerUiUrl as joinSwaggerUiUrl } from "../../../api/tool/swagger";

export const SWAGGER_PAGE_NAME = "Swagger";

export function swaggerPageUrl(baseApi: string): string {
  return joinSwaggerUiUrl(baseApi);
}
