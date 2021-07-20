import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";

let head = [
  [
    "link",
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: `/images/icons/favicon-16x16.png`,
    },
  ],
  [
    "link",
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: `/images/icons/favicon-32x32.png`,
    },
  ],
  ["link", { rel: "manifest", href: "/manifest.webmanifest" }],
  ["meta", { name: "application-name", content: "VuePress" }],
  ["meta", { name: "charset", content: "UTF-8" }],
  ["meta", { name: "apple-mobile-web-app-title", content: "VuePress" }],
  ["meta", { name: "apple-mobile-web-app-status-bar-style", content: "black" }],
  [
    "link",
    { rel: "apple-touch-icon", href: `/images/icons/apple-touch-icon.png` },
  ],
  [
    "link",
    {
      rel: "mask-icon",
      href: "/images/icons/safari-pinned-tab.svg",
      color: "#3eaf7c",
    },
  ],
  ["meta", { name: "msapplication-TileColor", content: "#3eaf7c" }],
  ["meta", { name: "theme-color", content: "#3eaf7c" }],
];

let navbar = [
  {
    text: "指南",
    children: [
      {
        text: "入门",
        link: "/入门/基础.md",
      },
    ],
  },
  {
    text: "其它",
    children: [
      {
        text: "clickHouse",
        link: "https://clickhouse.tech/docs/zh/",
      },
    ],
  },
  {
    text: "联系我",
    link: "http://wpa.qq.com/msgrd?v=3&uin=295984047&site=qq&menu=yes",
  },
];

let sidebar = [
  {
    text: "入门",
    children: [
      "/入门/基础.md",
      "/入门/创建和发布应用.md",
      "/入门/安装配置.md",
      "/入门/深入掌握pod.md",
      "/入门/深入掌握service.md",
      "/入门/核心组件运行机制.md",
      "/入门/集群安全机制.md",
      "/入门/网络.md",
      "/入门/存储.md",
      "/入门/集群管理.md",
      "/入门/开发指南.md",
      "/入门/问题集.md",
    ],
  },
];

export default defineUserConfig<DefaultThemeOptions>({
  base: "/k/",
  lang: "zh-CN",
  title: "k8s笔记",
  description: "just a little",
  themeConfig: {
    logo: "https://vuejs.org/images/logo.png",
    navbar,
    sidebar,
    lastUpdatedText: "最近更新",
    contributors: false,
  },
  bundler: "@vuepress/vite",
});
