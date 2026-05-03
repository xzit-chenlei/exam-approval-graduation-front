<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>教研室管理</span>
      </div>

      <el-form :inline="true" size="small" :model="queryParams" class="mb8">
        <el-form-item label="名称">
          <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item style="float:right;">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" border>
        <el-table-column label="ID" prop="id" width="80" align="center"/>
        <el-table-column label="名称" prop="name"/>
        <el-table-column label="备注" prop="remark"/>
        <el-table-column label="创建时间" prop="createTime" width="180"/>
        <el-table-column label="操作" width="260" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleEdit(scope.row)">修改</el-button>
            <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
            <el-button type="text" size="mini" @click="openUserDrawer(scope.row)">用户管理</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />

      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="90px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入教研室名称" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible=false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </el-dialog>

      <el-drawer :title="currentOffice.name ? ('用户管理 · ' + currentOffice.name) : '用户管理'"
                 :visible.sync="userDrawerVisible"
                 size="60%"
                 custom-class="tro-drawer"
                 append-to-body>
        <div class="drawer-body">
          <div class="toolbar">
            <div class="toolbar-left">
              <el-tag type="info" size="small">共 {{ officeUsers.length }} 人</el-tag>
            </div>
            <div class="toolbar-right">
              <el-button type="primary" size="small" icon="el-icon-plus" @click="openAddUsers">添加用户</el-button>
              <el-button type="danger" size="small" icon="el-icon-delete" :disabled="selectedUserIds.length===0" @click="removeSelectedUsers">移除所选</el-button>
            </div>
          </div>
          <el-divider></el-divider>
          <el-table :data="officeUsers"
                    border
                    stripe
                    size="small"
                    class="user-table"
                    @selection-change="handleUserSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="userId" label="用户ID" width="100" align="center"/>
            <el-table-column prop="userName" label="用户名" min-width="140"/>
            <el-table-column prop="nickName" label="姓名" min-width="120"/>
            <el-table-column label="操作" width="120" align="center">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="removeUsers([scope.row.userId])">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-dialog title="添加用户" :visible.sync="userSelectDialogVisible" width="600px" append-to-body>
          <el-select v-model="selectUserIds" multiple filterable placeholder="请选择用户" style="width:100%">
            <el-option v-for="u in allUserOptions" :key="u.userId" :label="u.nickName + ' (' + u.userName + ')'" :value="u.userId"/>
          </el-select>
          <div slot="footer" class="dialog-footer">
            <el-button @click="userSelectDialogVisible=false">取 消</el-button>
            <el-button type="primary" @click="confirmAddUsers">确 定</el-button>
          </div>
        </el-dialog>
      </el-drawer>
    </el-card>
  </div>
</template>

<script>
import { listOffice, getOffice, addOffice, updateOffice, delOffice, listOfficeUsers, addOfficeUsers, removeOfficeUsers } from '@/api/exam/teachingResearchOffice'
import { listUser } from '@/api/system/user'

export default {
  name: 'TeachingResearchOffice',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      queryParams: { pageNum: 1, pageSize: 10, name: undefined },
      dialogVisible: false,
      dialogTitle: '新增教研室',
      form: { id: undefined, name: '', remark: '' },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      userDrawerVisible: false,
      currentOffice: {},
      officeUsers: [],
      selectedUserIds: [],
      userSelectDialogVisible: false,
      selectUserIds: [],
      allUserOptions: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listOffice(this.queryParams).then(res => {
        this.list = res.rows || res.data || []
        this.total = res.total || 0
      }).finally(()=>{ this.loading = false })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = { pageNum: 1, pageSize: 10, name: undefined }
      this.getList()
    },
    handleAdd() {
      this.dialogTitle = '新增教研室'
      this.form = { id: undefined, name: '', remark: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      getOffice(row.id).then(res => {
        const data = res.data || res
        this.form = { id: data.id, name: data.name, remark: data.remark }
        this.dialogTitle = '修改教研室'
        this.dialogVisible = true
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const api = this.form.id ? updateOffice : addOffice
        api(this.form).then(() => {
          this.$message.success('操作成功')
          this.dialogVisible = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该教研室吗？', '提示').then(()=>{
        delOffice(row.id).then(()=>{
          this.$message.success('删除成功')
          this.getList()
        })
      }).catch(()=>{})
    },
    openUserDrawer(row) {
      this.currentOffice = row
      this.userDrawerVisible = true
      this.fetchOfficeUsers()
    },
    fetchOfficeUsers() {
      listOfficeUsers(this.currentOffice.id).then(res => {
        this.officeUsers = res.rows || res.data || []
      })
    },
    handleUserSelectionChange(selection) {
      this.selectedUserIds = selection.map(s => s.userId)
    },
    openAddUsers() {
      this.userSelectDialogVisible = true
      // 拉取全部用户选项
      listUser({ pageNum: 1, pageSize: 1000 }).then(res => {
        const users = res.rows || []
        this.allUserOptions = users
        this.selectUserIds = []
      })
    },
    confirmAddUsers() {
      if (!this.selectUserIds.length) {
        this.$message.warning('请选择用户')
        return
      }
      addOfficeUsers(this.currentOffice.id, this.selectUserIds).then(()=>{
        this.$message.success('添加成功')
        this.userSelectDialogVisible = false
        this.fetchOfficeUsers()
      })
    },
    removeSelectedUsers() {
      if (!this.selectedUserIds.length) return
      this.removeUsers(this.selectedUserIds)
    },
    removeUsers(userIds) {
      removeOfficeUsers(this.currentOffice.id, userIds).then(()=>{
        this.$message.success('移除成功')
        this.fetchOfficeUsers()
      })
    }
  }
}
</script>

<style scoped>
.mb8 { margin-bottom: 8px; }
.tro-drawer ::v-deep(.el-drawer__header){
  margin-bottom: 0;
}
.tro-drawer ::v-deep(.el-drawer__body){
  padding: 0; /* 使用外边距控制留白，避免与内部组件冲突 */
}
.drawer-body{
  padding: 0;
}
.toolbar{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 16px 12px; /* 与边框的外边距 */
}
.user-table{
  margin: 0 16px 16px; /* 表格外边距，避免贴边 */
}
</style>
