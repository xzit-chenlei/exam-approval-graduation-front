<template>
  <div class="app-container">
    <div class="toolbar">
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        @click="$router.push('/graduate/graduateMajor')"
        >返回</el-button
      >
    </div>
    <div class="search-bar">
      <el-form :inline="true" class="grade-form">
        <el-form-item label="入学年级">
          <el-date-picker
            v-model="query.grade"
            type="year"
            value-format="yyyy"
            placeholder="选择入学年份"
            style="width: 160px"
            @change="changeByGrade"
            clearable
          />
        </el-form-item>
      </el-form>
    </div>

    <div class="mb8">
      <el-button
        type="primary"
        plain
        size="mini"
        icon="el-icon-plus"
        @click="addCourse"
        >新增课程</el-button
      >
      <el-button
        type="primary"
        plain
        size="mini"
        icon="el-icon-plus"
        @click="openAddAbility"
        >新增能力</el-button
      >
      <el-button
        type="success"
        plain
        size="mini"
        icon="el-icon-s-data"
        @click="viewGraduationAchievement"
        >查看毕业达成度</el-button
      >
    </div>

    <div class="table-container" ref="tableContainer">
      <el-table
        :key="tableKey"
        v-loading="loading"
        :data="courses"
        border
        :header-cell-style="{ background: '#fafafa' }"
        show-summary
        :summary-method="summaryMethod"
        style="width: max-content; min-width: 100%"
      >
        <el-table-column fixed width="220">
          <template slot="header">
            <div class="corner-header">
              <span class="corner-title course">课程</span>
              <span class="corner-title ability">能力</span>
            </div>
          </template>
          <template slot-scope="scope">
            <div style="display: flex; align-items: center; gap: 6px">
              <el-input
                size="mini"
                :value="getCourseDraft(scope.row.id, scope.row.name)"
                @input="setCourseDraft(scope.row.id, $event)"
              />
              <el-button
                v-if="isCourseDirty(scope.row.id, scope.row.name)"
                type="primary"
                size="mini"
                @click="saveCourseName(scope.row)"
                >确定</el-button
              >
              <el-button
                v-if="isRowDirty(scope.row.id)"
                type="success"
                size="mini"
                @click="saveRow(scope.row.id)"
                >保存整行</el-button
              >
              <el-button
                type="text"
                size="mini"
                @click="removeCourse(scope.row)"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>

        <!-- 分组表头：父级能力下挂子能力；无子能力的父级作为单列显示 -->
        <template v-for="parent in parentAbilities">
          <el-table-column :key="'p-' + parent.id" :label="parent.name">
            <template slot="header">
              <div class="col-header">
                <el-input v-model="parent.name" size="mini" disabled />
                <el-button
                  type="text"
                  size="mini"
                  @click.stop="openAddAbilityWithParent(parent)"
                  >新增</el-button
                >
                <el-button
                  type="text"
                  size="mini"
                  @click.stop="editAbility(parent)"
                  >修改</el-button
                >
                <el-button
                  type="text"
                  size="mini"
                  @click.stop="removeAbility(parent)"
                  >删除</el-button
                >
              </div>
            </template>
            <template
              v-if="childrenMap[parent.id] && childrenMap[parent.id].length"
            >
              <el-table-column
                v-for="col in childrenMap[parent.id]"
                :key="'c-' + col.id"
                :label="col.name"
                :width="300"
                :prop="'a_' + col.id"
              >
                <template slot="header">
                  <div class="col-header">
                    <el-input v-model="col.name" size="mini" disabled />
                    <el-button
                      type="text"
                      size="mini"
                      @click.stop="editAbility(col)"
                      >修改</el-button
                    >
                    <el-button
                      type="text"
                      size="mini"
                      @click.stop="removeAbility(col)"
                      >删除</el-button
                    >
                  </div>
                </template>
                <template slot-scope="scope">
                  <div style="display: flex; align-items: center; gap: 6px">
                    <el-input-number
                      size="mini"
                      :value="getDraft(scope.row.id, col.id)"
                      @input="setDraft(scope.row.id, col.id, $event)"
                      :min="0"
                      :max="100"
                      :step="0.1"
                      controls-position="right"
                      :precision="2"
                    />
                    <el-button
                      v-if="isDirty(scope.row.id, col.id)"
                      type="primary"
                      size="mini"
                      @click="saveCell(scope.row.id, col.id)"
                      >确定</el-button
                    >
                    <el-button
                      type="text"
                      size="mini"
                      @click="clearCellAction(scope.row.id, col.id)"
                      >清除</el-button
                    >
                  </div>
                </template>
              </el-table-column>
            </template>
            <template v-else>
              <el-table-column
                :label="parent.name"
                :width="300"
                :prop="'a_' + parent.id"
              >
                <template slot-scope="scope">
                  <div style="display: flex; align-items: center; gap: 6px">
                    <el-input-number
                      size="mini"
                      :value="getDraft(scope.row.id, parent.id)"
                      @input="setDraft(scope.row.id, parent.id, $event)"
                      :min="0"
                      :max="100"
                      :step="0.1"
                      controls-position="right"
                      :precision="2"
                    />
                    <el-button
                      v-if="isDirty(scope.row.id, parent.id)"
                      type="primary"
                      size="mini"
                      @click="saveCell(scope.row.id, parent.id)"
                      >确定</el-button
                    >
                    <el-button
                      type="text"
                      size="mini"
                      @click="clearCellAction(scope.row.id, parent.id)"
                      >清除</el-button
                    >
                  </div>
                </template>
              </el-table-column>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <!-- 自定义滚动条 -->
      <div class="custom-scrollbar" ref="customScrollbar">
        <div class="scrollbar-track" ref="scrollbarTrack">
          <div
            class="scrollbar-thumb"
            ref="scrollbarThumb"
            @mousedown="startDrag"
          ></div>
        </div>
      </div>
    </div>

    <el-dialog
      :title="abilityEditMode ? '修改能力' : '新增能力'"
      :visible.sync="abilityDialogVisible"
      width="500px"
      append-to-body
    >
      <el-form
        ref="abilityFormRef"
        :model="abilityForm"
        :rules="abilityRules"
        label-width="90px"
      >
        <el-form-item label="父级能力" prop="parentId">
          <el-select
            v-model="abilityForm.parentId"
            placeholder="请选择父级能力(可不选)"
            clearable
            filterable
            style="width: 100%"
          >
            <el-option :value="null" label="无(创建为父级能力)" />
            <el-option
              v-for="p in parentAbilities"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="能力名称" prop="name">
          <el-input v-model="abilityForm.name" placeholder="请输入能力名称" />
        </el-form-item>
        <el-form-item label="能力描述" prop="remark">
          <el-input
            v-model="abilityForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入能力描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAbility">确 定</el-button>
        <el-button @click="abilityDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listMatrix,
  addRow,
  updateRow,
  removeRow,
  addCol,
  updateCol,
  removeCol,
  upsertCell,
  clearCell,
} from "@/api/graduate/c-a-performance";

