import { createApp } from "vue";
import Message from "./Login.vue";
import "element-plus/lib/theme-chalk/index.css";
import Vant from "vant";
import "vant/lib/index.css";
import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";

function createMessage(message: any, type: any) {
	const messageinstance = createApp(Message, {
		message,
		type,
		show: true,
	});
	messageinstance.use(Vant);
	messageinstance.use(ElementPlus);
	const mountNode = document.createElement("div");
	mountNode.id = "k";
	document.body.appendChild(mountNode);
	messageinstance.mount(mountNode);
	// setTimeout(() => {
	// 	messageinstance.unmount();
	// 	document.body.removeChild(mountNode);
	// }, 2000);
	return true;
}

export default createMessage;
