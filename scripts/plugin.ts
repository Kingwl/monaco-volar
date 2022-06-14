import type { Plugin } from "esbuild";

export const externalCjsToEsmPlugin = (externals: string[]): Plugin => ({
  name: "external",
  setup(build) {
    const escape = (text: string) =>
      `^${text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`;
    const filter = new RegExp(externals.map(escape).join("|"));
    build.onResolve({ filter: /.*/, namespace: "external" }, (args) => ({
      path: args.path,
      external: true,
    }));
    build.onResolve({ filter }, (args) => ({
      path: args.path,
      namespace: "external",
    }));
    build.onLoad({ filter: /.*/, namespace: "external" }, (args) => ({
      contents: `export * from ${JSON.stringify(args.path)}`,
    }));
  },
});
