import type { MockJson, MockRequest, MockResponse } from "./auth.ts";
import { dispatchOrgMock, resetMockOrgState } from "./org.ts";
import { dispatchRoleMock } from "./role.ts";
import { dispatchUserMock, resetMockUserState } from "./user.ts";

const ok = (body: MockJson, status = 200): MockResponse => ({ status, body });
const fail = (msg: string, code = 500): MockResponse => ok({ code, msg });
const now = "2026-08-26 00:00:00";

type ConfigRow = {
  configId: string;
  configName: string;
  configKey: string;
  configValue: string;
  configType: "Y" | "N";
  remark: string;
  createTime: string;
};

type PostRow = {
  postId: string;
  postCode: string;
  postName: string;
  postSort: number;
  status: "0" | "1";
  remark: string;
  createTime: string;
};

type NoticeRow = {
  noticeId: string;
  noticeTitle: string;
  noticeType: "1" | "2";
  noticeContent: string;
  status: "0" | "1";
  createBy: string;
  createTime: string;
  isRead: boolean;
};

type NoticeReadRow = {
  noticeId: string;
  userId: string;
  userName: string;
  nickName: string;
  deptName: string;
  phonenumber: string;
  readTime: string;
};

type DictTypeRow = {
  dictId: string;
  dictName: string;
  dictType: string;
  status: "0" | "1";
  remark: string;
  createTime: string;
};

type DictDataRow = {
  dictCode: string;
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  cssClass: string;
  listClass: string;
  isDefault: "Y" | "N";
  status: "0" | "1";
  remark: string;
  createTime: string;
};

let configs: ConfigRow[] = [];
let posts: PostRow[] = [];
let notices: NoticeRow[] = [];
let noticeReads: NoticeReadRow[] = [];
let dictTypes: DictTypeRow[] = [];
let dictData: DictDataRow[] = [];

function seedConfigs(): ConfigRow[] {
  const rows: ConfigRow[] = [
    {
      configId: "1",
      configName: "主框架页-默认皮肤",
      configKey: "sys.index.skinName",
      configValue: "skin-blue",
      configType: "Y",
      remark: "蓝色 skin-blue、绿色 skin-green",
      createTime: "2026-01-01 00:00:00",
    },
    {
      configId: "2",
      configName: "用户管理-账号初始密码",
      configKey: "sys.user.initPassword",
      configValue: "123456",
      configType: "Y",
      remark: "初始化密码 123456",
      createTime: "2026-02-01 00:00:00",
    },
    {
      configId: "3",
      configName: "账号自助-验证码开关",
      configKey: "sys.account.captchaEnabled",
      configValue: "true",
      configType: "Y",
      remark: "是否开启验证码",
      createTime: "2026-03-01 00:00:00",
    },
  ];
  for (let index = 4; index <= 12; index += 1) {
    rows.push({
      configId: String(index),
      configName: `自定义参数${index}`,
      configKey: `local.custom.key${index}`,
      configValue: `value-${index}`,
      configType: "N",
      remark: "",
      createTime: `2026-04-${String(index).padStart(2, "0")} 00:00:00`,
    });
  }
  return rows;
}

function seedPosts(): PostRow[] {
  return [
    {
      postId: "1",
      postCode: "ceo",
      postName: "董事长",
      postSort: 1,
      status: "0",
      remark: "",
      createTime: "2026-01-01 00:00:00",
    },
    {
      postId: "2",
      postCode: "se",
      postName: "项目经理",
      postSort: 2,
      status: "0",
      remark: "",
      createTime: "2026-01-02 00:00:00",
    },
    {
      postId: "3",
      postCode: "hr",
      postName: "人力资源",
      postSort: 3,
      status: "0",
      remark: "",
      createTime: "2026-01-03 00:00:00",
    },
    {
      postId: "4",
      postCode: "user",
      postName: "普通员工",
      postSort: 4,
      status: "1",
      remark: "停用",
      createTime: "2026-01-04 00:00:00",
    },
  ];
}

