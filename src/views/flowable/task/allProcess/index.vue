<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="流程名称" prop="procDefName">
        <el-input
          v-model="queryParams.procDefName"
          placeholder="请输入流程名称"
          clearable
          size="small"
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="课题组" prop="deptId">
        <treeselect
          v-model="queryParams.deptId"
          :options="deptOptions"
          :disable-branch-nodes="true"
          placeholder="请选择课题组"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="教研室" prop="officeId">
        <el-select
          v-model="queryParams.officeId"
          placeholder="请选择教研室"
          clearable
          size="small"
          style="width: 200px"
        >
          <el-option
            v-for="item in officeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="deployTime">
        <el-date-picker
          clearable
          size="small"
          v-model="queryParams.deployTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择时间"
          style="width: 200px">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="是否完结" prop="finished">
        <el-select
          v-model="queryParams.finished"
          placeholder="请选择状态"
          clearable
          size="small"
          style="width: 200px"
        >
          <el-option label="全部" :value="null"></el-option>
          <el-option label="进行中" :value="false"></el-option>
          <el-option label="已完成" :value="true"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否配备模板" prop="templateStatus">
        <el-select
          v-model="queryParams.templateStatus"
          placeholder="请选择状态"
          clearable
          size="small"
          style="width: 200px"
        >
          <el-option label="全部" :value="null"></el-option>
          <el-option label="未配备模板" :value="1"></el-option>
          <el-option label="月内未更新模板" :value="2"></el-option>
          <el-option label="月内已更新模板" :value="3"></el-option>
          <el-option label="未配备||月内未更新" :value="4"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="allProcessList" border>
      <el-table-column label="流程编号" align="center" prop="procInsId" :show-overflow-tooltip="true"/>
      <el-table-column label="流程名称" align="center" prop="procDefName" :show-overflow-tooltip="true"/>
      <el-table-column label="课题组" align="center" prop="exDeptName" width="180px" />
      <el-table-column label="教研室" align="center" prop="officeName" width="180px" />
      <el-table-column label="发起人" align="center" prop="startUserName" width="120px" />
      <el-table-column label="提交时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="流程状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.finishTime == null" size="mini">进行中</el-tag>
          <el-tag type="success" v-if="scope.row.finishTime != null" size="mini">已完成</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="耗时" align="center" prop="duration" width="180"/>
      <el-table-column label="当前节点" align="center" prop="taskName"/>
      <el-table-column label="办理人" align="center">
        <template slot-scope="scope">
          <label v-if="scope.row.assigneeName">{{scope.row.assigneeName}}</label>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button @click="handleFlowRecord(scope.row)" type="text" size="small">详情</el-button>
          <el-button @click="handlegenerateWordListDrawer(scope.row)" type="text" size="small" v-if="scope.row.finishTime">签名文件</el-button>
          <el-button @click="handleEditDept(scope.row)" type="text" size="small" v-if="scope.row.finishTime">修改课题组</el-button>
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

    <!-- 修改课题组（高危提示） -->
    <el-dialog title="修改课题组（高危操作）" :visible.sync="editDeptDialogVisible" width="500px" append-to-body>
      <div style="color: #e6a23c; margin-bottom: 12px;">
        此操作会修改已完成流程的课题组/教研室，属于高危行为，请勿轻易修改。
      </div>
      <el-form :model="editDeptForm" label-width="90px">
        <el-form-item label="课题组" required>
          <treeselect v-model="editDeptForm.deptId" :options="deptOptions" :disable-branch-nodes="true" placeholder="请选择课题组" />
        </el-form-item>
        <el-form-item label="教研室" required>
          <el-select v-model="editDeptForm.officeId" placeholder="请选择教研室" style="width: 100%">
            <el-option
              v-for="item in officeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDeptDialogVisible = false">取 消</el-button>
        <el-button type="warning" @click="confirmEditDept">确认修改</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import {
  flowRecord
} from "@/api/flowable/finished";
import { allProcessList, formGenerateWord, updateFinishedDept } from "@/api/flowable/process";
import {getTmpUrlList} from "@/api/system/file";
import { deptTreeSelect } from "@/api/system/user";
import { listAllOffices } from "@/api/exam/teachingResearchOffice";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "AllProcess",
  components: {
    Treeselect
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      drawerLoading: false,
      fileList: [],
      //生成的word列表
      generateWordListDrawer: false,
      //
      selectRow: {},
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 所有流程列表数据
      allProcessList: [],
      // 课题组选项
      deptOptions: [],
      // 教研室选项
      officeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        procDefName: null,
        deptId: null,
        officeId: null,
        deployTime: null,
        finished: null,
        templateStatus: null
      },
      // 修改课题组弹窗
      editDeptDialogVisible: false,
      editDeptForm: {
        procInsId: '',
        deptId: null,
        deptName: '',
        officeId: null,
        officeName: ''
      }
    };
  },
  created() {
    this.getList();
    this.getUserDeptList();
    this.getAllOffices();
  },
  methods: {
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
    generateWordListDrawerClose(){
     this.generateWordListDrawer = false;
    },
    /** 获取课题组列表 */
    getUserDeptList(){
      deptTreeSelect().then(res=>{
        this.deptOptions = res.data;
      })
    },
    /** 获取所有教研室 */
    getAllOffices(){
      // 获取所有教研室（无权限，无分页）
      listAllOffices().then(res=>{
        this.officeOptions = (res.data || res.rows || []).map(it=>({ id: it.id, name: it.name }))
      })
    },
    /** 查询所有流程列表 */
    getList() {
      this.loading = true;
      allProcessList(this.queryParams).then(response => {
        this.allProcessList = response.data.records;
        this.total = response.data.total;
        this.loading = false;
      });
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
    /** 流程流转记录 */
    handleFlowRecord(row){
      this.$router.push({ path: '/flowable/task/myProcess/detail/index',
        query: {
          procInsId: row.procInsId,
          deployId: row.deployId,
          taskId: row.taskId
      }})
    },
    /** 修改已完成流程的课题组（高危） */
    handleEditDept(row) {
      if (!row.finishTime) {
        this.$message.warning('仅已完成流程可修改');
        return;
      }
      this.$confirm('该操作为高危行为，请勿轻易修改。是否继续？', '警告', {
        confirmButtonText: '继续',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.editDeptForm.procInsId = row.procInsId;
        this.editDeptForm.deptId = null;
        this.editDeptForm.officeId = null;
        this.editDeptDialogVisible = true;
      }).catch(() => {});
    },
    confirmEditDept() {
      if (!this.editDeptForm.deptId) {
        this.$message.warning('请选择课题组');
        return;
      }
      if (!this.editDeptForm.officeId) {
        this.$message.warning('请选择教研室');
        return;
      }
      // 获取名称
      const findDeptName = (options, deptId) => {
        for (const item of options) {
          if (item.id === deptId) return item.label;
          if (item.children && item.children.length) {
            const found = findDeptName(item.children, deptId);
            if (found) return found;
          }
        }
        return '';
      };
      const deptName = findDeptName(this.deptOptions, this.editDeptForm.deptId);
      const office = this.officeOptions.find(it => it.id === this.editDeptForm.officeId);
      const officeName = office ? office.name : '';

      const payload = {
        procInsId: this.editDeptForm.procInsId,
        deptId: this.editDeptForm.deptId,
        deptName,
        officeId: this.editDeptForm.officeId,
        officeName
      };
      updateFinishedDept(payload).then(res => {
        this.$modal.msgSuccess(res.msg || '修改成功');
        this.editDeptDialogVisible = false;
        this.getList();
      }).catch(() => {
        this.$modal.msgError('修改失败，请稍后重试');
      });
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

