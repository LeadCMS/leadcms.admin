// https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/32#issuecomment-478042178
delete process.env.TS_NODE_PROJECT;

import { resolve } from "path";
import { container, ProvidePlugin } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import dotenv from "dotenv";
import DotenvPlugin from "dotenv-webpack";
import { dependencies } from "../package.json";

const { ModuleFederationPlugin } = container;

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

dotenv.config();

const configuration: Configuration = {
  entry: {
    main: resolve(__dirname, "../src/index.ts"),
  },
  output: {
    path: resolve(__dirname, "../dist"),
    filename: "[name].[contenthash:8].js",
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
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
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
    // proxy: {
    //   "/api/**": process.env.CORE_API,
    //   changeOrigin: true,
    //   secure: false,
    // },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new DotenvPlugin(),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, "../public/index.html"),
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
  ],
};

export default configuration;
