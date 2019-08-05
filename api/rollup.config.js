import typescript from "rollup-plugin-typescript";
import { uglify } from "rollup-plugin-uglify";

export default {
  input: "./src/index.ts",
  plugins: [typescript(), uglify()],
  output: {
    file: "dist/index.js",
    format: "cjs"
  },
  external: [
    "express-winston",
    "express",
    "body-parser",
    "fs",
    "path",
    "child_process",
    "tmp",
    "aws-sdk",
    "sanitize-filename",
    "express-request-id",
    "dotenv"
  ]
};
