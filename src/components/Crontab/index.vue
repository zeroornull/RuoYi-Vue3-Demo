<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import DayField from "./DayField.vue";
import Result from "./Result.vue";
import SimpleField from "./SimpleField.vue";
import WeekField from "./WeekField.vue";
import YearField from "./YearField.vue";
import {
  clampCronNumber,
  DEFAULT_CRONTAB,
  parseCrontab,
  shouldShowCrontabField,
  stringifyCrontab,
  type CrontabField,
  type CrontabValue,
} from "./model";

const props = withDefaults(
  defineProps<{
    hideComponent?: string[];
    expression?: string;
  }>(),
  {
    hideComponent: () => [],
    expression: "",
  },
);

const emit = defineEmits<{
  hide: [];
  fill: [value: string];
}>();

const hidden = ref<string[]>([]);
const crontabValueObj = ref<CrontabValue>({ ...DEFAULT_CRONTAB });
const crontabValueString = computed(() => stringifyCrontab(crontabValueObj.value));
const tabTitles = ["秒", "分钟", "小时", "日", "月", "周", "年"] as const;

watch(
  () => props.expression,
  (value) => {
    crontabValueObj.value = value ? parseCrontab(value) : { ...DEFAULT_CRONTAB };
  },
);

function updateCrontabValue(name: CrontabField, value: string): void {
  crontabValueObj.value = { ...crontabValueObj.value, [name]: value };
}

function hidePopup(): void {
  emit("hide");
}

function submitFill(): void {
  emit("fill", crontabValueString.value);
  hidePopup();
}

function clearCron(): void {
  crontabValueObj.value = { ...DEFAULT_CRONTAB };
}

onMounted(() => {
  hidden.value = [...props.hideComponent];
  crontabValueObj.value = props.expression ? parseCrontab(props.expression) : { ...DEFAULT_CRONTAB };
});
</script>

<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane v-if="shouldShowCrontabField(hidden, 'second')" label="秒">
        <SimpleField
          field="second"
          every-label="秒，允许的通配符[, - * /]"
          unit="秒"
          :cron="crontabValueObj"
          :check="clampCronNumber"
          :min="0"
          :max="59"
          :option-count="60"
          @update="updateCrontabValue"
        />
      </el-tab-pane>
      <el-tab-pane v-if="shouldShowCrontabField(hidden, 'min')" label="分钟">
        <SimpleField
          field="min"
          every-label="分钟，允许的通配符[, - * /]"
          unit="分钟"
          :cron="crontabValueObj"
          :check="clampCronNumber"
          :min="0"
          :max="59"
          :option-count="60"
          @update="updateCrontabValue"
        />
      </el-tab-pane>
      <el-tab-pane v-if="shouldShowCrontabField(hidden, 'hour')" label="小时">
        <SimpleField
          field="hour"
          every-label="小时，允许的通配符[, - * /]"
          unit="时"
          :cron="crontabValueObj"
          :check="clampCronNumber"
          :min="0"
          :max="23"
          :option-count="24"
          @update="updateCrontabValue"
        />
      </el-tab-pane>
      <el-tab-pane v-if="shouldShowCrontabField(hidden, 'day')" label="日">
        <DayField :cron="crontabValueObj" :check="clampCronNumber" @update="updateCrontabValue" />
      </el-tab-pane>
      <el-tab-pane v-if="shouldShowCrontabField(hidden, 'month')" label="月">
        <SimpleField
          field="month"
          every-label="月，允许的通配符[, - * /]"
          unit="月"
          :cron="crontabValueObj"
          :check="clampCronNumber"
          :min="1"
          :max="12"
          :option-count="12"
          :value-offset="1"
          @update="updateCrontabValue"
        />
      </el-tab-pane>
      <el-tab-pane v-if="shouldShowCrontabField(hidden, 'week')" label="周">
        <WeekField :cron="crontabValueObj" :check="clampCronNumber" @update="updateCrontabValue" />
      </el-tab-pane>
      <el-tab-pane v-if="shouldShowCrontabField(hidden, 'year')" label="年">
        <YearField :cron="crontabValueObj" :check="clampCronNumber" @update="updateCrontabValue" />
      </el-tab-pane>
    </el-tabs>
    <div class="popup-main">
      <div class="popup-result">
        <p class="title">时间表达式</p>
        <table>
          <thead>
            <tr>
              <th v-for="item in tabTitles" :key="item">{{ item }}</th>
              <th>Cron 表达式</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td v-for="field in ['second', 'min', 'hour', 'day', 'month', 'week', 'year'] as const" :key="field">
                {{ crontabValueObj[field] }}
              </td>
              <td class="result">{{ crontabValueString }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Result :ex="crontabValueString" />
      <div class="pop_btn">
        <el-button type="primary" @click="submitFill">确定</el-button>
        <el-button type="warning" @click="clearCron">重置</el-button>
        <el-button @click="hidePopup">取消</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pop_btn {
  margin-top: 20px;
  text-align: center;
}

.popup-main {
  position: relative;
  margin: 10px auto;
  overflow: hidden;
  font-size: 12px;
  border-radius: 5px;
}

.popup-result {
  position: relative;
  box-sizing: border-box;
  padding: 15px 10px 10px;
  margin: 25px auto;
  line-height: 24px;
  border: 1px solid #ccc;
}

.popup-result .title {
  position: absolute;
  top: -28px;
  left: 50%;
  width: 140px;
  margin-left: -70px;
  font-size: 14px;
  line-height: 30px;
  text-align: center;
  background: var(--app-surface, #fff);
}

.popup-result table {
  width: 100%;
  margin: 0 auto;
  text-align: center;
}
</style>
