<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="word模板类型" prop="wordTemplateType">
        <el-select
          v-model="queryParams.wordTemplateType"
          placeholder="请选择word模板类型"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="dict in dict.type.exam_word_template_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="word模板名称" prop="wordTemplateName">
        <el-input
          v-model="queryParams.wordTemplateName"
          placeholder="请输入word模板名称"
          clearable
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
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
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
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="infoList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="表单主键" align="center" prop="formId" />
      <el-table-column label="表单名称" align="center" prop="formName" />
      <el-table-column label="课题组" align="center" prop="deptName" />
      <el-table-column
        label="word模板名称"
        align="center"
        prop="wordTemplateName"
      />
      <el-table-column
        label="word模板类型"
        align="center"
        prop="wordTemplateType"
      >
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.exam_word_template_type"
            :value="scope.row.wordTemplateType"
          />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-s-tools"
            @click="handleSignInfo(scope.row)"
            >签名信息</el-button
          >
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

    <!-- 添加或修改word模板信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="表单主键" prop="formId">
          <el-input
            v-model="form.formId"
            placeholder="请输入表单主键"
            disabled
          />
        </el-form-item>
        <el-form-item label="表单名称" prop="formName">
          <el-input
            v-model="form.formName"
            placeholder="请输入表单名称"
            disabled
          />
        </el-form-item>
        <el-form-item label="归属部门" prop="deptId">
          <treeselect
            v-model="form.deptId"
            :options="deptOptions"
            :show-count="true"
            placeholder="请选择归属课题组"
            @input="handleDeptChange"
          />
        </el-form-item>
        <el-form-item label="word模板类型" prop="wordTemplateType">
          <el-select
            v-model="form.wordTemplateType"
            placeholder="请选择word模板类型"
          >
            <el-option
              v-for="dict in dict.type.exam_word_template_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="word模板" prop="wordTemplateName">
          <FileUploadV3
            :limit="fileLimit"
            ref="wordTemplate"
            uploadType="v1"
            @on-upload-complete="handleUploadComplete"
            :value="fileInfo"
          ></FileUploadV3>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-drawer
      title="word签名信息"
      :visible.sync="drawer"
      size="820px"
      append-to-body
    >
      <div style="height: 550px">
        <div class="invoice-container">
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                icon="el-icon-plus"
                type="danger"
                @click="handleUpdateSign"
                size="mini"
                >添加</el-button
              >
            </el-col>
          </el-row>
        </div>

        <div style="flex: 1">
          <el-table
            ref="payTable"
            v-loading="loading"
            max-height="400"
            :data="singInfoList"
            style="width: 100%"
          >
            <el-table-column
              label="word模板主键"
              align="center"
              prop="formId"
            />
            <el-table-column
              label="word模板名称"
              align="center"
              prop="formName"
            />
            <el-table-column
              label="签名类型"
              align="center"
              prop="examElectronicType"
            >
              <template slot-scope="scope">
                <dict-tag
                  :options="dict.type.exam_electronic_type"
                  :value="scope.row.examElectronicType"
                />
              </template>
            </el-table-column>
            <el-table-column label="签名节点" align="center" prop="nodeName" />
            <el-table-column
              label="签名位置"
              align="center"
              prop="signatureLocation"
            />
            <el-table-column
              label="操作"
              align="center"
              class-name="small-padding fixed-width"
              fixed="left"
            >
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleUpdateSign(scope.row, 'edit')"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleDeleteSign(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 40px">
            <pagination
              :total="signTotal"
              :page.sync="signQueryParams.pageNum"
              :limit.sync="signQueryParams.pageSize"
              @pagination="getSignList"
            />
          </div>
        </div>

        <el-dialog
          :title="addType === 'add' ? '新增' : '修改'"
          :visible.sync="showAddDialog"
          width="60%"
          append-to-body
        >
          <div>
            <el-row>
              <el-col :span="24">
                <el-form
                  :model="addForm"
                  :rules="addFormRules"
                  label-width="128px"
                >
                  <el-form-item label="word模板主键" prop="formId">
                    <el-input
                      v-model="addForm.formId"
                      placeholder="请输入word模板主键"
                      disabled
                    />
                  </el-form-item>
                  <el-form-item label="word模板名称" prop="formName">
                    <el-input
                      v-model="addForm.formName"
                      placeholder="请输入word模板名称"
                      disabled
                    />
                  </el-form-item>
                  <el-form-item label="签名类型" prop="examElectronicType">
                    <el-select
                      v-model="addForm.examElectronicType"
                      placeholder="请选择签章类型"
                      filterable
                    >
                      <el-option
                        v-for="dict in dict.type.exam_electronic_type"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="签名节点" prop="flowId">
                    <el-cascader
                      v-model="flowNodeValue"
                      :options="flowNodeOption"
                      :props="props"
                      @change="handleflowNode"
                      style="width: 100%;"
                    ></el-cascader>
                  </el-form-item>
                  <el-form-item label="签名位置" prop="signatureLocation">
                    <el-input
                      v-model="addForm.signatureLocation"
                      placeholder="请输入签名位置"
                    />
                  </el-form-item>
                  <el-form-item label="备注" prop="remark">
                    <el-input
                      v-model="addForm.remark"
                      placeholder="请输入备注"
                    />
                  </el-form-item>
                </el-form>
              </el-col>
            </el-row>
          </div>

          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="addSignInfo">确 定</el-button>
            <el-button @click="closeDialog">取 消</el-button>
          </div>
        </el-dialog>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  listInfo,
  getInfo,
  delInfo,
  addInfo,
  updateInfo,
} from "@/api/flowable/wordTemplateInfo";
import {
  listInfoSign,
  getInfoSign,
  delInfoSign,
  addInfoSign,
  updateInfoSign,
} from "@/api/flowable/signInfo";
import { flowNodeList } from "@/api/flowable/definition";
import { deptTreeSelect } from "@/api/system/user";
import { listUserInfo } from "@/api/system/user.js";
import FileUploadV3 from "@/views/components/FileUploadV3.vue";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Info",
  dicts: ["exam_word_template_type", "exam_electronic_type"],
  components: {
    FileUploadV3,
    Treeselect,
  },
  data() {
    return {
      flowNodeValue:null,
      flowNodeOption: {},
      props: {
        value: "id",
        label: "name",
        children: "nodeInfoDtoList",
      },
      //文件传输限制
      fileLimit: 1,
      // 部门树选项
      deptOptions: undefined,
      // 遮罩层
      loading: true,
      addType: "add",
      showAddDialog: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      drawer: false,
      fileInfo: null,
      //上传路径
      uploadUrl: process.env.VUE_APP_BASE_API + "/common/v3/upload",
      // 非多个禁用
      multiple: true,
      //上传模板参数
      wordTemplateParameter: {},
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      signTotal: 0,
      // word模板信息表格数据
      infoList: [],
      //签名信息
      singInfoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        formId: null,
        formName: null,
        stroreInfoId: null,
        wordTemplateName: null,
        wordTemplateType: null,
        deptId: null,
        correspondingFileLabel: null,
        correspondingFileName: null,
        remark: null,
        isValid: null,
      },
      signQueryParams: {
        pageNum: 1,
        pageSize: 10,
        formId: null,
        formName: null,
        signerId: null,
        signerName: null,
        signatureLocation: null,
      },
      selectRow: {},
      userList: [],
      // 表单参数
      form: {},
      //签名表单参数
      addForm: {},
      // 表单校验
      rules: {},
      addFormRules: {},
    };
  },
  created() {
    this.queryParams.formId = this.$route.query && this.$route.query.formId;
    this.queryParams.formName = this.$route.query && this.$route.query.formName;
    this.getList();
    this.getNodeList();
    this.getDeptTree();
  },
  methods: {
    getNodeList() {
      flowNodeList().then((res) => {
        this.flowNodeOption = res.data;
      });
    },
    handleflowNode(e) {
      this.addForm.flowId = e[0];
      this.addForm.nodeId = e[1];
    },
    handleDeptChange(deptId) {
      // 递归查找节点并构建路径
      const findNodePath = (options, targetId, path = []) => {
        for (const node of options) {
          const currentPath = [...path, node.label];
          if (node.id === targetId) {
            return currentPath.join(" > ");
          }
          if (node.children) {
            const found = findNodePath(node.children, targetId, currentPath);
            if (found) return found;
          }
        }
        return null;
      };

      this.form.deptName = findNodePath(this.deptOptions, deptId);
      console.log(this.form.deptName);
    },
    /** 查询部门下拉树结构 */
    getDeptTree() {
      deptTreeSelect().then((response) => {
        this.deptOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptIds = [data.id];
      this.handleQuery();
    },
    getUserName(userId) {
      const user = this.userList.find((option) => option.userId === userId);
      return user ? user.nickName : null;
    },
    /** 获取用户列表 */
    getUserList() {
      listUserInfo().then((res) => {
        this.userList = res.data;
      });
    },
    addSignInfo() {
      const flow = this.flowNodeOption.find(
        (option) => option.id === this.addForm.flowId
      );
      this.addForm.flowName = flow.name;
      this.addForm.nodeName = flow.nodeInfoDtoList.find(
        (option) => option.id === this.addForm.nodeId
      ).name;
      addInfoSign({
        ...this.addForm,
      }).then((response) => {
        this.$message({
          message: "操作成功",
          type: "success",
        });
        this.getSignList();
        this.closeDialog();
      });
    },
    closeDialog() {
      this.showAddDialog = false;
      this.addType = "add";
      this.addForm = {};
    },
    /** 查询签名位置信息列表 */
    getSignList() {
      this.loading = true;
      listInfoSign(this.signQueryParams).then((response) => {
        console.log(response.rows);
        this.singInfoList = response.rows;
        this.signTotal = response.total;
        this.loading = false;
      });
    },
    handleUpdateSign(row, addType) {
      if (addType === "edit") {
        this.addType = "edit";
        this.flowNodeValue = [row.flowId,row.nodeId];
        this.addForm = row;
      } else {
        this.flowNodeValue = null;
        this.addForm = {
          id: null,
          formId: this.selectRow.id,
          formName: this.selectRow.wordTemplateName,
          examElectronicType: null,
          flowId: null,
          flowName: null,
          nodeId:null,
          nodeName:null,
          signatureLocation: null,
          remark: null,
        };
      }

      this.showAddDialog = true;
    },
    handleDeleteSign(row) {
      const ids = row.id;
      this.$modal
        .confirm('是否确认删除签名位置信息编号为"' + ids + '"的数据项？')
        .then(function () {
          return delInfoSign(ids);
        })
        .then(() => {
          this.getSignList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 模板签名信息 */
    handleSignInfo(row) {
      this.signQueryParams.formId = row.id;
      this.selectRow = row;
      this.drawer = true;
      this.getSignList();
      this.getUserList();
    },
    handleUploadComplete(res) {
      this.form.ossKey = res.ossKey;
      this.form.wordTemplateName = res.fileName;
      this.form.fileUrl = res.url;
      console.log(this.form);
      this.fileInfo = {
        key: res.fileName,
        url: res.url,
      };
    },
    /** 查询word模板信息列表 */
    getList() {
      this.loading = true;
      listInfo(this.queryParams).then((response) => {
        this.infoList = response.rows;
        this.total = response.total;
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
        formId: null,
        formName: null,
        stroreInfoId: null,
        wordTemplateName: null,
        wordTemplateType: null,
        correspondingFileLabel: null,
        correspondingFileName: null,
        ossKey: null,
        fileUrl: null,
        remark: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        isValid: null,
      };
      this.fileInfo = null;
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.form.formId = this.queryParams.formId;
      this.form.formName = this.queryParams.formName;
      this.open = true;
      this.title = "添加word模板信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getInfo(id).then((response) => {
        console.log(response);
        this.form = response.data;
        this.fileInfo = {
          key: response.data.wordTemplateName,
          url: response.data.fileUrl,
        };
        this.open = true;
        this.title = "修改word模板信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateInfo(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addInfo(this.form).then((response) => {
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
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除word模板信息编号为"' + ids + '"的数据项？')
        .then(function () {
          return delInfo(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "ruoyi/info/export",
        {
          ...this.queryParams,
        },
        `info_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>

<style scoped>
.invoice-container {
  height: 40px;
  padding-left: 16px;
}
</style>

