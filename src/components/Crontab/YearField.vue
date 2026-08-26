<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { classifyCronToken, clampCronNumber, cronList, cronRange, cronStep, type CrontabValue } from "./model";

const props = defineProps<{
  cron: CrontabValue;
  check?: (value: number, min: number, max: number) => number;
}>();

const emit = defineEmits<{
  update: [name: "year", value: string, from: "year"];
}>();

const fullYear = new Date().getFullYear();
const maxFullYear = fullYear + 10;
const check = props.check ?? clampCronNumber;
const radioValue = ref(1);
const cycle01 = ref(fullYear);
const cycle02 = ref(fullYear + 1);
const average01 = ref(fullYear);
const average02 = ref(1);
const checkboxList = ref<number[]>([]);
const checkCopy = ref([fullYear]);
const cycleTotal = computed(() => {
  cycle01.value = check(cycle01.value, fullYear, maxFullYear - 1);
  cycle02.value = check(cycle02.value, cycle01.value + 1, maxFullYear);
  return cronRange(cycle01.value, cycle02.value);
});
const averageTotal = computed(() => {
  average01.value = check(average01.value, fullYear, maxFullYear - 1);
  average02.value = check(average02.value, 1, 10);
  return cronStep(average01.value, average02.value);
});
const checkboxString = computed(() => cronList(checkboxList.value));

function changeRadioValue(value: string): void {
  const kind = classifyCronToken(value);
  if (kind === "empty") radioValue.value = 1;
  else if (kind === "every") radioValue.value = 2;
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
  } else {
    checkboxList.value = [...new Set(value.split(",").map((item) => Number(item)))];
    radioValue.value = 5;
  }
}

function onRadioChange(): void {
  switch (radioValue.value) {
    case 1:
      emit("update", "year", "", "year");
      break;
    case 2:
      emit("update", "year", "*", "year");
      break;
    case 3:
      emit("update", "year", cycleTotal.value, "year");
      break;
    case 4:
      emit("update", "year", averageTotal.value, "year");
      break;
    case 5:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0] ?? fullYear);
      } else {
        checkCopy.value = [...checkboxList.value];
      }
      emit("update", "year", checkboxString.value, "year");
      break;
  }
}

watch(
  () => props.cron.year,
  (value) => changeRadioValue(value),
);
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange());
</script>

<template>
  <el-form>
    <el-form-item>
      <el-radio v-model="radioValue" :value="1">不填，允许的通配符[, - * /]</el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="2">每年</el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="3">
        周期从
        <el-input-number v-model="cycle01" :min="fullYear" :max="2098" />
        -
        <el-input-number v-model="cycle02" :min="cycle01 + 1" :max="2099" />
      </el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="4">
        从
        <el-input-number v-model="average01" :min="fullYear" :max="2098" /> 年开始，每
        <el-input-number v-model="average02" :min="1" :max="10" /> 年执行一次
      </el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="5">
        指定
        <el-select v-model="checkboxList" clearable placeholder="可多选" multiple :multiple-limit="8">
          <el-option v-for="item in 9" :key="item" :value="item - 1 + fullYear" :label="item - 1 + fullYear" />
        </el-select>
      </el-radio>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
@use "./field-style.scss";
</style>