export default {
  name: "GraduateMatrixPerf",
  data() {
    return {
      loading: false,
      query: { majorId: "", grade: "" },
      courses: [],
      abilities: [],
      cells: {},
      abilityDialogVisible: false,
      abilityEditMode: false,
      abilityForm: { id: null, name: "", parentId: null, remark: "" },
      abilityRules: {
        name: [{ required: true, message: "请输入能力名称", trigger: "blur" }],
        remark: [{ required: false }],
      },
      drafts: {},
      courseDrafts: {},
      tableKey: 0,
    };
  },
  computed: {
    parentAbilities() {
      return (this.abilities || []).filter((a) => !a.parentId);
    },
    childrenMap() {
      const map = {};
      (this.abilities || []).forEach((a) => {
        if (a.parentId) {
          if (!map[a.parentId]) map[a.parentId] = [];
          map[a.parentId].push(a);
        }
      });
      return map;
    },
  },
  created() {
    this.initFromRoute();
  },
  activated() {
    this.initFromRoute();
  },
  mounted() {
    this.initCustomScrollbar();
  },
  watch: {
    "$route.query.majorId"(val) {
      if (val && val !== this.query.majorId) {
        this.query.majorId = val;
        this.load();
      }
    },
  },
  methods: {
    initFromRoute() {
      const mid = this.$route.query.majorId;
      const gde = this.$route.query.grade;
      if (mid) {
        this.query.majorId = mid;
        this.query.grade = gde;
        this.load();
      } else {
        this.$message.error("缺少专业ID");
        this.$router.back();
      }
    },
    changeByGrade() {
      if (this.query.grade === null) {
        this.query.grade = new Date().getFullYear();
      }
      // 更新路由参数
      this.$router.push({
        query: {
          ...this.$route.query,
          grade: this.query.grade,
        },
      });

      listMatrix(this.query.majorId, this.query.grade)
        .then((res) => {
          const { courses, abilities, cells } = res.data;
          this.courses = courses || [];
          this.abilities = abilities || [];
          this.cells = cells || {};
          this.drafts = {};
          this.courseDrafts = {};
          this.$nextTick(() => this.bumpTable());
          this.loading = false;
        })
        .catch(() => (this.loading = false));
    },
    bumpTable() {
      this.tableKey += 1;
    },
    load() {
      if (!this.query.majorId) return;
      this.loading = true;
      listMatrix(this.query.majorId, this.query.grade)
        .then((res) => {
          const { courses, abilities, cells } = res.data;
          this.courses = courses || [];
          this.abilities = abilities || [];
          this.cells = cells || {};
          this.drafts = {};
          this.courseDrafts = {};
          this.$nextTick(() => this.bumpTable());
          this.loading = false;
        })
        .catch(() => (this.loading = false));
    },
    addCourse() {
      this.$prompt("课程名称", "新增课程", {
        inputValidator: (v) => !!v,
        inputErrorMessage: "必填",
      })
        .then(({ value }) =>
          addRow({
            majorId: this.query.majorId,
            grade: this.query.grade,
            name: value,
          })
        )
        .then(() => this.load());
    },
    updateCourse(row) {
      updateRow(row);
    },
    getCourseDraft(courseId, original) {
      return this.courseDrafts[courseId] !== undefined
        ? this.courseDrafts[courseId]
        : original;
    },
    setCourseDraft(courseId, val) {
      this.$set(this.courseDrafts, courseId, val);
    },
    isCourseDirty(courseId, original) {
      return (
        this.courseDrafts[courseId] !== undefined &&
        this.courseDrafts[courseId] !== original
      );
    },
    isRowDirty(courseId) {
      // 检查该行是否有任何单元格被修改
      for (const key in this.drafts) {
        if (key.startsWith(`${courseId}_`)) {
          const [rowId] = key.split("_");
          if (rowId === String(courseId)) {
            const [courseIdPart, abilityId] = key.split("_");
            if (this.isDirty(parseInt(courseIdPart), parseInt(abilityId))) {
              return true;
            }
          }
        }
      }
      return false;
    },
    saveRow(courseId) {
      // 收集该行所有修改过的单元格
      const dirtyCells = [];
      for (const key in this.drafts) {
        if (key.startsWith(`${courseId}_`)) {
          const [courseIdPart, abilityId] = key.split("_");
          if (courseIdPart === String(courseId)) {
            if (this.isDirty(parseInt(courseIdPart), parseInt(abilityId))) {
              dirtyCells.push({
                courseId: parseInt(courseIdPart),
                abilityId: parseInt(abilityId),
                level: this.getDraft(
                  parseInt(courseIdPart),
                  parseInt(abilityId)
                ),
              });
            }
          }
        }
      }

      // 批量保存该行所有修改过的单元格
      const savePromises = dirtyCells.map((cell) => {
        if (
          cell.level === undefined ||
          cell.level === null ||
          cell.level === ""
        ) {
          return Promise.resolve(); // 跳过空值
        }
        return upsertCell({
          courseId: cell.courseId,
          abilityId: cell.abilityId,
          grade: this.query.grade,
          level: cell.level,
          majorId: this.query.majorId,
        }).then(() => {
          // 更新本地状态
          const k = this.key(cell.courseId, cell.abilityId);
          const updated = { ...this.cells[k], level: cell.level };
          this.$set(this.cells, k, updated);
          this.$delete(this.drafts, k);
        });
      });

      Promise.all(savePromises)
        .then(() => {
          this.$message.success("已保存该行所有修改");
        })
        .catch(() => {
          this.$message.error("保存过程中出现错误");
        });
    },
    saveCourseName(row) {
      const draft = this.courseDrafts[row.id];
      if (!draft) {
        this.$message.warning("请输入课程名称");
        return;
      }
      const payload = { ...row, name: draft };
      updateRow(payload).then(() => {
        this.$message.success("已保存");
        row.name = draft;
        this.$delete(this.courseDrafts, row.id);
      });
    },
    removeCourse(row) {
      this.$confirm("删除该课程将清空其交叉数据，是否继续？", "提示")
        .then(() => removeRow(row.id))
        .then(() => this.load());
    },
    openAddAbility() {
      this.abilityEditMode = false;
      this.abilityForm = { id: null, name: "", parentId: null, remark: "" };
      this.abilityDialogVisible = true;
    },
    openAddAbilityWithParent(parent) {
      this.abilityEditMode = false;
      this.abilityForm = {
        id: null,
        name: "",
        parentId: parent.id,
        remark: "",
      };
      this.abilityDialogVisible = true;
    },
    submitAbility() {
      this.$refs.abilityFormRef.validate((valid) => {
        if (!valid) return;
        if (this.abilityEditMode) {
          updateCol({
            id: this.abilityForm.id,
            name: this.abilityForm.name,
            remark: this.abilityForm.remark,
            parentId: this.abilityForm.parentId,
          }).then(() => {
            this.$message.success("修改成功");
            this.abilityDialogVisible = false;
            this.load();
          });
        } else {
          addCol({
            majorId: this.query.majorId,
            grade: this.query.grade,
            name: this.abilityForm.name,
            remark: this.abilityForm.remark,
            parentId: this.abilityForm.parentId,
          }).then(() => {
            this.$message.success("新增成功");
            this.abilityDialogVisible = false;
            this.load();
          });
        }
      });
    },
    editAbility(col) {
      this.abilityEditMode = true;
      this.abilityForm = {
        id: col.id,
        name: col.name,
        parentId: col.parentId || null,
        remark: col.remark || "",
      };
      this.abilityDialogVisible = true;
    },
    removeAbility(col) {
      this.$confirm("删除该能力将清空其交叉数据，是否继续？", "提示")
        .then(() => removeCol(col.id))
        .then(() => this.load());
    },
    key(courseId, abilityId) {
      return `${courseId}_${abilityId}`;
    },
    cellValue(courseId, abilityId) {
      const k = this.key(courseId, abilityId);
      return this.cells[k] ? this.cells[k].level : "";
    },
    numericCell(courseId, abilityId) {
      const v = this.cellValue(courseId, abilityId);
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    },
    getDraft(courseId, abilityId) {
      const k = this.key(courseId, abilityId);
      return k in this.drafts
        ? this.drafts[k]
        : this.cellValue(courseId, abilityId);
    },
    setDraft(courseId, abilityId, val) {
      const k = this.key(courseId, abilityId);
      this.$set(this.drafts, k, val);
    },
    isDirty(courseId, abilityId) {
      const k = this.key(courseId, abilityId);
      if (!(k in this.drafts)) return false;
      const original = this.cellValue(courseId, abilityId);
      const draft = this.drafts[k];
      const toNum = (v) =>
        v === "" || v === null || v === undefined ? null : Number(v);
      const o = toNum(original);
      const d = toNum(draft);
      if (o === null && d === null) return false;
      return o !== d;
    },
    saveCell(courseId, abilityId) {
      const k = this.key(courseId, abilityId);
      const level = this.getDraft(courseId, abilityId);
      if (level === undefined || level === null || level === "") {
        this.$message.warning("请输入数值或使用清除");
        return;
      }
      upsertCell({
        courseId,
        abilityId,
        grade: this.query.grade,
        level,
        majorId: this.query.majorId,
      }).then(() => {
        this.$message.success("已保存");
        const updated = { ...this.cells[k], level };
        this.$set(this.cells, k, updated);
        this.$delete(this.drafts, k);
      });
    },
    clearCellAction(courseId, abilityId) {
      const k = this.key(courseId, abilityId);
      clearCell({
        courseId,
        abilityId,
        majorId: this.query.majorId,
        grade: this.query.grade,
      }).then(() => {
        this.$message.success("已清除");
        this.$set(this.drafts, k, "");
        this.$delete(this.cells, k);
      });
    },

    /** 查看毕业达成度 */
    viewGraduationAchievement() {
      this.$router.push({
        path: "/graduate/graduationAchievement",
        query: {
          majorId: this.query.majorId,
          grade: this.query.grade,
          majorName: this.$route.query.majorName || "专业",
        },
      });
    },
    summaryMethod({ columns }) {
      const sums = [];
      columns.forEach((col, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        const prop = col.property;
        if (!prop || !prop.startsWith("a_")) {
          sums[index] = "";
          return;
        }
        const abilityId = Number(prop.slice(2));
        let total = 0;
        this.courses.forEach((row) => {
          total += this.numericCell(row.id, abilityId);
        });
        sums[index] = total.toFixed(2);
      });
      return sums;
    },
    clearCell,
    // 自定义滚动条相关方法
    initCustomScrollbar() {
      this.$nextTick(() => {
        const container = this.$refs.tableContainer;
        const track = this.$refs.scrollbarTrack;
        const thumb = this.$refs.scrollbarThumb;

        if (!container || !track || !thumb) return;

        const updateScrollbar = () => {
          const scrollWidth = container.scrollWidth;
          const clientWidth = container.clientWidth;
          const scrollLeft = container.scrollLeft;

          if (scrollWidth <= clientWidth) {
            track.style.display = "none";
            return;
          }

          track.style.display = "block";
          const thumbWidth = (clientWidth / scrollWidth) * clientWidth;
          const thumbLeft =
            (scrollLeft / (scrollWidth - clientWidth)) *
            (clientWidth - thumbWidth);

          thumb.style.width = thumbWidth + "px";
          thumb.style.left = thumbLeft + "px";
        };

        // 监听容器滚动
        container.addEventListener("scroll", updateScrollbar);

        // 监听窗口大小变化
        window.addEventListener("resize", updateScrollbar);

        // 初始更新
        updateScrollbar();

        // 保存更新函数以便后续使用
        this.updateScrollbar = updateScrollbar;
      });
    },
    startDrag(e) {
      e.preventDefault();
      const container = this.$refs.tableContainer;
      const track = this.$refs.scrollbarTrack;
      const thumb = this.$refs.scrollbarThumb;

      if (!container || !track || !thumb) return;

      const trackRect = track.getBoundingClientRect();
      const thumbWidth = thumb.offsetWidth;
      const maxLeft = trackRect.width - thumbWidth;

      const handleMouseMove = (e) => {
        const left = e.clientX - trackRect.left;
        const clampedLeft = Math.max(0, Math.min(left, maxLeft));
        const scrollLeft =
          (clampedLeft / maxLeft) *
          (container.scrollWidth - container.clientWidth);

        container.scrollLeft = scrollLeft;
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
  },
};
</script>

<style scoped>
.col-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.row-ops {
  margin-top: 4px;
}

.toolbar {
  margin-bottom: 8px;
}

.corner-header {
  position: relative;
  height: 40px;
}
.corner-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    transparent 49.5%,
    #dcdfe6 50%,
    transparent 50.5%
  );
}
.corner-title {
  position: absolute;
  font-weight: 600;
  color: #606266;
}
.corner-title.course {
  top: 6px;
  left: 8px;
}
.corner-title.ability {
  right: 8px;
  bottom: 6px;
}