function seedNotices(): NoticeRow[] {
  return [
    {
      noticeId: "1",
      noticeTitle: "若依开源框架介绍",
      noticeType: "2",
      noticeContent: "<p>若依后台管理框架</p>",
      status: "0",
      createBy: "admin",
      createTime: "2026-01-10 00:00:00",
      isRead: true,
    },
    {
      noticeId: "2",
      noticeTitle: "维护通知",
      noticeType: "1",
      noticeContent: "<p>今晚 22:00 维护</p>",
      status: "0",
      createBy: "admin",
      createTime: "2026-02-10 00:00:00",
      isRead: false,
    },
    {
      noticeId: "3",
      noticeTitle: "关闭的公告",
      noticeType: "2",
      noticeContent: "<p>已关闭</p>",
      status: "1",
      createBy: "ry",
      createTime: "2026-03-10 00:00:00",
      isRead: false,
    },
  ];
}

function seedNoticeReads(): NoticeReadRow[] {
  return [
    {
      noticeId: "1",
      userId: "1",
      userName: "admin",
      nickName: "管理员",
      deptName: "研发部门",
      phonenumber: "15888888888",
      readTime: "2026-01-11 08:00:00",
    },
    {
      noticeId: "1",
      userId: "2",
      userName: "ry",
      nickName: "若依",
      deptName: "测试部门",
      phonenumber: "15666666666",
      readTime: "2026-01-11 09:00:00",
    },
  ];
}

function seedDictTypes(): DictTypeRow[] {
  return [
    {
      dictId: "1",
      dictName: "系统是否",
      dictType: "sys_yes_no",
      status: "0",
      remark: "",
      createTime: "2026-01-01 00:00:00",
    },
    {
      dictId: "2",
      dictName: "系统开关",
      dictType: "sys_normal_disable",
      status: "0",
      remark: "",
      createTime: "2026-01-01 00:00:00",
    },
    {
      dictId: "3",
      dictName: "通知类型",
      dictType: "sys_notice_type",
      status: "0",
      remark: "",
      createTime: "2026-01-01 00:00:00",
    },
    {
      dictId: "4",
      dictName: "通知状态",
      dictType: "sys_notice_status",
      status: "0",
      remark: "",
      createTime: "2026-01-01 00:00:00",
    },
    {
      dictId: "5",
      dictName: "停用字典",
      dictType: "sys_unused",
      status: "1",
      remark: "停用",
      createTime: "2026-04-01 00:00:00",
    },
    {
      dictId: "6",
      dictName: "显示状态",
      dictType: "sys_show_hide",
      status: "0",
      remark: "",
      createTime: "2026-01-01 00:00:00",
    },
    {
      dictId: "7",
      dictName: "用户性别",
      dictType: "sys_user_sex",
      status: "0",
      remark: "",
      createTime: "2026-01-01 00:00:00",
    },
  ];
}

function seedDictData(): DictDataRow[] {
  return [
    dataRow("1", "sys_yes_no", "是", "Y", 1, "default", "Y"),
    dataRow("2", "sys_yes_no", "否", "N", 2, "default", "N"),
    dataRow("3", "sys_normal_disable", "正常", "0", 1, "success", "Y"),
    dataRow("4", "sys_normal_disable", "停用", "1", 2, "danger", "N"),
    dataRow("5", "sys_notice_type", "通知", "1", 1, "warning", "N"),
    dataRow("6", "sys_notice_type", "公告", "2", 2, "success", "N"),
    dataRow("7", "sys_notice_status", "正常", "0", 1, "success", "Y"),
    dataRow("8", "sys_notice_status", "关闭", "1", 2, "danger", "N"),
    dataRow("9", "sys_unused", "旧值", "old", 1, "info", "N", "1"),
    dataRow("10", "sys_show_hide", "显示", "0", 1, "primary", "Y"),
    dataRow("11", "sys_show_hide", "隐藏", "1", 2, "danger", "N"),
    dataRow("12", "sys_user_sex", "男", "0", 1, "default", "Y"),
    dataRow("13", "sys_user_sex", "女", "1", 2, "default", "N"),
    dataRow("14", "sys_user_sex", "未知", "2", 3, "default", "N"),
  ];
}

