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
      <el-form-item label="学期" prop="semester">
        <el-input
          v-model="queryParams.semester"
          placeholder="请输入学期"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="考核类型" prop="typeId">
        <el-select
          v-model="queryParams.typeId"
          placeholder="请选择类型"
          clearable
          @change="handleQuery"
          style="width: 120px"
        >
          <el-option label="期末" :value="1"></el-option>
          <el-option label="平时" :value="2"></el-option>
          <el-option label="实验" :value="3"></el-option>
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
          v-hasPermi="['graduate:examPaper:add']"
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
          v-hasPermi="['graduate:examPaper:edit']"
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
          v-hasPermi="['graduate:examPaper:remove']"
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
          v-hasPermi="['graduate:examPaper:export']"
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
      :data="examPaperList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column
        label="考核类型"
        align="center"
        width="260"
        prop="typeId"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.typeId === 1">期末</span>
          <span v-else-if="scope.row.typeId === 2">平时</span>
          <span v-else-if="scope.row.typeId === 3">实验</span>
          <span v-else>{{ scope.row.typeId }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="课程名称"
        align="center"
        width="260"
        prop="courseName"
      />
      <el-table-column
        label="学期"
        align="center"
        width="260"
        prop="semester"
      />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        fixed="right"
        min-width="300px"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['graduate:examPaper:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['graduate:examPaper:remove']"
            >删除</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-setting"
            @click="handleManageQuestions(scope.row)"
            >管理题目</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-s-data"
            @click="handleManageScores(scope.row)"
            >分数管理</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleViewAbilityAchievement(scope.row)"
            >能力达成度</el-button
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

    <!-- 毕业能力达成度弹窗 -->
    <el-dialog
      title="毕业能力达成度分析"
      :visible.sync="abilityAchievementOpen"
      width="90%"
      append-to-body
      :close-on-click-modal="false"
    >
      <div v-loading="abilityAchievementLoading">
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0;">{{ currentPaperName }} - 题目与毕业能力关系</h3>
        </div>

        <!-- 题目与能力关系表格 -->
        <el-table
          :data="questionAbilityList"
          border
          style="width: 100%; margin-bottom: 30px;"
          max-height="400"
        >
          <el-table-column label="题目编号" prop="questionNo" width="100" align="center" />
          <el-table-column label="考核目的" prop="examPurpose" min-width="200" show-overflow-tooltip />
          <el-table-column label="分值" prop="score" width="80" align="center" />
          <el-table-column label="关联毕业能力" prop="abilityName" min-width="200" align="center" />
        </el-table>

        <!-- 毕业能力达成度统计表格 -->
        <h3 style="margin: 20px 0 10px 0;">毕业能力达成度统计</h3>
        <el-table
          :data="abilityAchievementList"
          border
          style="width: 100%"
        >
          <el-table-column label="毕业能力" prop="abilityName" min-width="200" align="center" />
          <el-table-column label="题目数量" prop="questionCount" width="100" align="center" />
          <el-table-column label="总分" prop="totalScore" width="100" align="center">
            <template slot-scope="scope">
              {{ scope.row.totalScore || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="平均分" prop="averageScore" width="100" align="center">
            <template slot-scope="scope">
              {{ scope.row.averageScore || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="学生人数" prop="studentCount" width="100" align="center" />
          <el-table-column label="达成度百分比" prop="achievementRate" width="150" align="center">
            <template slot-scope="scope">
              <el-tag
                :type="getAchievementRateType(scope.row.achievementRate)"
                size="small"
              >
                {{ scope.row.achievementRate || 0 }}%
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="abilityAchievementOpen = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改试卷对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="学期" prop="semester">
          <el-input
            v-model="form.semester"
            placeholder="请输入学期（字符串）"
          />
        </el-form-item>
        <el-form-item label="考核类型" prop="typeId">
          <el-select
            v-model="form.typeId"
            placeholder="请选择类型"
            clearable
            style="width: 100%"
          >
            <el-option label="期末" :value="1"></el-option>
            <el-option label="平时" :value="2"></el-option>
            <el-option label="实验" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属专业" prop="majorId">
          <el-select
            v-model="form.majorId"
            placeholder="请选择专业"
            style="width: 100%"
            :disabled="isUpdateForm"
            @change="handleMajorChange"
          >
            <el-option
              v-for="major in majorList"
              :key="major.id"
              :label="major.name"
              :value="major.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属课程" prop="courseId">
          <el-select
            v-model="form.courseId"
            placeholder="请选择课程"
            style="width: 100%"
            @change="handleCourseChange"
          >
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
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
  listExamPaper,
  getExamPaper,
  delExamPaper,
  addExamPaper,
  updateExamPaper,
  getAbilityAchievement,
} from "@/api/graduate/examPaper";
import { listCourse } from "@/api/graduate/course";
import {
  listCourseObjective,
  getObjectiveAchievement,
  getPaperObjectiveAchievement,
} from "@/api/graduate/courseObjective";
import { listMajor } from "@/api/graduate/major";

export default {
  name: "ExamPaper",
  dicts: ["semester_code"],
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
      // 试卷表格数据
      examPaperList: [],
      // 课程列表
      courseList: [],
      // 专业列表
      majorList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        paperName: null,
        courseId: null,
        majorId: null,
        semester: null,
        typeId: null,
      },
      // 表单参数
      form: {},
      // 是否为更新表单
      isUpdateForm: false,
      // 毕业能力达成度弹窗
      abilityAchievementOpen: false,
      abilityAchievementLoading: false,
      questionAbilityList: [],
      abilityAchievementList: [],
      currentPaperName: "",

      // 表单校验
      rules: {
        paperName: [
          { required: true, message: "试卷名称不能为空", trigger: "blur" },
        ],
        courseId: [
          { required: true, message: "所属课程不能为空", trigger: "change" },
        ],
        typeId: [
          { required: true, message: "试卷类型不能为空", trigger: "change" },
        ],
      },
    };
  },
  created() {
    // 从路由参数中获取 courseId
    const courseId = this.$route.query.courseId;
    if (courseId) {
      this.queryParams.courseId = courseId;
    }
    // 从路由参数中获取 courseId
    const majorId = this.$route.query.majorId;
    if (majorId) {
      this.queryParams.majorId = majorId;
    }

    this.getCourseList().then(() => {
      this.getList();
    });
  },
  methods: {
    /** 查询试卷列表 */
    getList() {
      this.loading = true;
      listExamPaper(this.queryParams).then((response) => {
        this.examPaperList = response.rows;
        this.total = response.total;
        // 设置课程名称
        this.setCourseName();
        this.loading = false;
      });
    },

    /** 设置课程名称 */
    setCourseName() {
      this.examPaperList.forEach((paper) => {
        const course = this.courseList.find(
          (course) => course.id === paper.courseId
        );
        paper.courseName = course ? course.name : "未知课程";
      });
    },

    /** 查询课程列表 */
    getCourseList() {
      // 根据 majorId 查询课程列表
      return listCourse({
        majorId: this.queryParams.majorId,
        pageSize: 100,
      }).then((response) => {
        this.courseList = response.rows || [];
      });
    },

    /** 查询专业列表 */
    getMajorList() {
      return listMajor().then((response) => {
        this.majorList = response.rows || [];
      });
    },

    /** 获取专业名称 */
    getMajorName(majorId) {
      if (!majorId) return "";
      const major = this.majorList.find((m) => m.id === majorId);
      return major ? major.name : "";
    },

    /** 展开行处理 */
    handleExpandChange(row, expandedRows) {
      // 如果是展开状态且还没有加载课程目标数据
      if (expandedRows.includes(row) && row.courseObjectives === undefined) {
        this.loadCourseObjectives(row);
      }
    },

    /** 加载课程目标数据 */
    loadCourseObjectives(row) {
      // 设置加载状态
      this.$set(row, "objectivesLoading", true);

      if (!row.courseId) {
        this.$set(row, "courseObjectives", []);
        this.$set(row, "objectivesLoading", false);
        return;
      }

      // 并行获取课程目标和能力达成度数据
      Promise.all([
        listCourseObjective({ courseId: row.courseId }),
        getPaperObjectiveAchievement(row.id),
      ])
        .then(([objectivesResponse, achievementResponse]) => {
          const objectives = objectivesResponse.rows || [];
          const achievements = achievementResponse.data || [];

          // 合并数据
          const mergedObjectives = objectives.map((objective) => {
            const achievement = achievements.find(
              (a) => a.objectiveId === objective.id
            );
            return {
              ...objective,
              achievementRate: achievement
                ? achievement.achievementRate
                : undefined,
              totalScore: achievement ? achievement.totalScore : 0,
              averageScore: achievement ? achievement.averageScore : 0,
              questionCount: achievement ? achievement.questionCount : 0,
              studentCount: achievement ? achievement.studentCount : 0,
            };
          });

          this.$set(row, "courseObjectives", mergedObjectives);
        })
        .catch((error) => {
          console.error("加载课程目标或达成度数据失败:", error);
          // 如果达成度数据获取失败，至少显示课程目标
          listCourseObjective({ courseId: row.courseId })
            .then((response) => {
              this.$set(row, "courseObjectives", response.rows || []);
            })
            .catch(() => {
              this.$set(row, "courseObjectives", []);
            });
        })
        .finally(() => {
          this.$set(row, "objectivesLoading", false);
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
        majorId: null, // 从课程ID自动获取
        courseId: null,
        majorName: null, // 专业名称
        paperName: null,
        paperCode: null,
        examType: "FINAL",
        examDate: null,
        grade: null,
        semester: null,
        typeId: null,
        totalScore: 100,
        examDuration: 120,
        orderNo: 0,
        remark: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
      this.getCourseList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.paperName = null;
      // 保留 courseId 参数
      const courseId = this.queryParams.courseId;
      this.queryParams.semester = null;
      this.queryParams.typeId = null;
      this.queryParams.majorId = null;
      // 恢复 courseId 参数
      if (courseId) {
        this.queryParams.courseId = courseId;
      }
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
      this.isUpdateForm = false;

      // 加载专业列表
      this.getMajorList().then(() => {
        // 从 queryParams 中设置专业和课程字段
        if (this.queryParams.majorId) {
          this.form.majorId = Number(this.queryParams.majorId);
        }
        if (this.queryParams.courseId) {
          this.form.courseId = Number(this.queryParams.courseId);
        }

        // 如果有专业ID，加载对应的课程列表
        if (this.form.majorId) {
          listCourse({ majorId: this.form.majorId }).then((response) => {
            this.courseList = response.rows || [];
          });
        } else {
          this.courseList = [];
        }
      });

      this.open = true;
      this.title = "添加试卷";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.isUpdateForm = true;
      const id = row.id || this.ids;
      getExamPaper(id).then((response) => {
        const data = response.data || {};
        // 合并赋值，保留缺省键，且将 grade/semester 转为字符串以匹配控件
        this.form = { ...this.form, ...data };
        if (this.form.semester != null)
          this.form.semester = String(this.form.semester);
        if (this.form.typeId != null)
          this.form.typeId = Number(this.form.typeId);

        // 加载专业列表并设置专业名称
        this.getMajorList().then(() => {
          if (this.form.majorId) {
            this.form.majorName = this.getMajorName(this.form.majorId);
          }

          // 根据 majorId 查询课程列表
          if (this.form.majorId) {
            listCourse({ majorId: this.form.majorId }).then((response) => {
              this.courseList = response.rows || [];
            });
          }
        });

        this.open = true;
        this.title = "修改试卷";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          // 根据课程ID自动设置专业ID
          const selectedCourse = this.courseList.find(
            (course) => course.id === this.form.courseId
          );
          if (selectedCourse) {
            this.form.majorId = selectedCourse.majorId;
          }

          // 提交给后端前将年级/学期转换为数字（后端实体为 Integer）
          const payload = {
            ...this.form,
            typeId: this.form.typeId != null ? Number(this.form.typeId) : null,
            // 学期保持字符串，后端已改为字符串存储
            semester:
              this.form.semester != null ? String(this.form.semester) : null,
          };

          if (this.form.id != null) {
            updateExamPaper(payload).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addExamPaper(payload).then((response) => {
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
        .confirm('是否确认删除试卷编号为"' + ids + '"的数据项？')
        .then(function () {
          return delExamPaper(ids);
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
        "graduate/examPaper/export",
        {
          ...this.queryParams,
        },
        `examPaper_${new Date().getTime()}.xlsx`
      );
    },

    // 添加 download 方法的实现或修改现有实现
    download(url, params, filename) {
      // 确保 url 是字符串类型
      if (typeof url !== "string") {
        console.error("URL must be a string");
        this.$message.error("下载文件出现错误，请联系管理员！");
        return;
      }

      // 构建请求参数
      const queryString = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");
      const fullUrl = `${url}?${queryString}`;

      // 创建隐藏的 iframe 来触发下载
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = fullUrl;
      document.body.appendChild(iframe);

      // 监听 iframe 的 load 事件，确保下载开始
      iframe.onload = () => {
        // 下载完成后移除 iframe
        document.body.removeChild(iframe);
      };

      // 设置超时，防止长时间等待
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 10000);
    },

    /** 管理题目 */
    handleManageQuestions(row) {
      this.$router.push({
        path: "/graduate/graduateExamQuestion",
        query: { paperId: row.id, paperName: row.paperName },
      });
    },

    /** 管理分数 */
    handleManageScores(row) {
      this.$router.push({
        path: "/graduate/studentScore",
        query: { paperId: row.id, paperName: row.paperName },
      });
    },

    /** 课程变化处理 */
    handleCourseChange(courseId) {
      const selectedCourse = this.courseList.find(
        (course) => course.id === courseId
      );
      if (selectedCourse) {
        this.form.majorId = selectedCourse.majorId;
        // 更新专业名称显示
        this.getMajorList().then(() => {
          this.form.majorName = this.getMajorName(selectedCourse.majorId);
        });
      }
    },

    /** 年级变化处理 */
    handleGradeChange() {
      this.handleQuery();
    },

    /** 专业变化处理 */
    handleMajorChange(majorId) {
      // 清空之前选择的课程
      this.form.courseId = null;

      // 根据选中的专业ID获取对应的课程列表
      if (majorId) {
        listCourse({ majorId: majorId }).then((response) => {
          this.courseList = response.rows || [];
        });
      } else {
        this.courseList = [];
      }
    },

    /** 查看毕业能力达成度 */
    handleViewAbilityAchievement(row) {
      this.abilityAchievementOpen = true;
      this.abilityAchievementLoading = true;
      this.questionAbilityList = [];
      this.abilityAchievementList = [];
      this.currentPaperName = row.paperName || "试卷";

      getAbilityAchievement(row.id)
        .then((response) => {
          const data = response.data || {};
          this.questionAbilityList = data.questions || [];
          this.abilityAchievementList = data.abilityAchievements || [];
          this.abilityAchievementLoading = false;
        })
        .catch((error) => {
          console.error("获取毕业能力达成度失败:", error);
          this.$modal.msgError("获取毕业能力达成度失败：" + (error.msg || error.message || "未知错误"));
          this.abilityAchievementLoading = false;
        });
    },

    /** 获取达成度标签类型 */
    getAchievementRateType(rate) {
      if (!rate || rate === 0) return "info";
      const rateValue = parseFloat(rate);
      if (rateValue >= 80) return "success";
      if (rateValue >= 60) return "warning";
      return "danger";
    },

  },
};
</script>