.table-container {
  overflow-x: auto;
  width: 100%;
  scroll-behavior: smooth;
}

/* 隐藏原生滚动条，使用自定义滚动条 */
.table-container {
  overflow-x: auto;
  width: 100%;
  min-width: 100%;
}

/* 隐藏原生滚动条 */
.table-container::-webkit-scrollbar {
  display: none;
}

.table-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.table-container::-webkit-scrollbar-track {
  background: #f0f0f0 !important;
  border-radius: 10px;
  border: 2px solid #e0e0e0;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
  transition: background 0.3s;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 为 Firefox 浏览器提供备用样式 */
.table-container {
  scrollbar-width: thick;
  scrollbar-color: #409eff #f0f0f0;
}

/* 自定义滚动条样式 */
.custom-scrollbar {
  width: 100%;
  height: 20px;
  margin-top: 8px;
}

.scrollbar-track {
  width: 100%;
  height: 20px;
  background: #2c2c2c;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  border: 2px solid #1a1a1a;
}

.scrollbar-thumb {
  height: 16px;
  background: #555555;
  border-radius: 8px;
  position: absolute;
  top: 2px;
  cursor: grab;
  transition: background 0.3s;
  min-width: 20px;
}

.scrollbar-thumb:hover {
  background: #666666;
}

.scrollbar-thumb:active {
  cursor: grabbing;
  background: #777777;
}

.search-bar {
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.grade-form {
  margin-bottom: 0;
}

.grade-form .el-form-item {
  margin-bottom: 0;
  margin-right: 16px;
}

.grade-form .el-form-item__label {
  font-weight: 500;
  color: #606266;
}
</style>
