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
import WebpackBar from "webpackbar";
import { dependencies } from "../package.json";
import SpeedMeasurePlugin from "speed-measure-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

const { ModuleFederationPlugin } = container;

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

dotenv.config();

// Check if @swc/core is available
let useSwc = true;
try {
  require.resolve("@swc/core");
} catch (e) {
  console.warn("Warning: @swc/core is not installed. Falling back to ts-loader, which is slower.");
  useSwc = false;
}

const smp = new SpeedMeasurePlugin();

const getTsLoader = () => {
  if (useSwc) {
    return [
      "thread-loader",
      {
        loader: "swc-loader",
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
              tsx: true,
            },
            transform: {
              react: {
                runtime: "automatic",
              },
            },
          },
        },
      },
    ];
  } else {
    return [
      "thread-loader",
      {
        loader: "ts-loader",
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
    ];
  }
};

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
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
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
        use: getTsLoader(),
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    port: 3000,
    open: true,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new DotenvPlugin(),
    new WebpackBar(),
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
    new ForkTsCheckerWebpackPlugin(),
  ],
};

export default process.env.MEASURE ? smp.wrap(configuration) : configuration;
