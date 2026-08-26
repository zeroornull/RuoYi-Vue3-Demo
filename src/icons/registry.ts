import type { Component } from "vue";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bell,
  Close,
  Coin,
  Connection,
  Cpu,
  Document,
  Fold,
  FullScreen,
  Grid,
  HomeFilled,
  Lock,
  Menu,
  Monitor,
  Moon,
  MoreFilled,
  Operation,
  Rank,
  RefreshRight,
  Right,
  Search,
  Setting,
  Share,
  Sunny,
  SwitchButton,
  Timer,
  Tools,
  User,
  WarningFilled,
} from "@element-plus/icons-vue";
import customUserUrl from "../assets/icons/svg/user.svg";

export const elementIconRegistry: Readonly<Record<string, Component>> = {
  "arrow-down": ArrowDown,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  bell: Bell,
  close: Close,
  coin: Coin,
  connection: Connection,
  cpu: Cpu,
  dashboard: HomeFilled,
  document: Document,
  enter: Right,
  "exit-fullscreen": Rank,
  fold: Fold,
  fullscreen: FullScreen,
  grid: Grid,
  home: HomeFilled,
  job: Timer,
  lock: Lock,
  log: Document,
  menu: Menu,
  monitor: Monitor,
  moon: Moon,
  more: MoreFilled,
  operation: Operation,
  refresh: RefreshRight,
  redis: Coin,
  search: Search,
  server: Cpu,
  setting: Setting,
  share: Share,
  sunny: Sunny,
  system: Setting,
  tool: Tools,
  tree: Connection,
  "tree-table": Share,
  user: User,
  warning: WarningFilled,
  logout: SwitchButton,
};

export const customIconRegistry: Readonly<Record<string, string>> = {
  "custom-user": customUserUrl,
};

export function resolveElementIcon(name: string): Component | null {
  return elementIconRegistry[name] ?? null;
}

export function resolveCustomIcon(name: string): string | null {
  return customIconRegistry[name] ?? null;
}

export function listSelectableIcons(): string[] {
  return [
    ...Object.keys(elementIconRegistry),
    ...Object.keys(customIconRegistry),
  ];
}
