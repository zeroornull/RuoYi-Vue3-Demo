import { appEnv } from "@/config/env";

export function useAppTitle(): string {
  return appEnv.title;
}
