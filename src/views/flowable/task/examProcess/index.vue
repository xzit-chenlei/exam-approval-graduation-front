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
        <el-date-picker
          clearable
          size="small"
          v-model="queryParams.deployTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择时间"
        />
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
      <el-table-column label="流程编号" align="center" prop="procInsId" :show-overflow-tooltip="true" />
      <el-table-column label="流程名称" align="center" prop="procDefName" :show-overflow-tooltip="true" />
      <el-table-column label="入学年级-专业-课程" align="center" prop="exAcademicYearMajorCourse" width="220" :show-overflow-tooltip="true" />
      <el-table-column label="教研室" align="center" prop="officeName" width="180px" />
      <el-table-column label="提交时间" align="center" prop="createTime" width="180" />
      <el-table-column label="流程状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'draft'" type="info" size="mini">暂存</el-tag>
          <el-tag v-else-if="scope.row.finishTime == null" size="mini">进行中</el-tag>
          <el-tag v-else type="success" size="mini">已完成</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="耗时" align="center" prop="duration" width="180" />
      <el-table-column label="当前节点" align="center" prop="taskName" />
      <el-table-column label="办理人" align="center">
        <template slot-scope="scope">
          <label v-if="scope.row.assigneeName">{{ scope.row.assigneeName }}</label>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 'draft'" @click="handleContinueEdit(scope.row)" type="text" size="small">继续编辑</el-button>
          <el-button @click="handleFlowRecord(scope.row)" type="text" size="small">详情</el-button>
          <el-button @click="handleDelete(scope.row)" type="text" size="small" v-hasPermi="['system:deployment:remove']">删除</el-button>
          <el-button @click="createDox(scope.row)" type="text" size="small" v-if="scope.row.finishTime">签名文件</el-button>
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
      <el-table v-loading="processLoading" fit :data="definitionList" border>
        <el-table-column label="流程名称" align="center" prop="name" />
        <el-table-column label="流程版本" align="center">
          <template slot-scope="scope">
            <el-tag size="medium">v{{ scope.row.version }}</el-tag>
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
} from '@/api/flowable/finished'
import { myProcessList, stopProcess } from '@/api/flowable/process'
import { listDefinition } from '@/api/flowable/definition'

export default {
  name: 'ExamProcessList',
  data() {
    return {
      loading: true,
      processLoading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      processTotal: 0,
      myProcessList: [],
      title: '',
      open: false,
      definitionList: [],
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
        formMode: 'custom'
      },
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
      form: {},
      rules: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      myProcessList(this.queryParams).then(response => {
        const records = (response.data && response.data.records) ? response.data.records : []
        // 前端兜底：只显示自定义表单流程
        this.myProcessList = records.filter(r => r.formMode === 'custom' || r.examFormId || r.examFormData)
        this.total = response.data.total
        this.loading = false
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
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
      }
      this.resetForm('form')
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleProcessQuery() {
      this.queryProcessParams.pageNum = 1
      this.listDefinition()
    },
    resetProcessQuery() {
      this.resetForm('queryProcessForm')
      this.handleProcessQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.procInsId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.open = true
      this.title = '发起流程'
      this.listDefinition()
    },
    listDefinition() {
      listDefinition(this.queryProcessParams).then(response => {
        this.definitionList = response.data.records
        this.processTotal = response.data.total
        this.processLoading = false
      })
    },
    handleStartProcess(row) {
      this.$router.push({
        path: '/flowable/task/examProcess/send/index',
        query: {
          deployId: row.deploymentId,
          procDefId: row.id
        }
      })
    },
    handleStop(row) {
      const params = { instanceId: row.procInsId }
      stopProcess(params).then(res => {
        this.$modal.msgSuccess(res.msg)
        this.getList()
      })
    },
    handleContinueEdit(row) {
      this.$router.push({
        path: '/flowable/task/examProcess/send/index',
        query: {
          deployId: row.deployId,
          procDefId: row.procDefId,
          procInsId: row.procInsId,
          taskId: row.taskId,
          isDraft: true
        }
      })
    },
    handleFlowRecord(row) {
      this.$router.push({
        path: '/flowable/task/examProcess/detail/index',
        query: {
          procInsId: row.procInsId,
          deployId: row.deployId,
          taskId: row.taskId
        }
      })
    },
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getDeployment(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改流程定义'
      })
    },
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateDeployment(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addDeployment(this.form).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    handleDelete(row) {
      const ids = row.procInsId || this.ids
      this.$confirm('是否确认删除流程定义编号为"' + ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => delDeployment(ids)).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      })
    },
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有流程定义数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => exportDeployment(queryParams)).then(response => {
        this.download(response.msg)
      })
    },
    /** 获取文件名称 */
    getFileName(name) {
      // 如果是url那么取最后的名字 如果不是直接返回
      if (name.lastIndexOf('/') > -1) {
        return name.slice(name.lastIndexOf('/') + 1)
      } else {
        return name
      }
    },
    /** 生成Word文件（直接触发浏览器下载） */
    createDox(row) {
      const procInsId = row.procInsId
      if (!procInsId) {
        this.$modal.msgError('流程实例ID为空，无法生成Word文件')
        return
      }
      const base = process.env.VUE_APP_BASE_API || ''
      const url = `${base}/flowable/task/formGenerateWordNew?procInsId=${encodeURIComponent(procInsId)}`
      // 直接打开新窗口/标签，由后端返回的文件流触发下载框
      window.open(url, '_blank')
    }
  }
}
</script>

<style scoped>
.fileUpload {
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









