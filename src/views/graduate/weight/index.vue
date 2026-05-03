<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="所属课程ID" prop="courseId">
        <el-input
          v-model="queryParams.courseId"
          placeholder="请输入所属课程ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属试卷ID" prop="paperId">
        <el-input
          v-model="queryParams.paperId"
          placeholder="请输入所属试卷ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="${comment}" prop="finalW">
        <el-input
          v-model="queryParams.finalW"
          placeholder="请输入${comment}"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="${comment}" prop="perfW">
        <el-input
          v-model="queryParams.perfW"
          placeholder="请输入${comment}"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="${comment}" prop="labW">
        <el-input
          v-model="queryParams.labW"
          placeholder="请输入${comment}"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="学期" prop="semester">
        <el-input
          v-model="queryParams.semester"
          placeholder="请输入学期"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="逻辑删除" prop="isValid">
        <el-input
          v-model="queryParams.isValid"
          placeholder="请输入逻辑删除"
          clearable
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
          v-hasPermi="['ruoyi:weight:add']"
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
          v-hasPermi="['ruoyi:weight:edit']"
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
          v-hasPermi="['ruoyi:weight:remove']"
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
          v-hasPermi="['ruoyi:weight:export']"
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
      :data="weightList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="所属课程ID" align="center" prop="courseId" />
      <el-table-column label="所属试卷ID" align="center" prop="paperId" />
      <el-table-column label="${comment}" align="center" prop="finalW" />
      <el-table-column label="${comment}" align="center" prop="perfW" />
      <el-table-column label="${comment}" align="center" prop="labW" />
      <el-table-column label="年级" align="center" prop="grade" />
      <el-table-column label="学期" align="center" prop="semester" />
      <el-table-column label="逻辑删除" align="center" prop="isValid" />
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
            v-hasPermi="['ruoyi:weight:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ruoyi:weight:remove']"
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

    <!-- 添加或修改毕业达成度各课程三类考试权重对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属课程ID" prop="courseId">
          <el-input v-model="form.courseId" placeholder="请输入所属课程ID" />
        </el-form-item>
        <el-form-item label="所属试卷ID" prop="paperId">
          <el-input v-model="form.paperId" placeholder="请输入所属试卷ID" />
        </el-form-item>
        <el-form-item label="${comment}" prop="finalW">
          <el-input v-model="form.finalW" placeholder="请输入${comment}" />
        </el-form-item>
        <el-form-item label="${comment}" prop="perfW">
          <el-input v-model="form.perfW" placeholder="请输入${comment}" />
        </el-form-item>
        <el-form-item label="${comment}" prop="labW">
          <el-input v-model="form.labW" placeholder="请输入${comment}" />
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-input v-model="form.semester" placeholder="请输入学期" />
        </el-form-item>
        <el-form-item label="逻辑删除" prop="isValid">
          <el-input v-model="form.isValid" placeholder="请输入逻辑删除" />
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
  listWeight,
  getWeight,
  delWeight,
  addWeight,
  updateWeight,
} from "@/api/graduate/weight";

export default {
  name: "Weight",
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
      // 毕业达成度各课程三类考试权重表格数据
      weightList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        courseId: null,
        paperId: null,
        finalW: null,
        perfW: null,
        labW: null,
        grade: null,
        semester: null,
        isValid: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        paperId: [
          { required: true, message: "所属试卷ID不能为空", trigger: "blur" },
        ],
        finalW: [
          { required: true, message: "$comment不能为空", trigger: "blur" },
        ],
        perfW: [
          { required: true, message: "$comment不能为空", trigger: "blur" },
        ],
        labW: [
          { required: true, message: "$comment不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询毕业达成度各课程三类考试权重列表 */
    getList() {
      this.loading = true;
      listWeight(this.queryParams).then((response) => {
        this.weightList = response.rows;
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
        courseId: null,
        paperId: null,
        finalW: null,
        perfW: null,
        labW: null,
        grade: null,
        semester: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
        isValid: null,
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
      this.title = "添加毕业达成度各课程三类考试权重";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getWeight(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改毕业达成度各课程三类考试权重";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateWeight(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addWeight(this.form).then((response) => {
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
        .confirm(
          '是否确认删除毕业达成度各课程三类考试权重编号为"' +
            ids +
            '"的数据项？'
        )
        .then(function () {
          return delWeight(ids);
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
        "ruoyi/weight/export",
        {
          ...this.queryParams,
        },
        `weight_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
