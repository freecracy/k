<template>
  <van-popup v-model="show" round>
    <div class="message" :class="classObj">{{ message }}</div>
    <van-form @submit="onSubmit">
      <van-field
        v-model="username"
        name="用户名"
        label="用户名"
        placeholder="用户名"
        :rules="[{ required: true, message: '请填写用户名' }]"
      />
      <van-field
        v-model="password"
        type="password"
        name="密码"
        label="密码"
        placeholder="密码"
        :rules="[{ required: true, message: '请填写密码' }]"
      />
      <div style="margin: 16px">
        <van-button round block type="info" native-type="submit"
          >提交</van-button
        >
      </div>
    </van-form>
  </van-popup>
</template>

<script type="ts">
import { defineComponent } from "vue";
import axios from "axios";
import md5 from "md5";
import { Notify } from "vant";

export default defineComponent({
  name: "Message",
  props: {
    message: String,
    type: {
      type: String,
      default: "info",
    },
  },
  data() {
    return {
      username: "122",
      password: "999",
      show: false,
    };
  },
  methods: {
    onSubmit(values) {
      axios({
        method: "post",
        url: "https://byte.deno.dev/login",
        // headers: {
        //   "Content-Type": "application/x-www-form-urlencoded",
        // },
        data: {
          username: this.username,
          password: this.password,
        },
      }).then((response) => {
        if (response.data.code == 10000 && response.data.data.status == true) {
          window.localStorage.setItem("session", md5(response.data.data.token));
          document.getElementById("k").remove();
          document.getElementById("app").style.display = "inline";
        } else {
          Notify({
            message: "用户名或密码错误",
            type: "primary",
            duration: 1000,
          });
        }
      });
    },
  },
  setup(props) {
    const classObj = {
      "message-success": props.type === "success",
    };
    return { classObj };
  },
});
</script>
<style type="text/css">
</style>
