import { init, type EChartsType } from "echarts/core";
import { echartsTheme, registerMonitorCharts } from "./register";

export type ChartOption = Record<string, unknown>;

export type BoundChart = {
  render: (el: HTMLElement | null | undefined, isDark: boolean, option: ChartOption) => void;
  dispose: () => void;
};

export function createBoundChart(): BoundChart {
  let instance: EChartsType | null = null;
  let onResize: (() => void) | null = null;

  function dispose(): void {
    if (onResize && typeof window !== "undefined") {
      window.removeEventListener("resize", onResize);
    }
    onResize = null;
    instance?.dispose();
    instance = null;
  }

  function render(el: HTMLElement | null | undefined, isDark: boolean, option: ChartOption): void {
    if (!el) {
      return;
    }
    registerMonitorCharts();
    const theme = echartsTheme(isDark);
    if (!instance || instance.isDisposed()) {
      instance = init(el, theme);
    }
    instance.setOption(option, true);
    if (!onResize && typeof window !== "undefined") {
      onResize = () => {
        instance?.resize();
      };
      window.addEventListener("resize", onResize);
    }
  }

  return { render, dispose };
}
