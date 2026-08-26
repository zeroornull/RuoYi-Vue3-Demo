import {
  reactive
}
from "vue";
const formData = reactive({
  mobile: "",
  role: ""
});

function submit() {
  if (formData.mobile) {
    console.log(formData)
  }
}
