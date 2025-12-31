import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
  plugins: [
    react(),
    svgr({
      include: "**/*.svg",
      exclude: "**/*.svg?url",
    }),
    viteStaticCopy({
      targets: [
        {
          src: "src/assets/images/wallet",
          dest: "assets/images",
        },
        {
          src: ["src/assets/tokenList.json", "src/assets/sepoliaTokenList.json"],
          dest: "static",
        },
      ],
    }),
    createSvgIconsPlugin({
      // Specify the icon folder to be cached
      iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
      symbolId: "icon-[dir]-[name]",
      /**
       * 自定义的 svg sprits dom id
       */
      customDomId: "svg-icon-dom",
    }),
  ],
  build: {
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    include: ["@metamask/safe-event-emitter", "eth-block-tracker", "@coinbase/wallet-sdk"],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    port: 3001,
    host: "0.0.0.0",
  },
  // 如果你的项目使用了别名，可以在这里配置
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "./src"),
      events: "events",
      stream: "stream-browserify",
      buffer: "buffer",
    },
  },
});
