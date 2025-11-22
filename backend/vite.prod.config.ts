import { defineConfig } from 'vite';

// Configuração exclusiva para o build de produção.
// Não usa o vite-plugin-node para evitar conflitos.
export default defineConfig({
  build: {
    // O diretório de saída para o build.
    outDir: 'dist-prod',
    // Habilita o build para SSR e define o arquivo de entrada em um único passo.
    // Esta é a forma correta de especificar o ponto de entrada do servidor.
    ssr: './src/server.ts',
  },
});