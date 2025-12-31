import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import path from 'path';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import mockDevServerPlugin from 'vite-plugin-mock-dev-server';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

const isMock = process.env.MOCK == 'true';

console.log(`isMock = ${isMock}`);

const alias = {
  '@': '/src',
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    isMock && mockDevServerPlugin(),
    react(),
    replace({
      preventAssignment: true,
      __buildVersion: () => JSON.stringify(new Date()),
    }),
    createSvgIconsPlugin({
      // Specify the icon folder to be cached
      iconDirs: [path.resolve(process.cwd(), 'src/icons')],
      // Specify symbolId format
      symbolId: 'icon-[dir]-[name]',
    }),
    visualizer({
      filename: './dist/report.html', // 输出报告的文件路径
    }),
  ],

  resolve: {
    alias,
  },
  build: {
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin used during production bundling
        rollupNodePolyFill(),
      ],
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    assetsInlineLimit: 1024,
  },
  esbuild: {
    drop: process.env.NODE_ENV == 'production' ? ['console', 'debugger'] : [],
  },
  // 预编译优化
  optimizeDeps: {
    include: [], // dev环境下处理下这个dep
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis',
      },
      supported: {
        bigint: true,
      },
      // 开发阶段用到
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ],
    },
  },

});