function dataRow(
  dictCode: string,
  dictType: string,
  dictLabel: string,
  dictValue: string,
  dictSort: number,
  listClass: string,
  isDefault: "Y" | "N",
  status: "0" | "1" = "0",
): DictDataRow {
  return {
    dictCode,
    dictType,
    dictLabel,
    dictValue,
    dictSort,
    listClass,
    isDefault,
    status,
    cssClass: "",
    remark: "",
    createTime: "2026-01-01 00:00:00",
  };
}

export function resetMockSystemState(): void {
  configs = seedConfigs();
  posts = seedPosts();
  notices = seedNotices();
  noticeReads = seedNoticeReads();
  dictTypes = seedDictTypes();
  dictData = seedDictData();
  resetMockOrgState();
  resetMockUserState();
}

resetMockSystemState();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function queryOf(request: MockRequest): Record<string, string> {
  return request.query ?? {};
}

function includes(haystack: string, needle: string | undefined): boolean {
  if (!needle) {
    return true;
  }
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function inDateRange(createTime: string, query: Record<string, string>): boolean {
  const day = createTime.slice(0, 10);
  const begin = query["params[beginTime]"];
  const end = query["params[endTime]"];
  if (begin && day < begin) {
    return false;
  }
  if (end && day > end) {
    return false;
  }
  return true;
}

function pageOf(rows: readonly unknown[], query: Record<string, string>): {
  rows: unknown[];
  total: number;
} {
  const pageNum = Number(query.pageNum ?? "1") || 1;
  const pageSize = Number(query.pageSize ?? "10") || 10;
  const page = pageNum < 1 ? 1 : pageNum;
  const size = pageSize < 1 ? 10 : pageSize;
  const start = (page - 1) * size;
  return {
    rows: rows.slice(start, start + size),
    total: rows.length,
  };
}

function listOk(rows: readonly unknown[], query: Record<string, string>): MockResponse {
  const page = pageOf(rows, query);
  return ok({
    code: 200,
    msg: "查询成功",
    rows: page.rows,
    total: page.total,
  });
}

function nextId(ids: string[]): string {
  return String(ids.reduce((max, id) => Math.max(max, Number(id) || 0), 0) + 1);
}

function readString(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(body: Record<string, unknown>, key: string): number | undefined {
  const value = body[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function parseIds(rest: string): string[] {
  return rest.split(",").map((item) => decodeURIComponent(item)).filter(Boolean);
}

function exportBlob(): MockResponse {
  return {
    status: 200,
    body: { code: 200, msg: "操作成功" },
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    raw: "mock-xlsx",
  };
}

function restAfter(path: string, prefix: string): string | null {
  if (path === prefix) {
    return "";
  }
  if (path.startsWith(`${prefix}/`)) {
    return path.slice(prefix.length + 1);
  }
  return null;
}

function dataById(): MockResponse {
  return fail("数据不存在");
}

function dispatchConfig(method: string, path: string, request: MockRequest): MockResponse | null {
  const query = queryOf(request);
  if (method === "GET" && path === "/system/config/list") {
    const rows = configs.filter(
      (row) =>
        includes(row.configName, query.configName) &&
        includes(row.configKey, query.configKey) &&
        (!query.configType || row.configType === query.configType) &&
        inDateRange(row.createTime, query),
    );
    return listOk(rows, query);
  }
  if (method === "POST" && path === "/system/config/export") {
    return exportBlob();
  }
  if (method === "DELETE" && path === "/system/config/refreshCache") {
    return ok({ code: 200, msg: "操作成功" });
  }
  const keyRest = restAfter(path, "/system/config/configKey");
  if (method === "GET" && keyRest) {
    const row = configs.find((item) => item.configKey === decodeURIComponent(keyRest));
    if (!row) {
      return fail("参数键名不存在");
    }
    return ok({ code: 200, msg: "操作成功", data: row.configValue });
  }
  if (method === "POST" && path === "/system/config") {
    if (!isRecord(request.body)) {
      return fail("请求参数错误");
    }
    const configName = readString(request.body, "configName");
    const configKey = readString(request.body, "configKey");
    const configValue = readString(request.body, "configValue");
    if (!configName) return fail("参数名称不能为空");
    if (!configKey) return fail("参数键名不能为空");
    if (!configValue) return fail("参数键值不能为空");
    if (configs.some((item) => item.configKey === configKey)) {
      return fail("参数键名已存在");
    }
    const configType = readString(request.body, "configType") === "N" ? "N" : "Y";
    configs.push({
      configId: nextId(configs.map((item) => item.configId)),
      configName,
      configKey,
      configValue,
      configType,
      remark: readString(request.body, "remark"),
      createTime: now,
    });
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/system/config") {
    if (!isRecord(request.body)) {
      return fail("请求参数错误");
    }
    const configId = readString(request.body, "configId");
    const row = configs.find((item) => item.configId === configId);
    if (!row) {
      return dataById();
    }
    const configName = readString(request.body, "configName");
    const configKey = readString(request.body, "configKey");
    const configValue = readString(request.body, "configValue");
    if (!configName) return fail("参数名称不能为空");
    if (!configKey) return fail("参数键名不能为空");
    if (!configValue) return fail("参数键值不能为空");
    if (configs.some((item) => item.configKey === configKey && item.configId !== configId)) {
      return fail("参数键名已存在");
    }
    row.configName = configName;
    row.configKey = configKey;
    row.configValue = configValue;
    row.configType = readString(request.body, "configType") === "N" ? "N" : "Y";
    row.remark = readString(request.body, "remark");
    return ok({ code: 200, msg: "操作成功" });
  }
  const rest = restAfter(path, "/system/config");
  if (rest === null) {
    return null;
  }
  if (rest === "") {
    if (method === "DELETE") {
      return fail("请选择要删除的数据");
    }
    return null;
  }
  if (method === "GET") {
    const row = configs.find((item) => item.configId === decodeURIComponent(rest));
    return row ? ok({ code: 200, msg: "操作成功", data: row }) : dataById();
  }
  if (method === "DELETE") {
    const ids = new Set(parseIds(rest));
    const next = configs.filter((item) => !ids.has(item.configId));
    if (next.length === configs.length) {
      return dataById();
    }
    configs = next;
    return ok({ code: 200, msg: "操作成功" });
  }
  return null;
}

function dispatchPost(method: string, path: string, request: MockRequest): MockResponse | null {
  const query = queryOf(request);
  if (method === "GET" && path === "/system/post/list") {
    const rows = posts.filter(
      (row) =>
        includes(row.postCode, query.postCode) &&
        includes(row.postName, query.postName) &&
        (!query.status || row.status === query.status),
    );
    return listOk(rows, query);
  }
  if (method === "POST" && path === "/system/post/export") {
    return exportBlob();
  }
  if (method === "POST" && path === "/system/post") {
    if (!isRecord(request.body)) {
      return fail("请求参数错误");
    }
    const postName = readString(request.body, "postName");
    const postCode = readString(request.body, "postCode");
    const postSort = readNumber(request.body, "postSort");
    if (!postName) return fail("岗位名称不能为空");
    if (!postCode) return fail("岗位编码不能为空");
    if (postSort === undefined) return fail("岗位顺序不能为空");
    if (posts.some((item) => item.postCode === postCode)) {
      return fail("岗位编码已存在");
    }
    posts.push({
      postId: nextId(posts.map((item) => item.postId)),
      postName,
      postCode,
      postSort,
      status: readString(request.body, "status") === "1" ? "1" : "0",
      remark: readString(request.body, "remark"),
      createTime: now,
    });
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/system/post") {
    if (!isRecord(request.body)) {
      return fail("请求参数错误");
    }
    const postId = readString(request.body, "postId");
    const row = posts.find((item) => item.postId === postId);
    if (!row) return dataById();
    const postName = readString(request.body, "postName");
    const postCode = readString(request.body, "postCode");
    const postSort = readNumber(request.body, "postSort");
    if (!postName) return fail("岗位名称不能为空");
    if (!postCode) return fail("岗位编码不能为空");
    if (postSort === undefined) return fail("岗位顺序不能为空");
    if (posts.some((item) => item.postCode === postCode && item.postId !== postId)) {
      return fail("岗位编码已存在");
    }
    row.postName = postName;
    row.postCode = postCode;
    row.postSort = postSort;
    row.status = readString(request.body, "status") === "1" ? "1" : "0";
    row.remark = readString(request.body, "remark");
    return ok({ code: 200, msg: "操作成功" });
  }
  const rest = restAfter(path, "/system/post");
  if (rest === null) {
    return null;
  }
  if (rest === "") {
    if (method === "DELETE") return fail("请选择要删除的数据");
    return null;
  }
  if (method === "GET") {
    const row = posts.find((item) => item.postId === decodeURIComponent(rest));
    return row ? ok({ code: 200, msg: "操作成功", data: row }) : dataById();
  }
  if (method === "DELETE") {
    const ids = new Set(parseIds(rest));
    const next = posts.filter((item) => !ids.has(item.postId));
    if (next.length === posts.length) return dataById();
    posts = next;
    return ok({ code: 200, msg: "操作成功" });
  }
  return null;
}

function dispatchNotice(method: string, path: string, request: MockRequest): MockResponse | null {
  const query = queryOf(request);
  if (method === "GET" && path === "/system/notice/list") {
    const rows = notices.filter(
      (row) =>
        includes(row.noticeTitle, query.noticeTitle) &&
        includes(row.createBy, query.createBy) &&
        (!query.noticeType || row.noticeType === query.noticeType),
    );
    return listOk(rows, query);
  }
  if (method === "GET" && path === "/system/notice/listTop") {
    const openRows = notices.filter((row) => row.status === "0");
    return ok({
      code: 200,
      msg: "操作成功",
      data: openRows,
      unreadCount: openRows.filter((row) => !row.isRead).length,
    });
  }
  if (method === "GET" && path === "/system/notice/readUsers/list") {
    const rows = noticeReads.filter(
      (row) =>
        row.noticeId === query.noticeId &&
        (includes(row.userName, query.searchValue) ||
          includes(row.nickName, query.searchValue)),
    );
    return listOk(rows, query);
  }
  if (method === "POST" && path === "/system/notice/markRead") {
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "POST" && path === "/system/notice/markReadAll") {
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "POST" && path === "/system/notice") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const noticeTitle = readString(request.body, "noticeTitle");
    const noticeType = readString(request.body, "noticeType");
    if (!noticeTitle) return fail("公告标题不能为空");
    if (noticeType !== "1" && noticeType !== "2") return fail("公告类型不能为空");
    notices.push({
      noticeId: nextId(notices.map((item) => item.noticeId)),
      noticeTitle,
      noticeType,
      noticeContent: readString(request.body, "noticeContent"),
      status: readString(request.body, "status") === "1" ? "1" : "0",
      createBy: "admin",
      createTime: now,
      isRead: false,
    });
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/system/notice") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const noticeId = readString(request.body, "noticeId");
    const row = notices.find((item) => item.noticeId === noticeId);
    if (!row) return dataById();
    const noticeTitle = readString(request.body, "noticeTitle");
    const noticeType = readString(request.body, "noticeType");
    if (!noticeTitle) return fail("公告标题不能为空");
    if (noticeType !== "1" && noticeType !== "2") return fail("公告类型不能为空");
    row.noticeTitle = noticeTitle;
    row.noticeType = noticeType;
    row.noticeContent = readString(request.body, "noticeContent");
    row.status = readString(request.body, "status") === "1" ? "1" : "0";
    return ok({ code: 200, msg: "操作成功" });
  }
  const rest = restAfter(path, "/system/notice");
  if (rest === null) {
    return null;
  }
  if (rest === "" || rest === "listTop" || rest.startsWith("readUsers")) {
    if (method === "DELETE" && rest === "") return fail("请选择要删除的数据");
    return null;
  }
  if (method === "GET") {
    const row = notices.find((item) => item.noticeId === decodeURIComponent(rest));
    return row ? ok({ code: 200, msg: "操作成功", data: row }) : dataById();
  }
  if (method === "DELETE") {
    const ids = new Set(parseIds(rest));
    const next = notices.filter((item) => !ids.has(item.noticeId));
    if (next.length === notices.length) return dataById();
    notices = next;
    noticeReads = noticeReads.filter((item) => !ids.has(item.noticeId));
    return ok({ code: 200, msg: "操作成功" });
  }
  return null;
}

function dispatchDict(method: string, path: string, request: MockRequest): MockResponse | null {
  const query = queryOf(request);
  if (method === "GET" && path === "/system/dict/type/list") {
    const rows = dictTypes.filter(
      (row) =>
        includes(row.dictName, query.dictName) &&
        includes(row.dictType, query.dictType) &&
        (!query.status || row.status === query.status) &&
        inDateRange(row.createTime, query),
    );
    return listOk(rows, query);
  }
  if (method === "GET" && path === "/system/dict/type/optionselect") {
    return ok({ code: 200, msg: "操作成功", data: dictTypes });
  }
  if (method === "DELETE" && path === "/system/dict/type/refreshCache") {
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "POST" && path === "/system/dict/type/export") {
    return exportBlob();
  }
  if (method === "POST" && path === "/system/dict/data/export") {
    return exportBlob();
  }
  if (method === "GET" && path === "/system/dict/data/list") {
    const rows = dictData.filter(
      (row) =>
        (!query.dictType || row.dictType === query.dictType) &&
        includes(row.dictLabel, query.dictLabel) &&
        (!query.status || row.status === query.status),
    );
    return listOk(rows, query);
  }
  const typePath = restAfter(path, "/system/dict/data/type");
  if (method === "GET" && typePath) {
    const rows = dictData.filter(
      (row) => row.dictType === decodeURIComponent(typePath) && row.status === "0",
    );
    return ok({ code: 200, msg: "操作成功", data: rows });
  }
  if (method === "POST" && path === "/system/dict/type") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const dictName = readString(request.body, "dictName");
    const dictType = readString(request.body, "dictType");
    if (!dictName) return fail("字典名称不能为空");
    if (!dictType) return fail("字典类型不能为空");
    if (dictTypes.some((item) => item.dictType === dictType)) {
      return fail("字典类型已存在");
    }
    dictTypes.push({
      dictId: nextId(dictTypes.map((item) => item.dictId)),
      dictName,
      dictType,
      status: readString(request.body, "status") === "1" ? "1" : "0",
      remark: readString(request.body, "remark"),
      createTime: now,
    });
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/system/dict/type") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const dictId = readString(request.body, "dictId");
    const row = dictTypes.find((item) => item.dictId === dictId);
    if (!row) return dataById();
    const dictName = readString(request.body, "dictName");
    const dictType = readString(request.body, "dictType");
    if (!dictName) return fail("字典名称不能为空");
    if (!dictType) return fail("字典类型不能为空");
    if (dictTypes.some((item) => item.dictType === dictType && item.dictId !== dictId)) {
      return fail("字典类型已存在");
    }
    row.dictName = dictName;
    row.dictType = dictType;
    row.status = readString(request.body, "status") === "1" ? "1" : "0";
    row.remark = readString(request.body, "remark");
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "POST" && path === "/system/dict/data") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const dictLabel = readString(request.body, "dictLabel");
    const dictValue = readString(request.body, "dictValue");
    const dictType = readString(request.body, "dictType");
    const dictSort = readNumber(request.body, "dictSort");
    if (!dictLabel) return fail("数据标签不能为空");
    if (!dictValue) return fail("数据键值不能为空");
    if (!dictType) return fail("字典类型不能为空");
    if (dictSort === undefined) return fail("数据顺序不能为空");
    dictData.push({
      dictCode: nextId(dictData.map((item) => item.dictCode)),
      dictLabel,
      dictValue,
      dictType,
      dictSort,
      cssClass: readString(request.body, "cssClass"),
      listClass: readString(request.body, "listClass") || "default",
      isDefault: readString(request.body, "isDefault") === "Y" ? "Y" : "N",
      status: readString(request.body, "status") === "1" ? "1" : "0",
      remark: readString(request.body, "remark"),
      createTime: now,
    });
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/system/dict/data") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const dictCode = readString(request.body, "dictCode");
    const row = dictData.find((item) => item.dictCode === dictCode);
    if (!row) return dataById();
    const dictLabel = readString(request.body, "dictLabel");
    const dictValue = readString(request.body, "dictValue");
    const dictSort = readNumber(request.body, "dictSort");
    if (!dictLabel) return fail("数据标签不能为空");
    if (!dictValue) return fail("数据键值不能为空");
    if (dictSort === undefined) return fail("数据顺序不能为空");
    row.dictLabel = dictLabel;
    row.dictValue = dictValue;
    row.dictSort = dictSort;
    row.cssClass = readString(request.body, "cssClass");
    row.listClass = readString(request.body, "listClass") || "default";
    row.status = readString(request.body, "status") === "1" ? "1" : "0";
    row.remark = readString(request.body, "remark");
    return ok({ code: 200, msg: "操作成功" });
  }
  const typeRest = restAfter(path, "/system/dict/type");
  if (typeRest !== null && typeRest !== "" && typeRest !== "list" && typeRest !== "optionselect") {
    if (method === "GET") {
      const row = dictTypes.find((item) => item.dictId === decodeURIComponent(typeRest));
      return row ? ok({ code: 200, msg: "操作成功", data: row }) : dataById();
    }
    if (method === "DELETE") {
      const ids = new Set(parseIds(typeRest));
      const removed = dictTypes.filter((item) => ids.has(item.dictId));
      if (removed.length === 0) return dataById();
      dictTypes = dictTypes.filter((item) => !ids.has(item.dictId));
      const types = new Set(removed.map((item) => item.dictType));
      dictData = dictData.filter((item) => !types.has(item.dictType));
      return ok({ code: 200, msg: "操作成功" });
    }
  }
  const dataRest = restAfter(path, "/system/dict/data");
  if (dataRest !== null && dataRest !== "" && dataRest !== "list" && !dataRest.startsWith("type/")) {
    if (method === "GET") {
      const row = dictData.find((item) => item.dictCode === decodeURIComponent(dataRest));
      return row ? ok({ code: 200, msg: "操作成功", data: row }) : dataById();
    }
    if (method === "DELETE") {
      const ids = new Set(parseIds(dataRest));
      const next = dictData.filter((item) => !ids.has(item.dictCode));
      if (next.length === dictData.length) return dataById();
      dictData = next;
      return ok({ code: 200, msg: "操作成功" });
    }
  }
  if (method === "DELETE" && (path === "/system/dict/type" || path === "/system/dict/data")) {
    return fail("请选择要删除的数据");
  }
  return null;
}

export function dispatchSystemMock(request: MockRequest): MockResponse | null {
  const method = request.method.toUpperCase();
  const path = request.path.replace(/\/+$/, "") || "/";
  return (
    dispatchConfig(method, path, request) ??
    dispatchPost(method, path, request) ??
    dispatchNotice(method, path, request) ??
    dispatchDict(method, path, request) ??
    dispatchOrgMock(request) ??
    dispatchUserMock(request) ??
    dispatchRoleMock(request)
  );
}