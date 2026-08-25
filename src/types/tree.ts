export type TreeNode<T extends object = Record<string, unknown>> = T & {
  children?: Array<TreeNode<T>>;
};
