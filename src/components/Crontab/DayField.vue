<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { classifyCronToken, clampCronNumber, cronList, cronRange, cronStep, type CrontabValue } from "./model";

const props = defineProps<{
  cron: CrontabValue;
  check?: (value: number, min: number, max: number) => number;
}>();

const emit = defineEmits<{
  update: [name: "day" | "week", value: string, from: "day"];
}>();

const check = props.check ?? clampCronNumber;
const radioValue = ref(1);
const cycle01 = ref(1);
const cycle02 = ref(2);
const average01 = ref(1);
const average02 = ref(1);
const workday = ref(1);
const checkboxList = ref<number[]>([]);
const checkCopy = ref([1]);
const cycleTotal = computed(() => {
  cycle01.value = check(cycle01.value, 1, 30);
  cycle02.value = check(cycle02.value, cycle01.value + 1, 31);
  return cronRange(cycle01.value, cycle02.value);
});
const averageTotal = computed(() => {
  average01.value = check(average01.value, 1, 30);
  average02.value = check(average02.value, 1, 31 - average01.value);
  return cronStep(average01.value, average02.value);
});
const workdayTotal = computed(() => {
  workday.value = check(workday.value, 1, 31);
  return `${workday.value}W`;
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
  } else if (kind === "step") {
    const [start, step] = value.split("/");
    average01.value = Number(start);
    average02.value = Number(step);
    radioValue.value = 4;
  } else if (kind === "workday") {
    workday.value = Number(value.split("W")[0]);
    radioValue.value = 5;
  } else if (value === "L") radioValue.value = 6;
  else {
    checkboxList.value = [...new Set(value.split(",").map((item) => Number(item)))];
    radioValue.value = 7;
  }
}

function onRadioChange(): void {
  if (radioValue.value === 2 && props.cron.week === "?") {
    emit("update", "week", "*", "day");
  }
  if (radioValue.value !== 2 && props.cron.week !== "?") {
    emit("update", "week", "?", "day");
  }
  switch (radioValue.value) {
    case 1:
      emit("update", "day", "*", "day");
      break;
    case 2:
      emit("update", "day", "?", "day");
      break;
    case 3:
      emit("update", "day", cycleTotal.value, "day");
      break;
    case 4:
      emit("update", "day", averageTotal.value, "day");
      break;
    case 5:
      emit("update", "day", workdayTotal.value, "day");
      break;
    case 6:
      emit("update", "day", "L", "day");
      break;
    case 7:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0] ?? 1);
      } else {
        checkCopy.value = [...checkboxList.value];
      }
      emit("update", "day", checkboxString.value, "day");
      break;
  }
}

watch(
  () => props.cron.day,
  (value) => changeRadioValue(value),
);
watch([radioValue, cycleTotal, averageTotal, workdayTotal, checkboxString], () => onRadioChange());
</script>

<template>
  <el-form>
    <el-form-item>
      <el-radio v-model="radioValue" :value="1">日，允许的通配符[, - * ? / L W]</el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="2">不指定</el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="3">
        周期从
        <el-input-number v-model="cycle01" :min="1" :max="30" />
        -
        <el-input-number v-model="cycle02" :min="cycle01 + 1" :max="31" /> 日
      </el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="4">
        从
        <el-input-number v-model="average01" :min="1" :max="30" /> 号开始，每
        <el-input-number v-model="average02" :min="1" :max="31 - average01" /> 日执行一次
      </el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="5">
        每月
        <el-input-number v-model="workday" :min="1" :max="31" /> 号最近的那个工作日
      </el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="6">本月最后一天</el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="7">
        指定
        <el-select v-model="checkboxList" clearable placeholder="可多选" multiple :multiple-limit="10">
          <el-option v-for="item in 31" :key="item" :label="item" :value="item" />
        </el-select>
      </el-radio>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
@use "./field-style.scss";
</style>
