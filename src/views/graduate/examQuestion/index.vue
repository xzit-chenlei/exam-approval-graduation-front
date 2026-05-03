<template>
  <div class="app-container">
    <!-- 返回按钮和试卷信息 -->
    <div class="page-header">
      <el-button
        type="primary"
        icon="el-icon-back"
        size="mini"
        @click="$router.back()"
        style="margin-bottom: 10px"
      >
        返回试卷列表
      </el-button>
      <h3 v-if="paperName">{{ paperName }} - 题目管理</h3>
    </div>

    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="考核项目/题目" prop="questionNo">
        <el-input
          v-model="queryParams.questionNo"
          placeholder="请输入考核项目/题目"
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
          v-hasPermi="['graduate:examQuestion:add']"
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
          v-hasPermi="['graduate:examQuestion:edit']"
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
          v-hasPermi="['graduate:examQuestion:remove']"
          >删除</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="examQuestionListWithSummary"
      @selection-change="handleSelectionChange"
      row-key="id"
      :row-class-name="getRowClassName"
    >
      <el-table-column type="selection" width="55" align="center" :selectable="selectable" reserve-selection>
        <template slot-scope="scope">
          <el-checkbox v-if="!scope.row.isSummary" :value="scope.row.checked" />
        </template>
      </el-table-column>
      <el-table-column
        label="考核项目/题目"
        align="center"
        prop="questionNo"
        width="100"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.isSummary">合计</span>
          <span v-else>{{ scope.row.questionNo }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="考核目的"
        align="center"
        prop="examPurpose"
        :show-overflow-tooltip="true"
        min-width="200"
      >
        <template slot-scope="scope">
          <span v-if="!scope.row.isSummary">{{ scope.row.examPurpose }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="与毕业能力之间的对应关系"
        align="center"
        :width="getObjectiveColumnWidth()"
      >
        <template slot-scope="scope">
          <div class="objective-mapping-container">
            <div class="objective-grid">
              <div
                v-for="ability in scope.row.isSummary ? abilityList : getSelectedAbilities(scope.row)"
                :key="ability.id"
                :class="[
                  'objective-item',
                  scope.row.isSummary ? 'objective-summary' : '',
                ]"
              >
                <div class="objective-header">{{ ability.name }}</div>
                <div v-if="scope.row.isSummary" class="objective-score-wrapper">
                  <div class="objective-score">
                    {{ (objectiveScoreSummary[ability.id] || 0).toFixed(1) }}
                  </div>
                </div>
                <div v-else class="objective-checkbox-wrapper">
                  <el-checkbox
                    :value="scope.row.abilityId === ability.id"
                    disabled
                    class="objective-checkbox"
                  >
                  </el-checkbox>
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分值" align="center" prop="score" width="80">
        <template slot-scope="scope">
          <span v-if="scope.row.isSummary">{{ getTotalScore() }}</span>
          <span v-else>{{ scope.row.score }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template slot-scope="scope">
          <div v-if="!scope.row.isSummary">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['graduate:examQuestion:edit']"
              >修改</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['graduate:examQuestion:remove']"
              >删除</el-button
            >
          </div>
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

    <!-- 添加或修改题目对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="考核项目/题目" prop="questionNo">
          <el-input
            v-model="form.questionNo"
            placeholder="请输入考核项目/题目"
          />
        </el-form-item>
        <el-form-item label="考核目的" prop="examPurpose">
          <el-input
            v-model="form.examPurpose"
            type="textarea"
            placeholder="请输入考核目的"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="分值" prop="score">
          <el-input-number
            v-model="form.score"
            :min="0"
            :max="1000"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="能力名称" prop="abilityId">
          <el-select
            v-model="form.abilityId"
            placeholder="请选择能力名称"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="ability in abilityList"
              :key="ability.id"
              :label="ability.name"
              :value="ability.id"
            >
            </el-option>
          </el-select>
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
  listExamQuestion,
  getExamQuestion,
  delExamQuestion,
  addExamQuestion,
  updateExamQuestion,
} from "@/api/graduate/examQuestion";
import { getExamPaper } from "@/api/graduate/examPaper";
import { getCourse } from "@/api/graduate/course";
import { getAbilityDropdown } from "@/api/graduate/ability";

export default {
  name: "ExamQuestion",
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
      // 题目表格数据
      examQuestionList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 能力列表
      abilityList: [],
      // 试卷名称
      paperName: "",
      // 试卷课程ID
      paperCourseId: null,
      // 能力分数统计
      objectiveScoreSummary: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        paperId: null,
        questionNo: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        questionNo: [
          { required: true, message: "考核项目/题目不能为空", trigger: "blur" },
        ],
        examPurpose: [
          { required: true, message: "考核目的不能为空", trigger: "blur" },
        ],
        score: [{ required: true, message: "分值不能为空", trigger: "blur" }],
        abilityId: [
          { required: true, message: "能力名称不能为空", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    /** 包含汇总行的题目列表 */
    examQuestionListWithSummary() {
      if (this.examQuestionList.length === 0) {
        return [];
      }

      // 创建汇总行数据
      const summaryRow = {
        id: "summary",
        isSummary: true,
        questionNo: "合计",
        examPurpose: "",
        score: this.getTotalScore(),
        objectiveId: null,
      };

      return [...this.examQuestionList, summaryRow];
    },
  },
  created() {
    // 从路由参数获取试卷ID和名称
    this.queryParams.paperId = this.$route.query.paperId;
    this.paperName = this.$route.query.paperName;

    // 先获取试卷信息，再加载能力列表和题目列表
    this.getPaperInfo().then(() => {
      this.getAbilityList().then(() => {
        this.getList();
      });
    });
  },
  methods: {
    /** 控制哪些行可以被选中 */
    selectable(row, index) {
      // 合计行不可选中（没有isSummary属性或isSummary为false的行才可以选中）
      return !row.isSummary;
    },

    /** 获取题目关联的能力列表 */
    getSelectedAbilities(row) {
      // 只返回与当前题目关联的能力
      if (row.abilityId) {
        const ability = this.abilityList.find(item => item.id === row.abilityId);
        return ability ? [ability] : [];
      }
      return [];
    },

    /** 获取试卷信息 */
    getPaperInfo() {
      if (!this.queryParams.paperId) {
        return Promise.resolve();
      }
      return getExamPaper(this.queryParams.paperId)
        .then((response) => {
          if (response.data && response.data.courseId) {
            this.paperCourseId = response.data.courseId;
          }
        })
        .catch((error) => {
          console.error("获取试卷信息失败:", error);
        });
    },

    /** 查询题目列表 */
    getList() {
      this.loading = true;
      listExamQuestion(this.queryParams).then((response) => {
        this.examQuestionList = response.rows;
        this.total = response.total;
        // 计算能力目标分数统计
        this.calculateObjectiveScores();
        this.loading = false;
      });
    },

    /** 获取能力列表（基于课程->专业） */
    async getAbilityList() {
      if (!this.paperCourseId) {
        this.abilityList = [];
        return;
      }
      try {
        const courseResp = await getCourse(this.paperCourseId);
        const majorId = courseResp?.data?.majorId;
        if (!majorId) {
          this.abilityList = [];
          return;
        }
        const abilityResp = await getAbilityDropdown(majorId);
        // 期望后端返回 [{id, name}] 结构
        this.abilityList = abilityResp?.data || abilityResp?.rows || [];
      } catch (e) {
        console.error("获取能力列表失败:", e);
        this.abilityList = [];
      }
    },

    // 返回试卷列表
    handleBack() {
      this.$router.push("/graduate/examPaper?courseId=1&majorId=1");
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
        paperId: this.queryParams.paperId,
        questionNo: null,
        examPurpose: null,
        score: null,
        abilityId: null,
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
      this.title = "添加题目";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getExamQuestion(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改题目";
      });
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateExamQuestion(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addExamQuestion(this.form).then((response) => {
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
        .confirm('是否确认删除题目编号为"' + ids + '"的数据项？')
        .then(function () {
          return delExamQuestion(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },

    /** 计算能力列的宽度 */
    getObjectiveColumnWidth() {
      const objectiveCount = this.abilityList.length;

      // 标题"与教学大纲规定的教学目标之间的对应关系"需要的最小宽度
      const titleMinWidth = 320;

      if (objectiveCount === 0) return titleMinWidth;

      // 每个项占用100px，加上边距40px
      const calculatedWidth = objectiveCount * 100 + 40;

      // 确保宽度不小于标题所需宽度，最大800px（增加最大宽度限制）
      return Math.min(Math.max(calculatedWidth, titleMinWidth), 800);
    },

    /** 计算能力分数统计 */
    calculateObjectiveScores() {
      const objectiveScores = {};

      // 初始化每个能力的分数为0
      this.abilityList.forEach((ability) => {
        objectiveScores[ability.id] = 0;
      });

      // 统计每个能力的分数
      this.examQuestionList.forEach((question) => {
        if (question.abilityId && question.score) {
          const score = parseFloat(question.score) || 0;
          if (
            Object.prototype.hasOwnProperty.call(
              objectiveScores,
              question.abilityId
            )
          ) {
            objectiveScores[question.abilityId] += score;
          }
        }
      });

      this.objectiveScoreSummary = objectiveScores;
    },

    /** 计算总分 */
    getTotalScore() {
      const total = this.examQuestionList.reduce((sum, question) => {
        const score = parseFloat(question.score) || 0;
        return sum + score;
      }, 0);
      return total.toFixed(1);
    },

    /** 获取行样式类名 */
    getRowClassName({ row, rowIndex }) {
      if (row.isSummary) {
        return "summary-row";
      }
      return "";
    },

    /** 是否可选中 */
    selectable(row) {
      return !row.isSummary;
    },
  },
};
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 10px 0;
  color: #303133;
}

.link-content {
  padding: 10px 0;
}

.link-content p {
  margin: 8px 0;
  color: #606266;
}

.el-checkbox-group .el-checkbox {
  display: block;
  margin: 8px 0;
}

/* 教学目标对应关系样式 */
.objective-mapping-container {
  padding: 8px;
  width: 100%;
  overflow-x: auto;
}

.objective-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-width: max-content;
}

.objective-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 6px 8px;
  min-width: 80px;
  max-width: 120px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.objective-header {
  font-size: 10px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
  text-align: center;
  line-height: 1.3;
  word-break: break-all;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 26px;
}

.objective-checkbox-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.objective-checkbox {
  margin: 0;
  transform: scale(0.9);
}

.objective-checkbox .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #28a745;
  border-color: #28a745;
}

.objective-checkbox .el-checkbox__input.is-disabled .el-checkbox__inner {
  cursor: not-allowed;
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.objective-checkbox
  .el-checkbox__input.is-disabled.is-checked
  .el-checkbox__inner {
  background-color: #28a745;
  border-color: #28a745;
}

/* 主表格行高调整 */
.el-table .el-table__row td {
  padding: 12px 0;
}

/* 确保表头标题不换行 */
.el-table .el-table__header th {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 120px; /* 确保"考核项目/题目"能完整显示 */
}

/* 调整"考核项目/题目"列的样式 */
.el-table .el-table__header th:nth-child(2),
.el-table .el-table__cell:nth-child(2) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 120px;
}

/* 调整表单标签样式 */
.el-form-item__label {
  white-space: nowrap;
}

/* 教学目标列标题样式 */
.el-table .el-table__header th:nth-child(4) {
  min-width: 320px !important;
  font-size: 13px;
  font-weight: 600;
}

/* 汇总行样式 */
.el-table .summary-row {
  background-color: #f8f9fa;
  border-top: 2px solid #dcdfe6;
  font-weight: 600;
  color: #303133;
}

.el-table .summary-row td {
  font-weight: 600;
  font-size: 13px;
}

/* 汇总行中的能力目标卡片样式 */
.objective-summary {
  background-color: #e3f2fd;
  border: 2px solid #2196f3;
}

.objective-score-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.objective-score {
  font-size: 14px;
  font-weight: 700;
  color: #1976d2;
  text-align: center;
}
</style>
