import { createApp } from "vue";
import App from "./App.vue";
import { appTitlePlugin } from "./bootstrap/app-title-plugin";
import { installDirectives } from "./bootstrap/directives";
import { installElementPlus } from "./bootstrap/element-plus";
import { installGlobalComponents } from "./bootstrap/global-components";
import { installGlobalProperties } from "./bootstrap/global-properties";
import "./config/env";
import "./assets/styles/index.scss";

const app = createApp(App);

installElementPlus(app);
app.use(appTitlePlugin);
installGlobalProperties(app);
installGlobalComponents(app);
installDirectives(app);

app.mount("#app");
