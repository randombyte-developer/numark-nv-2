import rollupPluginTypeScript from "rollup-plugin-typescript2";

export default {
  input: "./src/numark-nv2.ts",
  output: {
    file: "./dist/numark-nv2.js",
    format: "iife",
    name: "NumarkNv2",
  },
  plugins: [
    rollupPluginTypeScript({
      tsconfig: "./tsconfig.json",
      clean: true,
    }),
  ],
};
