import typescript from "rollup-plugin-typescript";
import { uglify } from "rollup-plugin-uglify";

export default {
  input: "./src/index.ts",
  plugins: [typescript(), uglify()],
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
  external: [
    "aws-sdk",
    "child_process",
    "fs",
    "path",
    "sanitize-filename",
    "tmp",
    "winston",
  ],
};
