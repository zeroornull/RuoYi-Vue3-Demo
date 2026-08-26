# TypeScript 类型设计参考

本页定义迁移中反复使用的类型边界。示例是设计方向，不要求逐字复制；最终代码必须以当前依赖的真实类型为准。

## 1. 类型设计原则

1. **外部输入默认不可信。** API 响应、环境变量、localStorage 和后端路由先经过边界，再进入业务层。
2. **领域类型优先于页面临时对象。** 用户、角色、菜单、字典等类型放在共享边界。
3. **先用 `unknown`，验证后再收窄。** 不用 `any` 绕过思考。
4. **保留后端协议，不复制后端实现。** 类型描述前端实际消费的数据。
5. **迁移期允许兼容类型，但必须写删除条件。**

## 2. 环境变量

建议 `src/types/env.d.ts`：

```ts
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_ENV: "development" | "staging" | "production";
  readonly VITE_APP_BASE_API: string;
  readonly VITE_BUILD_COMPRESS?: "gzip" | "brotli" | "gzip,brotli";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

类型声明不能替代运行时校验。应用启动时仍应检查必填值：

```ts
export function requireEnv(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
```

## 3. API 响应

不要把所有响应强制成同一个宽泛接口。至少区分：

```ts
export interface ApiResponse<T> {
  code: number;
  msg?: string;
  data: T;
}

export interface PageResponse<T> {
  code: number;
  msg?: string;
  rows: T[];
  total: number;
}

export interface EmptyResponse {
  code: number;
  msg?: string;
}
```

如果 Axios 响应拦截器已经返回 `res.data`，HTTP 客户端的泛型必须反映“调用者最终拿到什么”，不能仍假装返回 `AxiosResponse<T>`。

## 4. HTTP 自定义选项

旧实现把 `isToken`、`repeatSubmit` 和 `interval` 放在 headers 中。迁移可分两步：

1. 第一阶段为现有形态建立兼容类型，保持行为不变。
2. 第二阶段迁移为明确的请求元数据，再删除兼容读取。

推荐目标形态：

```ts
import type { AxiosRequestConfig } from "axios";

export interface RuoYiRequestOptions {
  withToken?: boolean;
  preventDuplicateSubmit?: boolean;
  duplicateIntervalMs?: number;
}

export interface RuoYiRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  ruoyi?: RuoYiRequestOptions;
}
```

请求拦截器内使用 Axios 当前版本导出的内部配置类型，并通过类型守卫读取 `ruoyi`；不要把整个 config 断言为 `any`。

## 5. 路由类型

旧路由在 Vue Router 标准字段外增加了权限与显示属性。建议扩展 meta，并为应用路由建立递归类型：

```ts
import type { RouteRecordRaw } from "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    icon?: string;
    noCache?: boolean;
    affix?: boolean;
    breadcrumb?: boolean;
    activeMenu?: string;
    link?: string;
  }
}

export type AppRouteRecordRaw = RouteRecordRaw & {
  hidden?: boolean;
  alwaysShow?: boolean;
  roles?: string[];
  permissions?: string[];
  children?: AppRouteRecordRaw[];
};
```

后端返回的路由不是可信的 `RouteRecordRaw`。应先定义 DTO，再通过纯函数转换：

```ts
export interface BackendRouteDto {
  name?: string;
  path: string;
  hidden?: boolean;
  redirect?: string;
  component?: string;
  alwaysShow?: boolean;
  meta?: {
    title?: string;
    icon?: string;
    noCache?: boolean;
    link?: string;
  };
  children?: BackendRouteDto[];
}
```

转换函数需要测试非法 component、缺失 path、嵌套 children 和外链。

## 6. Pinia store

优先让 state 从初始值推断，复杂或可空状态显式标注：

```ts
interface UserProfile {
  id: number;
  name: string;
  avatar?: string;
}

export const useUserStore = defineStore("user", () => {
  const token = ref<string | null>(null);
  const profile = ref<UserProfile | null>(null);
  const roles = ref<string[]>([]);
  const permissions = ref<string[]>([]);

  const isLoggedIn = computed(() => Boolean(token.value));

  return { token, profile, roles, permissions, isLoggedIn };
});
```

不要为避免空值检查把 `profile` 初始化成伪造的完整对象。

## 7. Vue 组件

### Props 与 emits

```vue
<script setup lang="ts">
interface Props {
  modelValue: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
}>();
</script>
```

### 模板 ref

Element Plus 组件实例应使用其公开类型，例如 `FormInstance`、`UploadInstance`，而不是 `InstanceType<any>`。

```ts
import type { FormInstance } from "element-plus";

const formRef = ref<FormInstance>();
```

### DOM 事件

```ts
function onInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  value.value = target.value;
}
```

## 8. 全局属性的过渡类型

旧 `main.js` 向 `app.config.globalProperties` 挂载多个工具。短期保留时，需要模块增强：

```ts
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    parseTime: typeof import("@/utils/ruoyi").parseTime;
    download: typeof import("@/utils/request").download;
  }
}
```

长期目标是改为显式 import 或 composable。每保留一个全局属性，都要记录它的调用者和删除轮次。

## 9. 禁止模式

以下做法不能作为迁移完成条件：

```ts
const data: any = response;
const user = response as User;
// @ts-ignore
```

允许的临时形式必须带边界与删除条件：

```ts
const payload: unknown = response;
const user = parseUser(payload); // 运行时验证或明确的转换边界
```

`skipLibCheck` 只在确认是第三方声明缺陷、已记录 issue 且无法局部隔离时临时启用；本手册默认关闭。
