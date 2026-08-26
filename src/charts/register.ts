import { use } from "echarts/core";
import { GaugeChart, PieChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

let registered = false;

export function registerMonitorCharts(): void {
  if (registered) {
    return;
  }
  use([CanvasRenderer, PieChart, GaugeChart, TooltipComponent]);
  registered = true;
}

export function echartsTheme(isDark: boolean): "dark" | undefined {
  return isDark ? "dark" : undefined;
}
