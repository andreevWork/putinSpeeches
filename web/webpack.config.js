const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../'),
  },
  devServer: {
    client: {
      overlay: false,
    }
  },
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: "./favicons", to: "./favicons" },
        { from: "./words_count.json", to: "." },
        { from: "./art.png", to: "." },
      ],
    }),
  ],
};