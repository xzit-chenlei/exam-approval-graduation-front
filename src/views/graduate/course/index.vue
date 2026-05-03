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
      <el-form-item label="课程名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入课程名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="专业" prop="majorId">
        <el-select
          v-model="queryParams.majorId"
          placeholder="请选择专业"
          clearable
          filterable
          @change="handleQuery"
          style="width: 200px"
        >
          <el-option
            v-for="major in majorList"
            :key="major.id"
            :label="major.name"
            :value="major.id"
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
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="courseList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="课程名称" align="center" prop="name" />
      <el-table-column
        label="年级"
        align="center"
        prop="grade"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-tickets"
            @click="handleExamPaper(scope.row)"
            >考核项管理</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-s-operation"
            @click="handleWeight(scope.row)"
            >权重管理</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleViewAbilityAchievement(scope.row)"
            >毕业能力达成度</el-button
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

    <!-- 添加或修改课程对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入课程描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 毕业能力达成度弹窗 -->
    <el-dialog
      title="毕业能力达成度分析"
      :visible.sync="abilityAchievementOpen"
      width="90%"
      append-to-body
      :close-on-click-modal="false"
      @close="destroyAchievementChart"
    >
      <div v-loading="abilityAchievementLoading">
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0;">{{ currentCourseName }} - 毕业能力达成度（加权平均）</h3>
          <div style="margin-top: 10px; color: #606266;">
            <span>权重配置：期末 {{ weights.finalWeight || 0 }}% | 平时 {{ weights.perfWeight || 0 }}% | 实验 {{ weights.labWeight || 0 }}%</span>
          </div>
        </div>

        <!-- 柱状图展示 -->
        <h3 style="margin: 20px 0 10px 0;">达成度柱状图</h3>
        <div ref="achievementChart" style="width: 100%; height: 400px; margin-bottom: 20px;"></div>

        <!-- 最终达成度统计表格 -->
        <h3 style="margin: 20px 0 10px 0;">加权平均达成度</h3>
        <el-table
          :data="finalAchievementList"
          border
          style="width: 100%"
        >
          <el-table-column label="毕业能力" prop="abilityName" min-width="200" align="center" fixed="left" />
          <el-table-column label="期末达成度" prop="finalRate" width="120" align="center">
            <template slot-scope="scope">
              <el-tag
                :type="getAchievementRateType(scope.row.finalRate)"
                size="small"
              >
                {{ scope.row.finalRate || 0 }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="平时达成度" prop="perfRate" width="120" align="center">
            <template slot-scope="scope">
              <el-tag
                :type="getAchievementRateType(scope.row.perfRate)"
                size="small"
              >
                {{ scope.row.perfRate || 0 }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="实验达成度" prop="labRate" width="120" align="center">
            <template slot-scope="scope">
              <el-tag
                :type="getAchievementRateType(scope.row.labRate)"
                size="small"
              >
                {{ scope.row.labRate || 0 }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="最终达成度" prop="weightedRate" width="150" align="center">
            <template slot-scope="scope">
              <el-tag
                :type="getAchievementRateType(scope.row.weightedRate)"
                size="small"
                style="font-weight: bold;"
              >
                {{ scope.row.weightedRate || 0 }}%
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          icon="el-icon-download"
          @click="handleExportAbilityAchievement"
          :disabled="abilityAchievementLoading || !currentCourseId"
          >导出Excel</el-button
        >
        <el-button @click="abilityAchievementOpen = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 三类考试权重管理对话框 -->
    <el-dialog
      :title="weightTitle"
      :visible.sync="weightOpen"
      width="520px"
      append-to-body
      @close="cancelWeight"
    >
      <el-form
        ref="weightFormRef"
        :model="weightForm"
        :rules="weightRules"
        label-width="100px"
      >
        <el-form-item label="所属课程" prop="courseId">
          <el-input
            v-model="weightForm.courseName"
            readonly
            placeholder="课程名称"
          />
          <el-input v-model="weightForm.courseId" type="hidden" />
        </el-form-item>
        <el-form-item label="平时占比(%)" prop="perfW">
          <el-input-number
            v-model="weightForm.perfW"
            :min="0"
            :max="100"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="实验占比(%)" prop="labW">
          <el-input-number
            v-model="weightForm.labW"
            :min="0"
            :max="100"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="期末占比(%)" prop="finalW">
          <el-input-number
            v-model="weightForm.finalW"
            :min="0"
            :max="100"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitWeightForm">提 交</el-button>
        <el-button @click="cancelWeight">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCourse,
  getCourse,
  delCourse,
  addCourse,
  updateCourse,
  exportCourse,
  getCourseAbilityAchievement,
} from "@/api/graduate/course";
import { listMajor } from "@/api/graduate/major";
import {
  listWeight,
  getWeight,
  delWeight,
  addWeight,
  updateWeight,
} from "@/api/graduate/weight";
import * as echarts from 'echarts';

export default {
  name: "Course",
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
      // 课程表格数据
      courseList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        majorId: null,
      },
      // 表单参数
      form: {},

      // 专业列表
      majorList: [],

      // 权重弹窗
      weightOpen: false,
      weightTitle: "权重管理",
      weightForm: {
        id: null,
        courseId: null,
        courseName: null,
        finalW: 0,
        perfW: 0,
        labW: 0,
      },
      // 毕业能力达成度弹窗
      abilityAchievementOpen: false,
      abilityAchievementLoading: false,
      finalAchievementList: [],
      currentCourseName: "",
      currentCourseId: null, // 当前课程ID，用于导出
      weights: {
        finalWeight: 0,
        perfWeight: 0,
        labWeight: 0,
      },
      achievementChart: null, // ECharts实例
      weightRules: {
        courseId: [
          { required: true, message: "课程ID不能为空", trigger: "blur" },
        ],
        finalW: [
          { required: true, message: "请输入期末占比", trigger: "change" },
        ],
        perfW: [
          { required: true, message: "请输入平时占比", trigger: "change" },
        ],
        labW: [
          { required: true, message: "请输入实验占比", trigger: "change" },
        ]
      },

      // 表单校验
      rules: {
        name: [
          { required: true, message: "课程名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getMajorList();
    this.getList();
  },
  methods: {
    /** 查询课程列表 */
    getList() {
      this.loading = true;
      listCourse(this.queryParams).then((response) => {
        this.courseList = response.rows;
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
        name: null,
        description: null,
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
      this.title = "添加课程";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getCourse(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改课程";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateCourse(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCourse(this.form).then((response) => {
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
        .confirm('是否确认删除课程编号为"' + ids + '"的数据项？')
        .then(function () {
          return delCourse(ids);
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
        "graduate/course/export",
        {
          ...this.queryParams,
        },
        `course_${new Date().getTime()}.xlsx`
      );
    },
    /** 试卷管理按钮操作 */
    handleExamPaper(row) {
      this.$router.push({
        path: "/graduate/graduateExamPaper",
        query: { courseId: row.id,
          majorId:this.queryParams.majorId
        },
      });
    },
    /** 权重管理按钮操作 */
    handleWeight(row) {
      this.resetWeight();
      this.weightTitle = "权重管理";
      this.weightOpen = true;
      const courseId = row.id;
      // 设置课程ID和名称
      this.weightForm.courseId = courseId;
      this.weightForm.courseName = row.name;

      // 查询该课程是否已有权重配置
      listWeight({ courseId: courseId }).then((response) => {
        const rows = response && response.rows ? response.rows : [];
        if (rows.length > 0) {
          // 如果有数据，使用第一条数据（应该只有一条）
          const item = rows[0];
          this.weightForm = {
            id: item.id || null,
            courseId: item.courseId || courseId,
            courseName: row.name,
            finalW: Math.round(Number(item.finalW !== undefined && item.finalW !== null ? item.finalW : 0) * 100),
            perfW: Math.round(Number(item.perfW !== undefined && item.perfW !== null ? item.perfW : 0) * 100),
            labW: Math.round(Number(item.labW !== undefined && item.labW !== null ? item.labW : 0) * 100)
          };
        } else {
          // 如果没有数据，设置默认值
          this.weightForm = {
            id: null,
            courseId: courseId,
            courseName: row.name,
            finalW: 0,
            perfW: 0,
            labW: 0,
          };
        }

        // 清除表单验证状态
        this.$nextTick(() => {
          if (this.$refs.weightFormRef) {
            this.$refs.weightFormRef.clearValidate();
          }
        });
      }).catch(error => {
        console.error("查询权重数据失败:", error);
        this.$modal.msgError("查询权重数据失败: " + (error.message || "未知错误"));
        // 即使查询失败，也要确保表单有默认值
        this.weightForm = {
          id: null,
          courseId: courseId,
          courseName: row.name,
          finalW: 0,
          perfW: 0,
          labW: 0,
        };
      });
    },
    // 重置权重表单
    resetWeight() {
      this.weightForm = {
        id: null,
        courseId: null,
        courseName: null,
        finalW: 0,
        perfW: 0,
        labW: 0,
      };
      this.$nextTick(() => {
        if (this.$refs.weightFormRef) {
          this.$refs.weightFormRef.clearValidate();
        }
      });
    },
    // 提交权重表单
    submitWeightForm() {
      this.$refs["weightFormRef"].validate((valid) => {
        if (!valid) return;
        const payload = { ...this.weightForm };

        // 将百分比值转换为小数
        payload.finalW = payload.finalW / 100;
        payload.perfW = payload.perfW / 100;
        payload.labW = payload.labW / 100;

        // 检查三个权重值之和是否为100%
        const totalWeight = payload.finalW + payload.perfW + payload.labW;
        if (Math.round(totalWeight * 100) !== 100) {
          this.$modal.msgError(
            "三类权重之和必须等于100%，当前总和为: " + (totalWeight * 100) + "%"
          );
          return;
        }

        // 确保 courseId 存在
        if (!payload.courseId) {
          this.$modal.msgError("课程ID不能为空");
          return;
        }


        // 根据是否有ID决定是新增还是修改
        if (payload.id) {
          // 有ID则更新
          updateWeight(payload)
            .then(() => {
              this.$modal.msgSuccess("更新成功");
              this.weightOpen = false;
              // 可以在这里刷新列表或其他操作
            })
            .catch((error) => {
              console.error("更新失败:", error);
              this.$modal.msgError(
                "更新失败: " + (error.message || "未知错误")
              );
            });
        } else {
          // 没有ID则新增
          addWeight(payload)
            .then(() => {
              this.$modal.msgSuccess("新增成功");
              this.weightOpen = false;
              // 可以在这里刷新列表或其他操作
            })
            .catch((error) => {
              console.error("新增失败:", error);
              this.$modal.msgError(
                "新增失败: " + (error.message || "未知错误")
              );
            });
        }
      });
    },
    // 取消权重弹窗
    cancelWeight() {
      this.weightOpen = false;
      this.resetWeight();
      // 重置表单验证
      this.$nextTick(() => {
        if (this.$refs.weightFormRef) {
          this.$refs.weightFormRef.clearValidate();
        }
      });
    },
    /* 查询专业列表 */
    getMajorList() {
      listMajor({ pageSize: 999 }).then((response) => {
        this.majorList = response.rows || [];
        // 如果专业列表不为空且查询参数中没有设置专业ID，则默认选择第一个
        if (this.majorList.length > 0 && !this.queryParams.majorId) {
          this.queryParams.majorId = this.majorList[0].id;
          // 获取课程列表
          this.getList();
        }
      });
    },

    /** 查看毕业能力达成度 */
    handleViewAbilityAchievement(row) {
      this.abilityAchievementOpen = true;
      this.abilityAchievementLoading = true;
      this.finalAchievementList = [];
      this.currentCourseName = row.name || "课程";
      this.currentCourseId = row.id; // 保存课程ID用于导出
      this.weights = {
        finalWeight: 0,
        perfWeight: 0,
        labWeight: 0,
      };

      getCourseAbilityAchievement(row.id)
        .then((response) => {
          const data = response.data || {};
          this.finalAchievementList = data.finalAchievements || [];
          this.weights = data.weights || {
            finalWeight: 0,
            perfWeight: 0,
            labWeight: 0,
          };
          this.abilityAchievementLoading = false;
          // 初始化图表
          this.$nextTick(() => {
            this.initAchievementChart();
          });
        })
        .catch((error) => {
          console.error("获取毕业能力达成度失败:", error);
          this.$modal.msgError("获取毕业能力达成度失败：" + (error.msg || error.message || "未知错误"));
          this.abilityAchievementLoading = false;
        });
    },

    /** 导出毕业能力达成度Excel（前端实现，包含柱状图） */
    async handleExportAbilityAchievement() {
      if (!this.currentCourseId || !this.finalAchievementList || this.finalAchievementList.length === 0) {
        this.$message.warning("没有可导出的数据");
        return;
      }

      try {
        // 动态导入ExcelJS和FileSaver
        const ExcelJS = (await import('exceljs')).default;
        const FileSaver = (await import('file-saver')).default;

        // 创建工作簿
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('毕业能力达成度');

        // 1. 创建标题行
        worksheet.mergeCells('A1:E1');
        const titleRow = worksheet.getRow(1);
        titleRow.height = 30;
        titleRow.getCell(1).value = `${this.currentCourseName} - 毕业能力达成度（加权平均）`;
        titleRow.getCell(1).font = { bold: true, size: 14 };
        titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        titleRow.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };

        // 2. 创建权重信息行
        worksheet.mergeCells('A2:E2');
        const weightRow = worksheet.getRow(2);
        weightRow.getCell(1).value = `权重配置：期末 ${this.weights.finalWeight || 0}% | 平时 ${this.weights.perfWeight || 0}% | 实验 ${this.weights.labWeight || 0}%`;
        weightRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };

        // 3. 创建表头行
        const headerRow = worksheet.getRow(3);
        const headers = ['毕业能力', '期末达成度', '平时达成度', '实验达成度', '最终达成度'];
        headers.forEach((header, index) => {
          const cell = headerRow.getCell(index + 1);
          cell.value = header;
          cell.font = { bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        headerRow.height = 25;

        // 4. 填充数据行（存储数值用于图表）
        this.finalAchievementList.forEach((item, index) => {
          const dataRow = worksheet.getRow(index + 4);
          
          // 能力名称
          dataRow.getCell(1).value = item.abilityName || '';
          dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
          dataRow.getCell(1).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          // 达成度数据（存储为数值，用于图表）
          const rates = [
            parseFloat(item.finalRate || 0) / 100,  // 转换为小数
            parseFloat(item.perfRate || 0) / 100,
            parseFloat(item.labRate || 0) / 100,
            parseFloat(item.weightedRate || 0) / 100
          ];

          rates.forEach((rate, colIndex) => {
            const cell = dataRow.getCell(colIndex + 2);
            cell.value = rate;
            cell.numFmt = '0.0%'; // 百分比格式
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });

        // 5. 设置列宽
        worksheet.columns = [
          { width: 25 }, // 毕业能力
          { width: 15 }, // 期末达成度
          { width: 15 }, // 平时达成度
          { width: 15 }, // 实验达成度
          { width: 15 }  // 最终达成度
        ];

        // 6. 将ECharts图表转换为图片并插入到Excel
        if (this.achievementChart) {
          try {
            // 获取图表实例的base64图片
            const chartImageBase64 = this.achievementChart.getDataURL({
              type: 'png',
              pixelRatio: 2,
              backgroundColor: '#fff'
            });

            // 将base64转换为ArrayBuffer（前端环境）
            const base64Data = chartImageBase64.split(',')[1];
            const binaryString = window.atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const imageBuffer = bytes.buffer;
            
            // 将图片添加到工作簿
            const imageId = workbook.addImage({
              buffer: imageBuffer,
              extension: 'png'
            });

            // 插入图片到工作表
            const dataEndRow = 3 + this.finalAchievementList.length;
            worksheet.addImage(imageId, {
              tl: { col: 0, row: dataEndRow + 1 },
              ext: { width: 800, height: 400 }
            });
          } catch (chartError) {
            console.warn('插入图表图片失败，将跳过图表:', chartError);
            // 图表图片插入失败不影响导出
          }
        }

        // 7. 导出文件
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const fileName = `课程毕业能力达成度_${this.currentCourseName}_${new Date().getTime()}.xlsx`;
        FileSaver.saveAs(blob, fileName);
        this.$message.success("导出成功");
      } catch (error) {
        console.error('导出失败:', error);
        if (error.message && error.message.includes('exceljs')) {
          this.$message.error('导出失败：请先安装exceljs库，运行 npm install exceljs');
        } else {
          this.$message.error('导出失败：' + (error.message || '未知错误'));
        }
      }
    },

    /** 初始化达成度柱状图 */
    initAchievementChart() {
      if (!this.$refs.achievementChart) {
        return;
      }

      // 销毁旧图表
      if (this.achievementChart) {
        this.achievementChart.dispose();
        this.achievementChart = null;
      }

      // 创建新图表
      this.achievementChart = echarts.init(this.$refs.achievementChart);

      // 准备数据
      const abilityNames = this.finalAchievementList.map(item => item.abilityName || '');
      const finalRates = this.finalAchievementList.map(item => parseFloat(item.finalRate || 0));
      const perfRates = this.finalAchievementList.map(item => parseFloat(item.perfRate || 0));
      const labRates = this.finalAchievementList.map(item => parseFloat(item.labRate || 0));
      const weightedRates = this.finalAchievementList.map(item => parseFloat(item.weightedRate || 0));

      // 设置图表配置
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            let result = params[0].name + '<br/>';
            params.forEach(function(item) {
              result += item.marker + item.seriesName + ': ' + item.value.toFixed(1) + '%<br/>';
            });
            return result;
          }
        },
        legend: {
          data: ['期末达成度', '平时达成度', '实验达成度', '最终达成度'],
          top: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: abilityNames,
          axisLabel: {
            rotate: abilityNames.length > 5 ? 45 : 0, // 如果能力数量多，旋转标签
            interval: 0,
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          name: '达成度(%)',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: '期末达成度',
            type: 'bar',
            data: finalRates,
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '平时达成度',
            type: 'bar',
            data: perfRates,
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '实验达成度',
            type: 'bar',
            data: labRates,
            itemStyle: {
              color: '#E6A23C'
            }
          },
          {
            name: '最终达成度',
            type: 'bar',
            data: weightedRates,
            itemStyle: {
              color: '#F56C6C'
            },
            markLine: {
              data: [
                { yAxis: 80, name: '优秀线(80%)', lineStyle: { color: '#67C23A', type: 'dashed' } },
                { yAxis: 60, name: '及格线(60%)', lineStyle: { color: '#E6A23C', type: 'dashed' } }
              ]
            }
          }
        ]
      };

      // 设置图表配置
      this.achievementChart.setOption(option);

      // 监听窗口大小变化
      window.addEventListener('resize', this.handleChartResize);
    },

    /** 处理图表窗口大小变化 */
    handleChartResize() {
      if (this.achievementChart) {
        this.achievementChart.resize();
      }
    },

    /** 获取达成度标签类型 */
    getAchievementRateType(rate) {
      if (!rate || rate === 0) return "info";
      const rateValue = parseFloat(rate);
      if (rateValue >= 80) return "success";
      if (rateValue >= 60) return "warning";
      return "danger";
    },

    /** 销毁图表 */
    destroyAchievementChart() {
      if (this.achievementChart) {
        window.removeEventListener('resize', this.handleChartResize);
        this.achievementChart.dispose();
        this.achievementChart = null;
      }
    },
  },
  beforeDestroy() {
    this.destroyAchievementChart();
  },
};
</script>
