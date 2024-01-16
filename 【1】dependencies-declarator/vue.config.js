const { name } = require("./package");

const port = 8401;

module.exports = {
  // 解决子应用项目内的字体/图片在主应用 404 的问题
  chainWebpack: (config) => {
    config.module.rule('fonts').use('url-loader').loader('url-loader').options({}).end();
    config.module.rule('images').use('url-loader').loader('url-loader').options({}).end();
  },
  devServer: {
    port,
    disableHostCheck: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    proxy: {
      "/api": {
        target: process.env.VUE_APP_BASE_API,
        pathRewrite: {
          "^/api": process.env.VUE_APP_BASE_API,
        },
      },
    },
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: "umd", // 把微应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`,
    },
  },
};
