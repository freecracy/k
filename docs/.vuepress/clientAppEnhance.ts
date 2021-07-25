import { defineClientAppEnhance } from "@vuepress/client";

import createMessage from "./login.ts";

export default defineClientAppEnhance(({ app, router, siteData }) => {
	app.mixin({
		mounted() {
			if (!document.getElementById("k") && !localStorage.getItem("session")) {
				document.getElementById("app").style.display = "none";
				createMessage("", "success");
			}
		},
	});
});
