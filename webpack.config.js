const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = (env) => {
  const isProd = env === 'production';
  return {
    mode: isProd ? 'production' : 'development',
    entry: "./src/index.js",
    devServer: {
      port: 3002,
      historyApiFallback: true,
      static: path.join(__dirname, 'public'),
    },
    output: {
      publicPath: "auto",
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,

          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"]
            }
          }
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
      ]
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "product_app",
        filename: "remoteEntry.js",
        exposes: { "./ProductApp": "./src/App.jsx" },
        remotes: {
          host_app: "host_app@http://localhost:3000/remoteEntry.js",
        },
        shared: {
          react: { singleton: true, eager: true, requiredVersion: '^18.0.0' },
          'react-dom': { singleton: true, eager: true, requiredVersion: '^18.0.0' },
          '@reduxjs/toolkit': { singleton: true, eager: true },
          'react-redux': { singleton: true, eager: true }

        }
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html"
      })
    ],
    resolve: {
      extensions: [".js", ".jsx"]
    }
  };
};
