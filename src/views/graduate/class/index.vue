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
      <el-form-item label="专业" prop="graduateMajorId">
        <el-select
          v-model="queryParams.graduateMajorId"
          placeholder="请选择专业"
          clearable
          filterable
          @change="handleQuery"
          style="width: 240px"
        >
          <el-option
            v-for="m in majors"
            :key="m.id"
            :label="m.name"
            :value="m.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="班级名称" prop="className">
        <el-input
          v-model="queryParams.className"
          placeholder="请输入班级名称"
          clearable
          @keyup.enter.native="handleQuery"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="入学年级" prop="enteringClass">
        <el-date-picker
          v-model="queryParams.enteringClass"
          type="year"
          value-format="yyyy"
          placeholder="选择入学年份"
          style="width: 160px"
          @change="handleQuery"
          clearable
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
          v-hasPermi="['graduate:class:add']"
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
          v-hasPermi="['graduate:class:edit']"
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
          v-hasPermi="['graduate:class:remove']"
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
          v-hasPermi="['graduate:class:export']"
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
      :data="classList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="班级名称" align="center" prop="className">
        <template slot-scope="scope">
          <router-link
            class="table-link"
            :to="'/graduate/studentInfo?classId=' + scope.row.id"
            >{{ scope.row.className }}</router-link
          >
        </template>
      </el-table-column>
      <el-table-column label="专业名称" align="center" prop="graduateMajorName">
        <template slot-scope="scope">
          {{
            scope.row.graduateMajorName ||
            majorNameById(scope.row.graduateMajorId) ||
            "-"
          }}
        </template>
      </el-table-column>
      <el-table-column label="入学年级" align="center" prop="enteringClass" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-user"
            @click="goStudents(scope.row)"
          >学生</el-button> -->
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['graduate:class:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['graduate:class:remove']"
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
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="form.className" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="专业" prop="graduateMajorId">
          <el-select
            v-model="form.graduateMajorId"
            placeholder="请选择专业"
            filterable
            style="width: 100%"
            @change="onMajorChange"
          >
            <el-option
              v-for="m in majors"
              :key="m.id"
              :label="m.name"
              :value="m.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入学年级" prop="enteringClass">
          <el-date-picker
            v-model="form.enteringClass"
            type="year"
            value-format="yyyy"
            placeholder="选择入学年份"
            style="width: 100%"
            clearable
          />
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
  </div>
</template>

<script>
import {
  listClass,
  getClass,
  delClass,
  addClass,
  updateClass,
  exportClass,
} from "@/api/graduate/class";
import { listMajor } from "@/api/graduate/major";

export default {
  name: "GraduateClass",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      classList: [],
      title: "",
      open: false,
      majors: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        graduateMajorId: null,
        className: null,
        enteringClass: null,
      },
      form: {},
      rules: {
        className: [
          { required: true, message: "请输入班级名称", trigger: "blur" },
        ],
        graduateMajorId: [
          { required: true, message: "请选择专业", trigger: "change" },
        ],
        enteringClass: [
          { required: true, message: "请选择入学年份", trigger: "change" },
        ],
      },
    };
  },
  created() {
    this.initMajors().then(() => this.getList());
  },
  methods: {
    majorNameById(id) {
      const m = (this.majors || []).find((x) => x.id === id);
      return m ? m.name : "";
    },
    onMajorChange(val) {
      const found = (this.majors || []).find((m) => m.id === val);
      this.$set(this.form, "graduateMajorName", found ? found.name : "");
    },
    initMajors() {
      return listMajor({ pageNum: 1, pageSize: 9999 }).then((res) => {
        this.majors = res.rows || [];
      });
    },
    getList() {
      this.loading = true;
      listClass(this.queryParams).then((response) => {
        const rows = response.rows || [];
        rows.sort((a, b) => {
          const aid = a && a.id ? a.id : 0;
          const bid = b && b.id ? b.id : 0;
          return bid - aid;
        });
        this.classList = rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        id: null,
        className: null,
        graduateMajorId: null,
        graduateMajorName: null,
        enteringClass: null,
        remark: null,
      };
      this.resetForm("form");
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加班级";
    },
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getClass(id).then((response) => {
        this.form = response.data || {};
        if (
          this.form &&
          this.form.enteringClass !== null &&
          this.form.enteringClass !== undefined &&
          this.form.enteringClass !== ""
        ) {
          this.form.enteringClass = String(this.form.enteringClass);
        }
        this.open = true;
        this.title = "修改班级";
      });
    },
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateClass(this.form).then(() => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addClass(this.form).then(() => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除班级编号为"' + ids + '"的数据项？')
        .then(function () {
          return delClass(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    handleExport() {
      this.download(
        "/graduate/class/export",
        {
          ...this.queryParams,
        },
        `graduate_class_${new Date().getTime()}.xlsx`
      );
    },
    // 跳转学生信息列表并带上班级ID
    // goStudents(row) {
    //   const id = row && row.id ? row.id : null
    //   this.$router.push({ path: '/graduate/studentInfo', query: { classId: id }})
    // }
  },
};
</script>

<style scoped>
.table-link {
  color: #409eff;
  text-decoration: none;
  cursor: pointer;
}
.table-link:hover {
  text-decoration: underline;
}
</style>
