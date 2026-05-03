<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="24" >
        <h2>公告<i class="el-icon-bell"></i></h2>
        <hr/>
      </el-col>
    </el-row>

    <div v-for="(item, index) in announcementList" :key="index">
      <el-row :gutter="20">
        <el-col :sm="24" :lg="12" style="padding-left: 20px">
          <div style="font-weight: 500;color: #1e1e1e;font-size: 24px">{{item.noticeTitle}}</div>
          <div style="font-weight: 400"><span style="color: #1e1e1e">{{item.createBy}}发布于</span> {{item.createTime}}</div>
          <div v-html="item.noticeContent"></div>
        </el-col>
      </el-row>
      <el-divider/>
    </div>

    <el-row :gutter="20">
      <el-col :sm="24" :lg="24">
        <h2>通知<i class="el-icon-bell"></i></h2>
        <hr/>
      </el-col>
    </el-row>

    <div v-for="(item, index) in noticeList" :key="index">
      <el-row :gutter="20">
        <el-col :sm="24" :lg="12" style="padding-left: 20px">
          <div style="font-weight: 500;color: #1e1e1e;font-size: 24px">{{item.noticeTitle}}</div>
          <div style="font-weight: 400"><span style="color: #1e1e1e">{{item.createBy}}发布于</span> {{item.createTime}}</div>
          <div v-html="item.noticeContent"></div>
        </el-col>
      </el-row>
      <el-divider/>
    </div>
  </div>
</template>

<script>
import {listNotice} from "@/api/system/notice";

export default {
  name: "Index",
  data() {
    return {
      // 版本号
      version: "3.8.7",
      loading: true,
      announcementList: [],
      noticeList: []
    };
  },
  mounted() {
    this.getAnnouncementList()
    this.getNoticeList()
  },
  methods: {
    goTarget(href) {
      window.open(href, "_blank");
    },
    getAnnouncementList() {
      this.loading = true;
      listNotice({
        noticeType: 2,
        status: 0
      }).then(response => {
        this.announcementList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getNoticeList() {
      this.loading = true;
      listNotice({
        noticeType: 1,
        status: 0
      }).then(response => {
        this.noticeList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
  }
};
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }

  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }

  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

