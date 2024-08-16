import { defineConfig } from 'dumi';

export default defineConfig({
  favicons: [
    './images/favicon.png',
  ],
  // runtimePublicPath: {
  //   publicPath: "/liteflow/"
  // },
  // publicPath: "/liteflow/",
  // base: "/liteflow/",
  outputPath: 'docs-dist',
  hash: true,
  themeConfig: {
    name: 'liteflow',
    logo: './images/favicon.png',
    footer: `Open-source MIT Licensed | Copyright © 2024-present<br />Powered by self`,
  },
});
