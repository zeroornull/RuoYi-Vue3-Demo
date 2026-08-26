export type TypedFormInstance = {
  validate: () => Promise<unknown>;
  resetFields: () => void;
};

export async function submitForm(form: TypedFormInstance | null | undefined): Promise<boolean> {
  if (!form) {
    return false;
  }
  try {
    await form.validate();
    return true;
  } catch {
    return false;
  }
}

export function resetForm(form: TypedFormInstance | null | undefined): void {
  form?.resetFields();
}
