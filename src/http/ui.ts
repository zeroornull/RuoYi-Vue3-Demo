export type LoadingHandle = {
  close: () => void;
};

export type HttpUi = {
  error: (message: string) => void;
  warning: (message: string) => void;
  notifyError: (title: string) => void;
  confirmRelogin: () => Promise<boolean>;
  showLoading: (text: string) => LoadingHandle;
};
