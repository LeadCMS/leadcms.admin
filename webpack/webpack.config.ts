// https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/32#issuecomment-478042178
delete process.env.TS_NODE_PROJECT;

import {resolve} from "path";
import {container, ProvidePlugin, ProgressPlugin} from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import {CleanWebpackPlugin} from "clean-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import {Configuration as WebpackConfiguration} from "webpack";
import {Configuration as WebpackDevServerConfiguration} from "webpack-dev-server";
import dotenv from "dotenv";
import DotenvPlugin from "dotenv-webpack";
import {dependencies} from "../package.json";
import CopyWebpackPlugin from "copy-webpack-plugin";

const {ModuleFederationPlugin} = container;

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
  cache: {
    type: "filesystem", // Enable persistent caching
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"], // Limit extensions to reduce overhead
    plugins: [new TsconfigPathsPlugin({configFile: resolve(__dirname, "../tsconfig.json")})],
    alias:{
      "@providers" : resolve(__dirname, "../src/providers"),
      "@lib": resolve(__dirname, "../src/lib"),
      "@features": resolve(__dirname, "../src/features"),
      "@components": resolve(__dirname, "../src/components"),
    },
    fallback: {
      "buffer": require.resolve("buffer/")
    },
  },
  devtool: process.env.NODE_ENV === "production"
    ? false // Disable source maps in production
    : "source-map", // Enable source maps in development
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
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

export default configuration;
