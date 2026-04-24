import { defineConfig, loadEnv, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import { analyzer } from 'vite-bundle-analyzer'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    // Replaces webpack entry point - Vite uses index.html as entry
    // Your src/index.ts will be referenced from index.html

    // Replaces webpack output configuration
    build: {
      outDir: 'dist',
      // Replaces [name].[contenthash:8].js
      rollupOptions: {
        output: {
          entryFileNames: '[name].[hash:8].js',
          chunkFileNames: '[name].[hash:8].js',
          assetFileNames: '[name].[hash:8].[ext]',
          // Module Federation equivalent - shared dependencies
          manualChunks: (id) => {
            // Replicate Module Federation shared dependencies
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              // Split other vendors
              return 'vendor';
            }
          },
        },
      },
      // Replaces devtool: false in production
      sourcemap: !isProduction,
      // Enable minification
      minify: isProduction ? 'terser' : false,
      // Replicate webpack cache behavior
      emptyOutDir: true, // Replaces CleanWebpackPlugin
    },

    // Replaces webpack cache.type: 'filesystem'
    cacheDir: 'node_modules/.vite',

    // Replaces webpack resolve
    resolve: {
      // Replaces webpack resolve.extensions
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],

      // Replaces TsconfigPathsPlugin + manual aliases
      alias: {
        '@providers': resolve(__dirname, './src/providers'),
        '@lib': resolve(__dirname, './src/lib'),
        '@features': resolve(__dirname, './src/features'),
        '@components': resolve(__dirname, './src/components'),
        '@': resolve(__dirname, './src'),
        // Replaces webpack fallback for buffer
        'buffer': 'buffer/',
      },
    },

    // Replaces webpack DefinePlugin via DotenvPlugin
    define: {
      // Make env variables available
      'process.env': JSON.stringify(env),
      // Provide global if needed
      'global': 'globalThis',
    },

    // Replaces webpack-dev-server
    server: {
      port: 8081,
      open: true,
      host: true,
      // Replaces historyApiFallback: true
      historyApiFallback: true,
      // Enable HMR
      hmr: {
        overlay: true,
      },
    },

    // Preview server (for testing production builds)
    preview: {
      port: 3000,
      open: true,
      historyApiFallback: true,
    },

    // Plugins
    plugins: [
      analyzer({
        analyzerPort: 8082,
      }),
      // React plugin (replaces babel/react loaders)
      react({
        // Fast Refresh
        fastRefresh: true,
        // If you use @emotion
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),

      // Replaces TsconfigPathsPlugin
      tsconfigPaths({
        root: resolve(__dirname, '.'),
        // Use your tsconfig
        projects: [resolve(__dirname, './tsconfig.json')],
      }),

      // Replaces HtmlWebpackPlugin + CopyWebpackPlugin for index.html
      createHtmlPlugin({
        minify: isProduction,
        inject: {
          data: {
            title: 'LeadCMS Admin',
            // Add any variables you need in HTML
          },
        },
        // Template is now in root as index.html
      }),

      // Progress plugin equivalent (Vite shows progress by default)
      // But you can add custom progress if needed
      ...(isDevelopment ? [progressPlugin()] : []),
    ],

    // CSS handling (replaces style-loader + css-loader)
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
      devSourcemap: isDevelopment,
    },

    // Optimize dependencies (replaces webpack optimization)
    optimizeDeps: {
      // Force include buffer for ProvidePlugin equivalent
      include: [
        'buffer',
        'react',
        'react-dom',
        'react/jsx-runtime',
      ],
      // Replicate webpack ProvidePlugin for Buffer
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },

    // Worker configuration (if you use web workers)
    worker: {
      format: 'es',
    },
  };
});

// Custom progress plugin (optional - Vite already shows progress)
function progressPlugin(): PluginOption {
  return {
    name: 'vite-plugin-progress',
    buildStart() {
      console.log('🚀 Build starting...');
    },
    buildEnd() {
      console.log('✅ Build complete!');
    },
  };
}
