// https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/32#issuecomment-478042178
delete process.env.TS_NODE_PROJECT;

import { resolve } from "path";
import { container, ProvidePlugin, ProgressPlugin } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import dotenv from "dotenv";
import DotenvPlugin from "dotenv-webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import * as fs from "fs";

const packageJson = JSON.parse(fs.readFileSync(resolve(__dirname, "../package.json"), "utf-8"));
const { dependencies } = packageJson;

const { ModuleFederationPlugin } = container;

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

dotenv.config();

const createConfiguration = (
  _env: Record<string, string>,
  argv: { mode?: string }
): Configuration => {
  const isProduction = argv.mode === "production";

  const configuration: Configuration = {
    entry: {
      main: resolve(__dirname, "../src/index.ts"),
    },
    output: {
      path: resolve(__dirname, "../dist"),
      filename: "[name].[contenthash:8].js",
      publicPath: "/",
    },
    cache: {
      type: "filesystem", // Enable persistent caching
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"], // Limit extensions to reduce overhead
      plugins: [new TsconfigPathsPlugin({ configFile: resolve(__dirname, "../tsconfig.json") })],
      alias: {
        "@providers": resolve(__dirname, "../src/providers"),
        "@lib": resolve(__dirname, "../src/lib"),
        "@features": resolve(__dirname, "../src/features"),
        "@components": resolve(__dirname, "../src/components"),
      },
      fallback: {
        buffer: require.resolve("buffer/"),
      },
    },
    devtool: isProduction
      ? false // Disable source maps in production
      : "source-map", // Enable source maps in development
    optimization: {
      minimizer: [
        "...", // Keep the default JS minimizer (TerserPlugin)
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          // Split large, infrequently-changing vendor libs into their own chunks
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom|scheduler)[\\/]/,
            name: "chunk-react",
            chunks: "all",
            priority: 40,
          },
          mui: {
            test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
            name: "chunk-mui",
            chunks: "all",
            priority: 30,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "chunk-vendors",
            chunks: "initial",
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            { loader: "css-loader" },
          ],
        },
        {
          test: /\.tsx?$/,
          include: resolve(__dirname, "../src"), // Use include instead of exclude
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true, // Speed up compilation by skipping type checking
              },
            },
          ],
        },
      ],
    },
    devServer: {
      historyApiFallback: true,
    },
    plugins: [
      new CleanWebpackPlugin(),
      new DotenvPlugin(),
      new HtmlWebpackPlugin({
        template: resolve(__dirname, "../public/index.html"),
      }),
      ...(isProduction
        ? [new MiniCssExtractPlugin({ filename: "[name].[contenthash:8].css" })]
        : []),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: resolve(__dirname, "../public"),
            to: resolve(__dirname, "../dist"),
            filter: (resourcePath) => !resourcePath.endsWith("index.html"),
          },
        ],
      }),
      new ModuleFederationPlugin({
        shared: {
          react: {
            requiredVersion: dependencies.react,
            singleton: true,
          },
          "react/jsx-runtime": {
            singleton: true,
            requiredVersion: dependencies.react,
          },
          "react-dom": {
            requiredVersion: dependencies["react-dom"],
            singleton: true,
          },
        },
      }),
      new ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      new ProgressPlugin(),
    ],
  };

  return configuration;
};

export default createConfiguration;
