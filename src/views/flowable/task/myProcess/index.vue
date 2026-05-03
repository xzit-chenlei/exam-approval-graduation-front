<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开始时间" prop="deployTime">
        <el-date-picker clearable size="small"
                        v-model="queryParams.deployTime"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="选择时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:deployment:add']"
        >新增流程</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:deployment:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="myProcessList" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="流程编号" align="center" prop="procInsId" :show-overflow-tooltip="true"/>
      <el-table-column label="流程名称" align="center" prop="procDefName" :show-overflow-tooltip="true"/>
      <el-table-column label="课题组" align="center" prop="exDeptName" width="180px" />
      <el-table-column label="教研室" align="center" prop="officeName" width="180px" />
      <el-table-column label="提交时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="流程状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'draft'" type="info" size="mini">暂存</el-tag>
          <el-tag v-else-if="scope.row.finishTime == null" size="mini">进行中</el-tag>
          <el-tag v-else type="success" size="mini">已完成</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="耗时" align="center" prop="duration" width="180"/>
      <el-table-column label="当前节点" align="center" prop="taskName"/>
      <el-table-column label="办理人" align="center">
        <template slot-scope="scope">
          <label v-if="scope.row.assigneeName">{{scope.row.assigneeName}}</label>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 'draft'" @click="handleContinueEdit(scope.row)" type="text" size="small">继续编辑</el-button>
          <el-button @click="handleFlowRecord(scope.row)" type="text" size="small">详情</el-button>
          <!-- <el-button @click="handleStop(scope.row)" type="text" size="small">取消申请</el-button> -->
          <el-button @click="handleDelete(scope.row)" type="text" size="small" v-hasPermi="['system:deployment:remove']">删除</el-button>
          <el-button @click="handlegenerateWordListDrawer(scope.row)" type="text" size="small" v-if="scope.row.finishTime">签名文件</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 发起流程 -->
    <el-dialog :title="title" :visible.sync="open" width="60%" append-to-body>
      <el-form :model="queryProcessParams" ref="queryProcessForm" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="queryProcessParams.name"
            placeholder="请输入名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleProcessQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetProcessQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="processLoading" fit :data="definitionList" border >
        <el-table-column label="流程名称" align="center" prop="name" />
        <el-table-column label="流程版本" align="center">
          <template slot-scope="scope">
            <el-tag size="medium" >v{{ scope.row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="流程分类" align="center" prop="category" />
        <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit-outline"
              @click="handleStartProcess(scope.row)"
            >发起流程</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="processTotal>0"
        :total="processTotal"
        :page.sync="queryProcessParams.pageNum"
        :limit.sync="queryProcessParams.pageSize"
        @pagination="listDefinition"
      />
    </el-dialog>

    <el-drawer
      title="word模板"
      :visible.sync="wordTemplateDrawer"
      :before-close="handleWordTemplateDrawerClose">
      <div class="fileUpload">
        <FileUploadV3
        :uploadFileUrl="uploadUrl"
        limit=1
        ref="wordTemplate"
        :data="wordTemplateParameter"
        :value="wordTemplateFile"
      ></FileUploadV3>
      </div>
    </el-drawer>
    <el-drawer
      title="文件列表"
      v-loading="drawerLoading"
      :visible.sync="generateWordListDrawer"
      :before-close="generateWordListDrawerClose">
      <div class="fileUpload">
        <el-button type="primary"  size="mini" @click="createDox(selectRow)">生成文件</el-button>
      <!-- 文件列表 -->
      <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
        <li :key="file.url" class="el-upload-list__item ele-upload-list__item-content" v-for="(file) in fileList">
          <el-link :href="`${file.url}`" :underline="false" target="_blank">
            <span class="el-icon-document"> {{ getFileName(file.key) }} </span>
          </el-link>
        </li>
      </transition-group>
      </div>
    </el-drawer>

  </div>
</template>

<script>
import {
  getDeployment,
  delDeployment,
  addDeployment,
  updateDeployment,
  exportDeployment,
  flowRecord
} from "@/api/flowable/finished";
import { myProcessList,stopProcess,formGenerateWord } from "@/api/flowable/process";
import {listDefinition} from "@/api/flowable/definition";
import {getTmpUrl,getTmpUrlList} from "@/api/system/file";
import FileUploadV3 from "@/views/components/FileUploadV3.vue"
export default {
  name: "Deploy",
  components: {
    FileUploadV3
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      processLoading: true,
      drawerLoading:false,
      //word模板上传抽屉
      wordTemplateDrawer: false,
      fileList:[],
      //生成的word列表
      generateWordListDrawer: false,
      //上传路径
      uploadUrl: process.env.VUE_APP_BASE_API + "/common/v3/upload",
      //上传模板
      wordTemplateFile:"",
      //上传模板参数
      wordTemplateParameter:{},
      //
      selectRow:{},
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      processTotal:0,
      // 我发起的流程列表数据
      myProcessList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      src: "",
      definitionList:[],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        category: null,
        key: null,
        tenantId: null,
        deployTime: null,
        derivedFrom: null,
        derivedFromRoot: null,
        parentDeploymentId: null,
        engineVersion: null,
        formMode: 'vform'
      },
      // 查询参数
      queryProcessParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        category: null,
        key: null,
        tenantId: null,
        deployTime: null,
        derivedFrom: null,
        derivedFromRoot: null,
        parentDeploymentId: null,
        engineVersion: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
      // 删除文件
      handleFileDelete(index) {
        deleteFile(this.data).then(res=>{

        })
        this.fileList.splice(index, 1);
        this.$emit("input", this.listToString(this.fileList));
      },
          // 获取文件名称
      getFileName(name) {
        // 如果是url那么取最后的名字 如果不是直接返回
        if (name.lastIndexOf("/") > -1) {
          return name.slice(name.lastIndexOf("/") + 1);
        } else {
          return name;
        }
      },
    createDox(row){
      var that = this ;
      that.drawerLoading = true;
      formGenerateWord({procInsId : row.procInsId}).then(res=>{
        that.drawerLoading = false;
        var data = {
        formName: "assessment_approval",
        objId:row.procInsId
      }
      getTmpUrlList(data).then(response=>{
        that.fileList = response.data;
      })
      })
    },
    //打卡上传模板抽屉
    handlewordTemplateDrawer(row){
      var data = {
        sceneName: "flowable_wordTemplate",
        objId:row.procInsId
      }
      getTmpUrl(data).then(res=>{
        if(res.data!="notFound"){
          this.wordTemplateFile = res.data;
        }

      })
      this.wordTemplateParameter = data;
      this.wordTemplateDrawer = true;

    },
    handlegenerateWordListDrawer(row){
      this.selectRow = row ;
      var data = {
        formName: "assessment_approval",
        objId:row.procInsId
      }
      getTmpUrlList(data).then(res=>{
        this.fileList = res.data;
      })
      this.generateWordListDrawer = true;
    },
    //关闭上传模板抽屉
    handleWordTemplateDrawerClose(done){
      done();

    },
    generateWordListDrawerClose(){
     this.generateWordListDrawer = false;
    },
    /** 查询流程定义列表 */
    getList() {
      this.loading = true;
      myProcessList(this.queryParams).then(response => {
        const records = (response.data && response.data.records) ? response.data.records : [];
        // 前端兜底：只显示 vform 流程
        // 约定：老数据（没有 formMode）也视为 vform
        this.myProcessList = records.filter(r => !r.formMode || r.formMode === 'vform');
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        category: null,
        key: null,
        tenantId: null,
        deployTime: null,
        derivedFrom: null,
        derivedFromRoot: null,
        parentDeploymentId: null,
        engineVersion: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleProcessQuery() {
      this.queryProcessParams.pageNum = 1;
      this.listDefinition();
    },
    /** 重置按钮操作 */
    resetProcessQuery() {
      this.resetForm("queryProcessForm");
      this.handleProcessQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.procInsId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.title = "发起流程";
      this.listDefinition();
    },
    listDefinition(){
      listDefinition(this.queryProcessParams).then(response => {
        this.definitionList = response.data.records;
        this.processTotal = response.data.total;
        this.processLoading = false;
      });
    },
    /**  发起流程申请 */
    handleStartProcess(row){
      this.$router.push({ path: '/flowable/task/myProcess/send/index',
        query: {
          deployId: row.deploymentId,
          procDefId: row.id
          }
      })
    },
    /**  取消流程申请 */
    handleStop(row){
      const params = {
        instanceId: row.procInsId
      }
      stopProcess(params).then( res => {
       this.$modal.msgSuccess(res.msg);
        this.getList();
      });
    },
    /** 继续编辑暂存流程 */
    handleContinueEdit(row) {
      this.$router.push({ 
        path: '/flowable/task/myProcess/send/index',
        query: {
          deployId: row.deployId,
          procDefId: row.procDefId,
          procInsId: row.procInsId,
          taskId: row.taskId,
          isDraft: true
        }
      })
    },
    /** 流程流转记录 */
    handleFlowRecord(row){
      this.$router.push({ path: '/flowable/task/myProcess/detail/index',
        query: {
          procInsId: row.procInsId,
          deployId: row.deployId,
          taskId: row.taskId
      }})
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getDeployment(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改流程定义";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateDeployment(this.form).then(response => {
             this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDeployment(this.form).then(response => {
             this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.procInsId || this.ids;// 暂不支持删除多个流程
      this.$confirm('是否确认删除流程定义编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return delDeployment(ids);
      }).then(() => {
        this.getList();
       this.$modal.msgSuccess("删除成功");
      })
    },
    /** 上传word模板 */
    handleUploadTemplate(row) {

    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有流程定义数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return exportDeployment(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
<style scoped>
.fileUpload{
  padding-left: 30px;
}
</style>
<style scoped lang="scss">
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
</style>

