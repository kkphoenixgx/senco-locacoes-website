import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    // Define o diretório de saída.
    outDir: 'dist-prod',
    // Informa ao Vite que estamos construindo para um ambiente Node.js.
    ssr: true,
    // Define o ponto de entrada para o build de produção.
    // Isso garante que o `server.ts` seja o arquivo principal compilado.
    rollupOptions: {
      input: './src/server.ts',
    },
    // Garante que o arquivo de saída seja nomeado 'server.mjs' para corresponder ao script 'start'.
    // Esta é uma forma mais direta de nomear o arquivo de saída.
    ssrEmitAssets: true,
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/index.ts',
      exportName: 'viteNodeApp',
      tsCompiler: 'esbuild',
    })
  ]
});