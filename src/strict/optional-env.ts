type CompressEnv = Pick<ImportMetaEnv, "VITE_BUILD_COMPRESS">;

export const omittedCompress: CompressEnv = {};

// @ts-expect-error exactOptionalPropertyTypes: omitting the key is not the same as undefined
export const undefinedCompress: CompressEnv = {
  VITE_BUILD_COMPRESS: undefined,
};
