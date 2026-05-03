<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="所属专业ID" prop="majorId">
        <el-input
          v-model="queryParams.majorId"
          placeholder="请输入所属专业ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属课程ID" prop="courseId">
        <el-input
          v-model="queryParams.courseId"
          placeholder="请输入所属课程ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="实验名称" prop="labName">
        <el-input
          v-model="queryParams.labName"
          placeholder="请输入实验名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="实验编号" prop="labCode">
        <el-input
          v-model="queryParams.labCode"
          placeholder="请输入实验编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="实验截止日期" prop="deadline">
        <el-date-picker clearable
          v-model="queryParams.deadline"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择实验截止日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="实验操作总分" prop="opsScore">
        <el-input
          v-model="queryParams.opsScore"
          placeholder="请输入实验操作总分"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="实验报告总分" prop="rptScore">
        <el-input
          v-model="queryParams.rptScore"
          placeholder="请输入实验报告总分"
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
      <el-form-item label="显示排序" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入显示排序"
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
          v-hasPermi="['ruoyi:lab:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ruoyi:lab:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ruoyi:lab:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['ruoyi:lab:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="labList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="所属专业ID" align="center" prop="majorId" />
      <el-table-column label="所属课程ID" align="center" prop="courseId" />
      <el-table-column label="实验名称" align="center" prop="labName" />
      <el-table-column label="实验编号" align="center" prop="labCode" />
      <el-table-column label="实验截止日期" align="center" prop="deadline" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.deadline, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实验操作总分" align="center" prop="opsScore" />
      <el-table-column label="实验报告总分" align="center" prop="rptScore" />
      <el-table-column label="年级" align="center" prop="grade" />
      <el-table-column label="学期" align="center" prop="semester" />
      <el-table-column label="显示排序" align="center" prop="orderNo" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="逻辑删除" align="center" prop="isValid" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['ruoyi:lab:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ruoyi:lab:remove']"
          >删除</el-button>
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

    <!-- 添加或修改毕业达成度实验成绩信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属专业ID" prop="majorId">
          <el-input v-model="form.majorId" placeholder="请输入所属专业ID" />
        </el-form-item>
        <el-form-item label="所属课程ID" prop="courseId">
          <el-input v-model="form.courseId" placeholder="请输入所属课程ID" />
        </el-form-item>
        <el-form-item label="实验名称" prop="labName">
          <el-input v-model="form.labName" placeholder="请输入实验名称" />
        </el-form-item>
        <el-form-item label="实验编号" prop="labCode">
          <el-input v-model="form.labCode" placeholder="请输入实验编号" />
        </el-form-item>
        <el-form-item label="实验截止日期" prop="deadline">
          <el-date-picker clearable
            v-model="form.deadline"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择实验截止日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实验操作总分" prop="opsScore">
          <el-input v-model="form.opsScore" placeholder="请输入实验操作总分" />
        </el-form-item>
        <el-form-item label="实验报告总分" prop="rptScore">
          <el-input v-model="form.rptScore" placeholder="请输入实验报告总分" />
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-input v-model="form.semester" placeholder="请输入学期" />
        </el-form-item>
        <el-form-item label="显示排序" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入显示排序" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import { listLab, getLab, delLab, addLab, updateLab } from "@/api/graduate/lab";

export default {
  name: "Lab",
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
      // 毕业达成度实验成绩信息表格数据
      labList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        majorId: null,
        courseId: null,
        labName: null,
        labCode: null,
        deadline: null,
        opsScore: null,
        rptScore: null,
        grade: null,
        semester: null,
        orderNo: null,
        isValid: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        majorId: [
          { required: true, message: "所属专业ID不能为空", trigger: "blur" }
        ],
        labName: [
          { required: true, message: "实验名称不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询毕业达成度实验成绩信息列表 */
    getList() {
      this.loading = true;
      listLab(this.queryParams).then(response => {
        this.labList = response.rows;
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
        majorId: null,
        courseId: null,
        labName: null,
        labCode: null,
        deadline: null,
        opsScore: null,
        rptScore: null,
        grade: null,
        semester: null,
        orderNo: null,
        remark: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
        isValid: null
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加毕业达成度实验成绩信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getLab(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改毕业达成度实验成绩信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateLab(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addLab(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除毕业达成度实验成绩信息编号为"' + ids + '"的数据项？').then(function() {
        return delLab(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('ruoyi/lab/export', {
        ...this.queryParams
      }, `lab_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
