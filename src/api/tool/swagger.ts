export const SWAGGER_UI_PATH = "/swagger-ui/index.html";

export function swaggerUiUrl(baseApi: string): string {
  return `${baseApi.replace(/\/$/, "")}${SWAGGER_UI_PATH}`;
}
