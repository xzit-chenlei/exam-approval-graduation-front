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
      <el-form-item label="学号" prop="studentCode">
        <el-input
          v-model="queryParams.studentCode"
          placeholder="请输入学号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="学生姓名" prop="studentName">
        <el-input
          v-model="queryParams.studentName"
          placeholder="请输入学生姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="班级" prop="classId">
        <el-select
          v-model="queryParams.classId"
          placeholder="请选择班级"
          filterable
          @change="handleQuery"
          style="width: 200px"
        >
          <el-option
            v-for="item in classOptions"
            :key="item.id"
            :label="item.className"
            :value="item.id"
          />
        </el-select>
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
          v-hasPermi="['graduate:studentInfo:add']"
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
          v-hasPermi="['graduate:studentInfo:edit']"
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
          v-hasPermi="['graduate:studentInfo:remove']"
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
          v-hasPermi="['graduate:studentInfo:export']"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-upload2"
          size="mini"
          @click="openImport"
          v-hasPermi="['graduate:studentInfo:import']"
          >导入</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="studentInfoList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="学号"
        align="center"
        prop="studentCode"
        width="120"
      />
      <el-table-column
        label="学生姓名"
        align="center"
        prop="studentName"
        width="120"
      />
      <el-table-column
        label="班级名称"
        align="center"
        prop="className"
        width="160"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        show-overflow-tooltip
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="160"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['graduate:studentInfo:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['graduate:studentInfo:remove']"
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

    <!-- 添加或修改学生信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="学号" prop="studentCode">
          <el-input v-model="form.studentCode" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="学生姓名" prop="studentName">
          <el-input v-model="form.studentName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="班级" prop="classId">
          <el-select
            v-model="form.classId"
            placeholder="请选择班级"
            clearable
            filterable
            @change="onClassChange"
            style="width: 260px"
          >
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="item.className"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 学生导入对话框 -->
    <el-dialog
      :title="upload.title"
      :visible.sync="upload.open"
      width="420px"
      append-to-body
    >
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :action="upload.url + '?classId=' + (queryParams.classId || '')"
        :disabled="upload.isUploading"
        :on-progress="(e) => (upload.isUploading = true)"
        :on-success="handleImportSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link
            type="primary"
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            @click="downloadTemplate"
            >下载模板</el-link
          >
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitImport">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listStudentInfo,
  getStudentInfo,
  delStudentInfo,
  addStudentInfo,
  updateStudentInfo,
  exportStudentInfo,
} from "@/api/graduate/studentInfo";
import { listClass } from "@/api/graduate/class";

export default {
  name: "GraduateStudentInfo",
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
      // 学生信息表格数据
      studentInfoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        studentCode: null,
        studentName: null,
        classId: null,
      },
      // 表单参数
      form: {},
      // 班级下拉
      classOptions: [],
      // 导入
      upload: {
        open: false,
        title: "学生导入",
        isUploading: false,
        url: process.env.VUE_APP_BASE_API + "/graduate/studentInfo/importData",
      },
      // 表单校验
      rules: {
        studentCode: [
          { required: true, message: "学号不能为空", trigger: "blur" },
        ],
        studentName: [
          { required: true, message: "学生姓名不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.applyRouteFilter();
    this.fetchClassOptions();
    this.getList();
  },
  watch: {
    "$route.query.classId": function () {
      this.onRouteChange();
    },
  },
  methods: {
    // 路由携带的班级筛选
    applyRouteFilter() {
      const { classId } = this.$route.query || {};
      this.queryParams.classId = classId ? Number(classId) : null;
    },
    // 提交导入
    submitImport() {
      this.$refs.upload.submit();
    },
    // 导入成功
    handleImportSuccess(response) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$modal.msgSuccess(
        response && response.msg ? response.msg : "导入成功"
      );
      this.getList();
    },
    // 下载模板
    downloadTemplate() {
      this.download(
        "/graduate/studentInfo/importTemplate",
        {},
        `graduate_student_info_template_${new Date().getTime()}.xlsx`
      );
    },
    // 打开导入对话框
    openImport() {
      if (!this.queryParams.classId) {
        this.$modal.msgWarning("请先在搜索条件选择班级，再执行导入");
        return;
      }
      this.upload.open = true;
    },
    /** 查询学生信息列表 */
    getList() {
      this.loading = true;
      listStudentInfo(this.queryParams).then((response) => {
        const rows = Array.isArray(response.rows) ? response.rows.slice() : [];
        rows.sort((a, b) => {
          const ta = a && a.createTime ? new Date(a.createTime).getTime() : 0;
          const tb = b && b.createTime ? new Date(b.createTime).getTime() : 0;
          if (tb !== ta) return tb - ta;
          const ia = typeof a.id === "number" ? a.id : 0;
          const ib = typeof b.id === "number" ? b.id : 0;
          return ib - ia;
        });
        this.studentInfoList = rows;
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
        studentCode: null,
        studentName: null,
        classId: null,
        className: null,
        remark: null,
      };
      this.resetForm("form");
    },
    // 获取班级下拉
    fetchClassOptions() {
      listClass({ pageNum: 1, pageSize: 9999 }).then((res) => {
        this.classOptions = res.rows || [];
      });
    },
    // 班级选择联动填充名称
    onClassChange(val) {
      const found = this.classOptions.find((it) => it.id === val);
      this.form.className = found ? found.className : null;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 监听路由变化（例如从班级页面跳转过来）
    onRouteChange() {
      this.applyRouteFilter();
      this.handleQuery();
    },
    /** 重置按钮操作 */
    resetQuery() {
      const keepClassId = this.queryParams.classId;
      this.resetForm("queryForm");
      this.queryParams.classId = keepClassId;
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
      this.open = true;
      this.title = "添加学生信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getStudentInfo(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改学生信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateStudentInfo(this.form).then(() => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addStudentInfo(this.form).then(() => {
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
        .confirm('是否确认删除学生信息编号为"' + ids + '"的数据项？')
        .then(function () {
          return delStudentInfo(ids);
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
        "/graduate/studentInfo/export",
        {
          ...this.queryParams,
        },
        `graduate_student_info_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
