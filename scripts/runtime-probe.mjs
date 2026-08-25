#!/usr/bin/env node

console.log(
  JSON.stringify(
    {
      execPath: process.execPath,
      bun: process.versions.bun ?? null,
      node: process.version,
    },
    null,
    2,
  ),
);
