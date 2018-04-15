const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const configUtils = require('./configUtils');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const baseDir = path.resolve(__dirname, '..');

module.exports = {
  mode: 'production',
  entry: path.resolve(baseDir, './src/server/index.js'),
  output: {
    path: path.join(path.resolve(__dirname, '..')),
    filename: 'busy.server.js',
  },
  target: 'node',
  externals: fs
    .readdirSync(path.resolve(baseDir, 'node_modules'))
    .map(module => ({ [module]: `commonjs ${module}` }))
    .reduce((a, b) => Object.assign({}, a, b), {}),
  node: {
    __filename: true,
    __dirname: true,
  },
  module: {
    rules: [
      {
        test: configUtils.MATCH_JS_JSX,
        include: path.resolve(baseDir, 'src'),
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/\.(css|less)$/, 'identity-obj-proxy'),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new webpack.DefinePlugin({
      'process.env.STEEMCONNECT_CLIENT_ID': JSON.stringify(
        process.env.STEEMCONNECT_CLIENT_ID || 'busy.app',
      ),
      'process.env.STEEMCONNECT_REDIRECT_URL': JSON.stringify(
        process.env.STEEMCONNECT_REDIRECT_URL || 'http://localhost:3000/callback',
      ),
      'process.env.STEEMCONNECT_HOST': JSON.stringify(
        process.env.STEEMCONNECT_HOST || 'https://steemconnect.com',
      ),
      'process.env.STEEMJS_URL': JSON.stringify(
        process.env.STEEMJS_URL || 'https://api.steemit.com',
      ),
      'process.env.IS_BROWSER': JSON.stringify(false),
      'process.env.SIGNUP_URL': JSON.stringify(
        process.env.SIGNUP_URL || 'https://signup.steemit.com/?ref=busy',
      ),
    }),
  ],
};
