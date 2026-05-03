<template>
  <div class="container">
    <div id="docx"></div>
    <div class="watermark" v-for="i in 25" :key="i" :style="computedStyle(i-1)">{{ user.userName }}</div>
  </div>
</template>

<script>
import jsPreviewDocx from "@js-preview/docx";
import '@js-preview/docx/lib/index.css'
import {getUserProfile} from "@/api/system/user";
import {getTempUrl} from "@/api/flowable/definition";

export default {
  name: "JsPreviewDocxDemo",
  computed: {},
  methods: {
    computedStyle(index) {

      // 每行最多5个水印
      // 一共5行

      const top = Math.floor(index / 5) * 20;
      const left = (index % 5) * 20;

      return {
        top: `${top}%`,
        left: `${left}%`,
      }
    },
    getUser() {
      getUserProfile().then(response => {
        this.user = response.data;
      });
    },
    getDocUrl() {
      const hashCode = this.$route.query.hashCode;
      getTempUrl({hashCode}).then(response => {

        //初始化时指明要挂载的父元素Dom节点
        this.myDocxPreviewer = jsPreviewDocx.init(document.getElementById('docx'));

        //传递要预览的文件地址即可
        this.myDocxPreviewer.preview(response.data).then(() => {
          console.log('预览完成');
        }).catch(e => {
          console.log('预览失败', e);
        })
      });
    }
  },
  data() {
    return {
      myDocxPreviewer: null,
      user: {}
    }
  },
  mounted() {
    this.getUser()
    this.getDocUrl()


  },
  beforeDestroy() {
    this.myDocxPreviewer.destroy();
  }
};
</script>

<style scoped>

#docx {
  height: 90vh
}

.container {
}

.watermark {
  position: absolute;
  transform: rotate(-30deg);
  font-size: 50px;
  color: rgba(0, 0, 0, 0.1);
  font-weight: bold;
  z-index: 9999;
}

.watermark1 {
  top: 50%;
  left: 50%;
}
</style>
