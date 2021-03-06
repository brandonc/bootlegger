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
    "body-parser",
    "express",
    "express-request-id",
    "express-winston",
    "fs",
    "path",
    "winston",
  ],
};
