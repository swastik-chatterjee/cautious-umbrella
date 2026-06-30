const webpack = require('@nativescript/webpack');
const path = require('path');

module.exports = (env) => {
  webpack.init(env);
  webpack.useConfig({
    projectRoot: __dirname,
  });

  return webpack.resolveConfig();
};
