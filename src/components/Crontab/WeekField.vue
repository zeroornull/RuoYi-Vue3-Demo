<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  classifyCronToken,
  clampCronNumber,
  cronList,
  cronRange,
  type CrontabValue,
} from "./model";

const WEEK_OPTIONS = [
  { key: 1, value: "星期日" },
  { key: 2, value: "星期一" },
  { key: 3, value: "星期二" },
  { key: 4, value: "星期三" },
  { key: 5, value: "星期四" },
  { key: 6, value: "星期五" },
  { key: 7, value: "星期六" },
] as const;

const props = defineProps<{
  cron: CrontabValue;
  check?: (value: number, min: number, max: number) => number;
}>();

const emit = defineEmits<{
  update: [name: "week" | "day", value: string, from: "week"];
}>();

const check = props.check ?? clampCronNumber;
const radioValue = ref(2);
const cycle01 = ref(2);
const cycle02 = ref(3);
const average01 = ref(1);
const average02 = ref(2);
const weekday = ref(2);
const checkboxList = ref<number[]>([]);
const checkCopy = ref([2]);
const cycleTotal = computed(() => {
  cycle01.value = check(cycle01.value, 1, 6);
  cycle02.value = check(cycle02.value, cycle01.value + 1, 7);
  return cronRange(cycle01.value, cycle02.value);
});
const averageTotal = computed(() => {
  average01.value = check(average01.value, 1, 4);
  average02.value = check(average02.value, 1, 7);
  return `${average02.value}#${average01.value}`;
});
const weekdayTotal = computed(() => {
  weekday.value = check(weekday.value, 1, 7);
  return `${weekday.value}L`;
});
const checkboxString = computed(() => cronList(checkboxList.value));

function changeRadioValue(value: string): void {
  const kind = classifyCronToken(value);
  if (kind === "every") radioValue.value = 1;
  else if (kind === "unspecified") radioValue.value = 2;
  else if (kind === "range") {
    const [start, end] = value.split("-");
    cycle01.value = Number(start);
    cycle02.value = Number(end);
    radioValue.value = 3;
  } else if (kind === "nth") {
    const [week, nth] = value.split("#");
    average02.value = Number(week);
    average01.value = Number(nth);
    radioValue.value = 4;
  } else if (kind === "last") {
    weekday.value = Number(value.split("L")[0]);
    radioValue.value = 5;
  } else {
    checkboxList.value = [...new Set(value.split(",").map((item) => Number(item)))];
    radioValue.value = 6;
  }
}

function onRadioChange(): void {
  if (radioValue.value === 2 && props.cron.day === "?") {
    emit("update", "day", "*", "week");
  }
  if (radioValue.value !== 2 && props.cron.day !== "?") {
    emit("update", "day", "?", "week");
  }
  switch (radioValue.value) {
    case 1:
      emit("update", "week", "*", "week");
      break;
    case 2:
      emit("update", "week", "?", "week");
      break;
    case 3:
      emit("update", "week", cycleTotal.value, "week");
      break;
    case 4:
      emit("update", "week", averageTotal.value, "week");
      break;
    case 5:
      emit("update", "week", weekdayTotal.value, "week");
      break;
    case 6:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0] ?? 2);
      } else {
        checkCopy.value = [...checkboxList.value];
      }
      emit("update", "week", checkboxString.value, "week");
      break;
  }
}

watch(() => props.cron.week, (value) => changeRadioValue(value));
watch(
  [radioValue, cycleTotal, averageTotal, weekdayTotal, checkboxString],
  () => onRadioChange(),
);
</script>

<template>
  <el-form>
    <el-form-item>
      <el-radio v-model="radioValue" :value="1">周，允许的通配符[, - * ? / L #]</el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="2">不指定</el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="3">
        周期从
        <el-select v-model="cycle01" clearable>
          <el-option
            v-for="item in WEEK_OPTIONS"
            :key="item.key"
            :label="item.value"
            :value="item.key"
            :disabled="item.key === 7"
          />
        </el-select>
        -
        <el-select v-model="cycle02" clearable>
          <el-option
            v-for="item in WEEK_OPTIONS"
            :key="item.key"
            :label="item.value"
            :value="item.key"
            :disabled="item.key <= cycle01"
          />
        </el-select>
      </el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="4">
        第
        <el-input-number v-model="average01" :min="1" :max="4" /> 周的
        <el-select v-model="average02" clearable>
          <el-option
            v-for="item in WEEK_OPTIONS"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          />
        </el-select>
      </el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="5">
        本月最后一个
        <el-select v-model="weekday" clearable>
          <el-option
            v-for="item in WEEK_OPTIONS"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          />
        </el-select>
      </el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="6">
        指定
        <el-select v-model="checkboxList" class="multiselect" clearable placeholder="可多选" multiple :multiple-limit="6">
          <el-option
            v-for="item in WEEK_OPTIONS"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          />
        </el-select>
      </el-radio>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
@use "./field-style.scss";
</style>
