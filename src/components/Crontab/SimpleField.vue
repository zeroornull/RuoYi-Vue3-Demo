<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  classifyCronToken,
  clampCronNumber,
  cronList,
  cronRange,
  cronStep,
  type CrontabField,
  type CrontabValue,
} from "./model";

const props = defineProps<{
  field: CrontabField;
  cron: CrontabValue;
  check?: (value: number, min: number, max: number) => number;
  everyLabel: string;
  unit: string;
  min: number;
  max: number;
  optionCount: number;
  valueOffset?: number;
}>();

const emit = defineEmits<{
  update: [name: CrontabField, value: string, from: CrontabField];
}>();

const valueOffset = props.valueOffset ?? 0;
const radioValue = ref(1);
const cycle01 = ref(props.min);
const cycle02 = ref(props.min + 1);
const average01 = ref(props.min);
const average02 = ref(1);
const checkboxList = ref<number[]>([]);
const checkCopy = ref([props.min]);
const check = props.check ?? clampCronNumber;

const cycleTotal = computed(() => {
  cycle01.value = check(cycle01.value, props.min, props.max - 1);
  cycle02.value = check(cycle02.value, cycle01.value + 1, props.max);
  return cronRange(cycle01.value, cycle02.value);
});
const averageTotal = computed(() => {
  average01.value = check(average01.value, props.min, props.max - 1);
  average02.value = check(average02.value, 1, props.max - average01.value);
  return cronStep(average01.value, average02.value);
});
const checkboxString = computed(() => cronList(checkboxList.value));

function changeRadioValue(value: string): void {
  const kind = classifyCronToken(value);
  if (kind === "every") {
    radioValue.value = 1;
  } else if (kind === "range") {
    const [start, end] = value.split("-");
    cycle01.value = Number(start);
    cycle02.value = Number(end);
    radioValue.value = 2;
  } else if (kind === "step") {
    const [start, step] = value.split("/");
    average01.value = Number(start);
    average02.value = Number(step);
    radioValue.value = 3;
  } else {
    checkboxList.value = [
      ...new Set(value.split(",").map((item) => Number(item))),
    ];
    radioValue.value = 4;
  }
}

function onRadioChange(): void {
  switch (radioValue.value) {
    case 1:
      emit("update", props.field, "*", props.field);
      break;
    case 2:
      emit("update", props.field, cycleTotal.value, props.field);
      break;
    case 3:
      emit("update", props.field, averageTotal.value, props.field);
      break;
    case 4:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0] ?? props.min);
      } else {
        checkCopy.value = [...checkboxList.value];
      }
      emit("update", props.field, checkboxString.value, props.field);
      break;
  }
}

watch(() => props.cron[props.field], (value) => changeRadioValue(value));
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange());
</script>

<template>
  <el-form>
    <el-form-item>
      <el-radio v-model="radioValue" :value="1">{{ everyLabel }}</el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="2">
        周期从
        <el-input-number v-model="cycle01" :min="min" :max="max - 1" />
        -
        <el-input-number v-model="cycle02" :min="cycle01 + 1" :max="max" />
        {{ unit }}
      </el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="3">
        从
        <el-input-number v-model="average01" :min="min" :max="max - 1" />
        {{ unit }}开始，每
        <el-input-number v-model="average02" :min="1" :max="max - average01" />
        {{ unit }}执行一次
      </el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model="radioValue" :value="4">
        指定
        <el-select v-model="checkboxList" clearable placeholder="可多选" multiple :multiple-limit="10">
          <el-option
            v-for="item in optionCount"
            :key="item"
            :label="item - 1 + valueOffset"
            :value="item - 1 + valueOffset"
          />
        </el-select>
      </el-radio>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
@use "./field-style.scss";
</style>
