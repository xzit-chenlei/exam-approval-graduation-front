<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <div class="text-center">
              <userAvatar />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />用户名称
                <div class="pull-right">{{ user.userName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />手机号码
                <div class="pull-right">{{ user.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />用户邮箱
                <div class="pull-right">{{ user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />所属角色
                <div class="pull-right">{{ roleGroup }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />创建日期
                <div class="pull-right">{{ user.createTime }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />所属部门
                <div  class="dept-info"  v-for="(item, index) in deptList" :key="index">
                  {{ item.deptName }}
                </div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>基本资料</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
            <el-tab-pane label="电子签名" name="electronicSignature">
              <ImageUpload
                :uploadImgUrl="uploadUrl"
                :limit="fileLimit"
                ref="wordTemplate"
                :data="electronicSignatureParameter"
                :value="electronicSignatureUrl"
              ></ImageUpload>
            </el-tab-pane>
            <el-tab-pane label="电子签章" name="electronicAgree">
              <ImageUpload
                :uploadImgUrl="uploadUrl"
                :limit="fileLimit"
                ref="wordTemplateTWO"
                :data="electronicAgreeParameter"
                :value="electronicAgreeUrl"
              ></ImageUpload>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userAvatar from "./userAvatar";
import userInfo from "./userInfo";
import resetPwd from "./resetPwd";
import { getUserProfile } from "@/api/system/user";
import ImageUpload from "@/views/components/ImageUploadV3";

export default {
  name: "Profile",
  components: { userAvatar, userInfo, resetPwd, ImageUpload },
  data() {
    return {
      user: {},
      fileLimit: 1,
      roleGroup: {},
      postGroup: {},
      deptList:{},
      activeTab: "userinfo",
      //上传路径
      uploadUrl: process.env.VUE_APP_BASE_API + "/common/v3/upload",
      electronicSignatureUrl: "",
      electronicAgreeUrl: "",
      electronicSignatureParameter: {},
      electronicAgreeParameter: {},
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    getUser() {
      getUserProfile().then((response) => {
        console.log(response);
        this.user = response.data;
        this.roleGroup = response.roleGroup;
        this.postGroup = response.postGroup;
        this.deptList = response.deptList;
        this.electronicSignatureParameter = {
          sceneName: "electronic_signature",
          objId: response.data.userId,
        };
        this.electronicAgreeParameter = {
          sceneName: "electronic_agree",
          objId: response.data.userId,
        };
        this.electronicSignatureUrl = response.data.electronicSignatureUrl;
        this.electronicAgreeUrl = response.data.electronicAgreeUrl;
        console.log(this.electronicAgreeUrl);
      });
    },
  },
};
</script>
<style scoped>
.dept-info {
  flex: 1; /* 占据剩余空间 */
  min-width: 0; /* 允许内容宽度收缩 */
  text-align: right;
  word-wrap: break-word; /* 允许长单词换行 */
  white-space: pre-wrap; /* 保留空格但允许换行 */
}
</style>
