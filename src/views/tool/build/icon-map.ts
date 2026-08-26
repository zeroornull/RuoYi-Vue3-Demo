import { Calendar, Edit, Iphone, Search, Share, Upload, User } from "@element-plus/icons-vue";
import type { Component } from "vue";
import { ICON_CHOICES } from "./schema";

export const ICON_COMPONENT_MAP: Record<(typeof ICON_CHOICES)[number], Component> = {
  Edit,
  Search,
  User,
  Calendar,
  Upload,
  Share,
  Iphone,
};

export function resolveBuildIcon(name: string): Component | undefined {
  return name in ICON_COMPONENT_MAP ? ICON_COMPONENT_MAP[name as (typeof ICON_CHOICES)[number]] : undefined;
}
