# noCachePlugin.js
webpack去缓存插件，解决小程序引入h5后缓存问题
# 安装
```code
npm i no-cache-plugin -s
```
# 使用
在vue.config.js中使用
```code
const { defineConfig } = require('@vue/cli-service');
const NoCachePlugin = require('no-cache-plugin');

module.exports = defineConfig({
  ...
  configureWebpack: (config) => {
    // 生产环境配置
    if (process.env.NODE_ENV === "production") {
      config.plugins.push(new NoCachePlugin());
    }
  },
});
```

