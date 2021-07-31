import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";
import { readdirSync } from "fs";

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
		text: "文章",
		children: ["/其它/服务.md", "/其它/ELK环境搭建.md", "/其它/proto3.md"],
	},
	{
		text: "其它",
		children: [
			{
				text: "clickHouse",
				link: "https://clickhouse.tech/docs/zh/",
			},
			{
				text: "etcd",
				link: "https://etcd.io",
			},
			{
				text: "ts",
				link: "https://www.typescriptlang.org",
			},
			{
				text: "grafana",
				link: "https://grafana.com/oss/",
			},
			{
				text: "runst",
				link: "https://www.rust-lang.org/zh-CN/",
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

function list(p: string): string[] {
	let s: string[] = [];
	const files = readdirSync(p);
	for (const file of files) {
		if (file.endsWith(".md")) {
			s.push("/入门/" + file.toString());
		}
	}

	return s;
}
