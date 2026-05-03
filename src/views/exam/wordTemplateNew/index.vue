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
      <el-form-item label="模板名称" prop="templateName">
        <el-input
          v-model="queryParams.templateName"
          placeholder="请输入模板名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模板标识" prop="templateKey">
        <el-input
          v-model="queryParams.templateKey"
          placeholder="请输入模板标识"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程定义Key" prop="flowableKey">
        <el-select
          v-model="queryParams.flowableKey"
          placeholder="请选择流程定义"
          clearable
          filterable
          style="width: 200px"
          @change="handleQuery"
        >
          <el-option
            v-for="item in flowOptions"
            :key="item.flowKey"
            :label="item.name + ' (' + item.flowKey + ')'"
            :value="item.flowKey"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="版本" prop="version">
        <el-input
          v-model="queryParams.version"
          placeholder="请输入版本"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
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
      :data="templateList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" width="80" />
      <el-table-column label="模板名称" align="center" prop="templateName" />
      <el-table-column label="模板标识" align="center" prop="templateKey" />
      <el-table-column label="流程定义Key" align="center" prop="flowableKey" />
      <el-table-column label="行数" align="center" prop="rowCount" />
      <el-table-column label="列数" align="center" prop="columnCount" />
      <el-table-column label="版本" align="center" prop="version" />
      <el-table-column
        label="描述"
        align="center"
        prop="description"
        show-overflow-tooltip
      />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
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

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板标识" prop="templateKey">
          <el-input v-model="form.templateKey" placeholder="请输入模板唯一标识" />
        </el-form-item>
        <el-form-item label="流程定义Key" prop="flowableKey">
          <el-input v-model="form.flowableKey" disabled />
        </el-form-item>
        <el-form-item label="模板描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="模板文件" prop="fileUrl">
          <FileUploadV3
            :limit="fileLimit"
            ref="wordTemplate"
            uploadType="v1"
            @on-upload-complete="handleUploadComplete"
            :value="fileInfo"
          ></FileUploadV3>
        </el-form-item>
        <el-form-item label="行数" prop="rowCount">
          <el-input-number
            v-model="form.rowCount"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="列数" prop="columnCount">
          <el-input-number
            v-model="form.columnCount"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input v-model="form.version" placeholder="请输入版本号" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listTemplate,
  getTemplate,
  addTemplate,
  updateTemplate,
  delTemplate,
} from "@/api/exam/wordTemplateNew";
import { listDefinition } from "@/api/flowable/definition";
import FileUploadV3 from "@/views/components/FileUploadV3.vue";

export default {
  name: "WordTemplateNew",
  components: {
    FileUploadV3,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
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
      // 模板列表
      templateList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        templateName: null,
        templateKey: null,
        flowableKey: null,
        version: null,
      },
      // 表单参数
      form: {
        id: null,
        templateName: null,
        templateKey: null,
        flowableKey: null,
        description: null,
        rowCount: null,
        columnCount: null,
        version: "1.0",
        isValid: 0,
        ossKey: null,
        fileUrl: null,
      },
      // 上传文件信息
      fileInfo: null,
      fileLimit: 1,
      // 流程定义下拉数据
      flowOptions: [],
      // 表单校验
      rules: {
        templateName: [
          { required: true, message: "模板名称不能为空", trigger: "blur" },
        ],
        templateKey: [
          { required: true, message: "模板唯一标识不能为空", trigger: "blur" },
        ],
        flowableKey: [
          { required: true, message: "流程定义Key不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    // 从路由携带的 flowableKey 初始化查询条件
    const flowableKey = this.$route.query.flowableKey;
    if (flowableKey) {
      this.queryParams.flowableKey = flowableKey;
    }
    this.getFlowOptions();
    this.getList();
  },
  methods: {
    /** 查询流程定义下拉 */
    getFlowOptions() {
      const params = {
        pageNum: 1,
        pageSize: 999,
      };
      listDefinition(params).then((res) => {
        const records = res.data && res.data.records ? res.data.records : [];
        this.flowOptions = records.map((item) => ({
          flowKey: item.flowKey,
          name: item.name,
        }));
      });
    },
    // 上传完成回调
    handleUploadComplete(res) {
      this.form.ossKey = res.ossKey;
      this.form.fileUrl = res.url;
      this.fileInfo = {
        key: res.fileName,
        url: res.url,
      };
    },
    /** 查询模板列表 */
    getList() {
      this.loading = true;
      listTemplate(this.queryParams).then((response) => {
        this.templateList = response.rows;
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
        templateName: null,
        templateKey: null,
        flowableKey: null,
        description: null,
        rowCount: null,
        columnCount: null,
        version: "1.0",
        isValid: 0,
        ossKey: null,
        fileUrl: null,
      };
      // 清空已选文件，避免从编辑切换到新增时沿用旧文件
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
      // 要求：新增时 flowableKey 不可更改，且自动为当前查询条件
      if (!this.queryParams.flowableKey) {
        this.$modal.msgError("请先选择流程定义Key");
        return;
      }
      this.reset();
      this.form.flowableKey = this.queryParams.flowableKey;
      this.open = true;
      this.title = "新增模板";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getTemplate(id).then((response) => {
        this.form = response.data;
        if (response.data && response.data.fileUrl) {
          this.fileInfo = {
            key: response.data.templateName,
            url: response.data.fileUrl,
          };
        }
        this.open = true;
        this.title = "修改模板";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (!valid) {
          return;
        }
        if (this.form.id != null) {
          updateTemplate(this.form).then(() => {
            this.$modal.msgSuccess("修改成功");
            this.open = false;
            this.getList();
          });
        } else {
          addTemplate(this.form).then(() => {
            this.$modal.msgSuccess("新增成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除模板编号为"' + ids + '"的数据项？')
        .then(function () {
          return delTemplate(ids);
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
        "exam/wordTemplateNew/export",
        {
          ...this.queryParams,
        },
        `word_template_new_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>

