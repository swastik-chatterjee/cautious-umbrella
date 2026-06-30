const webpack = require('@nativescript/webpack');

module.exports = (env) => {
  webpack.init(env);

  webpack.chainWebpack((config) => {
    // Custom webpack configuration can be added here
  });

  return webpack.resolveConfig();
};
