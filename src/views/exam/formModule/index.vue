<template>
  <div class="form-builder-container">
    <!-- 模块管理区 -->
    <div class="modules-section" v-if="currentFormType">
      <el-card class="modules-card">
        <div slot="header" class="card-header">
          <span>模块管理</span>
          <div class="header-buttons">
            <el-dropdown @command="handleAddModule">
              <el-button type="success" size="small">
                <i class="el-icon-plus"></i> 添加模块<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="1">
                  <i class="el-icon-s-grid"></i> 数据类型（二维数据列表）
                </el-dropdown-item>
                <el-dropdown-item command="2">
                  <i class="el-icon-upload"></i> 文件类型（文件上传）
                </el-dropdown-item>
                <el-dropdown-item command="3">
                  <i class="el-icon-date"></i> 日期选择
                </el-dropdown-item>
                <el-dropdown-item command="4">
                  <i class="el-icon-edit"></i> 文本输入（标签+输入框）
                </el-dropdown-item>
                <el-dropdown-item command="5">
                  <i class="el-icon-check"></i> 单选
                </el-dropdown-item>
                <el-dropdown-item command="6">
                  <i class="el-icon-finished"></i> 勾选矩阵
                </el-dropdown-item>
                <el-dropdown-item command="7">
                  <i class="el-icon-picture"></i> 图片上传
                </el-dropdown-item>
                <el-dropdown-item command="8">
                  <i class="el-icon-s-grid"></i> 父子标题数据列表
                </el-dropdown-item>
                <el-dropdown-item command="9">
                  <i class="el-icon-s-grid"></i> 列父子标题数据列表
                </el-dropdown-item>
                <el-dropdown-item command="9">
                  <i class="el-icon-s-grid"></i> 数据链接模块
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button type="primary" size="small" @click="saveFormData">
              <i class="el-icon-check"></i> 保存表单
            </el-button>
          </div>
        </div>

        <!-- 模块列表 -->
        <div class="modules-list">
          <draggable
            :list="moduleOrder"
            :options="{ animation: 200, handle: '.module-drag-handle' }"
            @end="onModuleDragEnd"
            class="modules-draggable-list"
          >
            <div
              v-for="moduleKey in moduleOrder"
              :key="moduleKey"
              class="module-wrapper"
              v-if="formData[currentFormType] && formData[currentFormType].modules && formData[currentFormType].modules[moduleKey]"
            >
              <!-- 拖拽手柄 -->
              <div class="module-drag-handle">
                <i class="el-icon-rank"></i>
              </div>
              <!-- 内容区域：头部 + 折叠内容纵向排列 -->
              <div class="module-body">
                <div class="module-header-bar">
                  <el-select
                    v-model="formData[currentFormType].modules[moduleKey].type"
                    size="small"
                    class="module-type-select"
                    @change="updateModuleType(moduleKey, formData[currentFormType].modules[moduleKey].type)"
                  >
                    <el-option label="数据类型" :value="1"></el-option>
                    <el-option label="文件类型" :value="2"></el-option>
                    <el-option label="日期选择" :value="3"></el-option>
                    <el-option label="文本输入" :value="4"></el-option>
                    <el-option label="单选" :value="5"></el-option>
                    <el-option label="勾选矩阵" :value="6"></el-option>
                    <el-option label="图片上传" :value="7"></el-option>
                    <el-option label="父子标题数据列表" :value="8"></el-option>
                    <el-option label="列父子标题数据列表" :value="9"></el-option>
                    <el-option label="数据链接模块" :value="10"></el-option>
                  </el-select>
                  <el-input
                    v-model="formData[currentFormType].modules[moduleKey].name"
                    size="small"
                    :placeholder="`模块 ${moduleKey}`"
                    class="module-name-input"
                    @input="updateModuleName(moduleKey, formData[currentFormType].modules[moduleKey].name)"
                  />
                  <el-input
                    v-model="formData[currentFormType].modules[moduleKey].fieldId"
                    size="small"
                    placeholder="字段标识"
                    class="module-field-id-input"
                    @input="updateModuleFieldId(moduleKey, formData[currentFormType].modules[moduleKey].fieldId)"
                  />
                  <el-button
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click="removeModule(moduleKey)"
                  >
                    删除模块
                  </el-button>
                </div>
                
                <!-- 折叠面板（在输入框下方） -->
                <el-collapse v-model="activeModules" class="module-collapse">
                  <el-collapse-item
                    :name="moduleKey"
                    class="module-item"
                  >
                    <template slot="title">
                      <div class="collapse-title">
                        <div class="collapse-arrow" @click.stop="toggleModule(moduleKey)">
                          <i :class="activeModules.includes(moduleKey) ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
                        </div>
                        <span class="collapse-label">模块配置</span>
                      </div>
                    </template>

                  <!-- 模块内容 - 根据类型显示不同内容 -->
                  <div class="module-content">
                      <!-- 类型1: 二维数据列表 -->
                      <div v-if="formData[currentFormType].modules[moduleKey].type === 1" class="module-type-content">
                        <div class="module-settings">
                          <div class="setting-control-group">
                            <el-button
                              type="primary"
                              size="small"
                              icon="el-icon-plus"
                              @click="addRow(moduleKey)"
                            >
                              增加行
                            </el-button>
                            <el-button
                              type="success"
                              size="small"
                              icon="el-icon-plus"
                              @click="addCol(moduleKey)"
                            >
                              增加列
                            </el-button>
                          </div>
                          <div class="setting-control-group">
                            <span class="setting-label">固定行：</span>
                            <el-input-number v-model="formData[currentFormType].modules[moduleKey].fixedRowCount" :min="0" :max="formData[currentFormType].modules[moduleKey].rows" size="mini" />
                            <el-select v-model="formData[currentFormType].modules[moduleKey].fixedRowPosition" size="mini" style="width: 110px;">
                              <el-option label="顶部" value="top" />
                              <el-option label="底部" value="bottom" />
                            </el-select>
                            <span class="setting-label">固定列：</span>
                            <el-input-number v-model="formData[currentFormType].modules[moduleKey].fixedColCount" :min="0" :max="formData[currentFormType].modules[moduleKey].cols" size="mini" />
                            <el-select v-model="formData[currentFormType].modules[moduleKey].fixedColPosition" size="mini" style="width: 110px;">
                              <el-option label="左侧" value="left" />
                              <el-option label="右侧" value="right" />
                            </el-select>
                          </div>
                        </div>

                        <!-- 数据表格 -->
                        <div class="module-table-container">
                          <table class="module-table">
                            <thead>
                              <tr>
                                <th class="corner-cell"></th>
                                <th
                                  v-for="colIndex in formData[currentFormType].modules[moduleKey].cols"
                                  :key="colIndex"
                                  class="col-header"
                                >
                                  <div class="col-header-content">
                                    <el-input
                                      v-model="formData[currentFormType].modules[moduleKey].colHeaders[colIndex - 1]"
                                      size="mini"
                                      :placeholder="`列${colIndex}`"
                                    />
                                    <el-button
                                      type="danger"
                                      size="mini"
                                      icon="el-icon-delete"
                                      circle
                                      :disabled="formData[currentFormType].modules[moduleKey].cols <= 1"
                                      @click="removeColAt(moduleKey, colIndex - 1)"
                                    />
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(rowData, rowIndex) in formData[currentFormType].modules[moduleKey].data" :key="rowIndex">
                                <td class="row-header">
                                  <div class="row-header-content">
                                    <el-input
                                      v-model="formData[currentFormType].modules[moduleKey].rowHeaders[rowIndex]"
                                      size="mini"
                                      :placeholder="`行${rowIndex + 1}`"
                                    />
                                    <el-button
                                      type="danger"
                                      size="mini"
                                      icon="el-icon-delete"
                                      circle
                                      :disabled="formData[currentFormType].modules[moduleKey].rows <= 1"
                                      @click="removeRowAt(moduleKey, rowIndex)"
                                    />
                                  </div>
                                </td>
                                <td
                                  v-for="(cell, colIndex) in rowData"
                                  :key="colIndex"
                                  class="data-cell"
                                >
                                  <el-input
                                    v-model="formData[currentFormType].modules[moduleKey].data[rowIndex][colIndex]"
                                    size="mini"
                                    :placeholder="`字段值`"
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <!-- 类型2: 文件上传 -->
                      <div v-if="formData[currentFormType].modules[moduleKey].type === 2" class="module-type-content">
                        <div class="file-upload-section">
                          <el-upload
                            class="file-uploader"
                            :action="uploadAction"
                            :file-list="formData[currentFormType].modules[moduleKey].data || []"
                            :on-success="(response, file, fileList) => handleFileSuccess(moduleKey, response, file, fileList)"
                            :on-remove="(file, fileList) => handleFileRemove(moduleKey, file, fileList)"
                            :before-upload="beforeFileUpload"
                            multiple
                          >
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">支持多文件上传</div>
                          </el-upload>
                          <div v-if="formData[currentFormType].modules[moduleKey].data && formData[currentFormType].modules[moduleKey].data.length > 0" class="file-list">
                            <div
                              v-for="(file, index) in formData[currentFormType].modules[moduleKey].data"
                              :key="index"
                              class="file-item"
                            >
                              <div class="file-info">
                                <el-input
                                  v-model="file.label"
                                  size="small"
                                  placeholder="文件标签"
                                  class="file-label-input"
                                />
                                <span class="file-name">{{ file.name }}</span>
                              </div>
                              <el-button
                                type="danger"
                                size="mini"
                                icon="el-icon-delete"
                                @click="removeFile(moduleKey, index)"
                              >
                                删除
                              </el-button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 类型3: 日期选择 -->
                      <div v-if="formData[currentFormType].modules[moduleKey].type === 3" class="module-type-content">
                        <div class="date-section">
                          <div
                            v-for="(dateItem, index) in (formData[currentFormType].modules[moduleKey].data || [])"
                            :key="index"
                            class="date-item"
                          >
                            <el-input
                              v-model="dateItem.fieldId"
                              size="small"
                              placeholder="字段标识"
                              class="date-field-id-input"
                            />
                            <el-input
                              v-model="dateItem.label"
                              size="small"
                              placeholder="日期字段名称"
                              class="date-label-input"
                            />
                            <el-date-picker
                              v-model="dateItem.value"
                              type="date"
                              placeholder="选择日期"
                              format="yyyy/MM/dd"
                              value-format="yyyy/MM/dd"
                              size="small"
                              class="date-picker"
                            />
                            <el-button
                              type="danger"
                              size="mini"
                              icon="el-icon-delete"
                              @click="removeDateItem(moduleKey, index)"
                            >
                              删除
                            </el-button>
                          </div>
                          <el-button
                            type="primary"
                            size="small"
                            icon="el-icon-plus"
                            @click="addDateItem(moduleKey)"
                          >
                            添加日期字段
                          </el-button>
                        </div>
                      </div>

                      <!-- 类型4: 标签+输入（自由添加多条，支持单行/多行） -->
                      <div v-if="formData[currentFormType].modules[moduleKey].type === 4" class="module-type-content text-type-content">
                        <div class="text-rows">
                          <div
                            v-for="(textItem, index) in (formData[currentFormType].modules[moduleKey].data || [])"
                            :key="index"
                            class="text-item-inline"
                          >
                            <el-input
                              v-model="textItem.fieldId"
                              size="small"
                              placeholder="字段标识"
                              class="text-field-id-input"
                            />
                            <el-input
                              v-model="textItem.label"
                              size="small"
                              placeholder="标签"
                              class="text-label-input"
                            />
                            <el-select v-model="textItem.inputType" size="small" class="text-type-select">
                              <el-option label="单行" value="text"></el-option>
                              <el-option label="多行" value="textarea"></el-option>
                            </el-select>
                            <el-input
                              v-if="textItem.inputType === 'text'"
                              v-model="textItem.value"
                              size="small"
                              placeholder="默认值"
                              class="text-value-input"
                            />
                            <el-input
                              v-else
                              type="textarea"
                              :autosize="{ minRows: 2, maxRows: 5 }"
                              v-model="textItem.value"
                              size="small"
                              placeholder="默认值"
                              class="text-value-textarea"
                            />
                            <el-button
                              type="danger"
                              size="mini"
                              icon="el-icon-delete"
                              :disabled="formData[currentFormType].modules[moduleKey].data.length <= 1"
                              @click="removeTextItem(moduleKey, index)"
                            />
                          </div>
                        </div>
                        <div class="text-footer-actions">
                          <el-button type="primary" size="small" icon="el-icon-plus" @click="addTextItem(moduleKey)">添加字段</el-button>
                        </div>
                      </div>

                      <!-- 类型5: 单选 -->
                      <div v-if="formData[currentFormType].modules[moduleKey].type === 5" class="module-type-content radio-type-content">
                        <div class="radio-rows">
                          <div
                            v-for="(radioItem, index) in (formData[currentFormType].modules[moduleKey].data || [])"
                            :key="index"
                            class="radio-item-inline"
                          >
                            <el-radio v-model="formData[currentFormType].modules[moduleKey].selected" :label="radioItem.value" />
                            <el-input
                              v-model="radioItem.fieldId"
                              size="small"
                              placeholder="字段标识"
                              class="radio-field-id-input"
                            />
                            <el-input
                              v-model="radioItem.label"
                              size="small"
                              placeholder="选项标签"
                              class="radio-label-input"
                            />
                            <el-input
                              v-model="radioItem.value"
                              size="small"
                              placeholder="选项值"
                              class="radio-value-input"
                            />
                            <el-button
                              type="danger"
                              size="mini"
                              icon="el-icon-delete"
                              :disabled="formData[currentFormType].modules[moduleKey].data.length <= 1"
                              @click="removeRadioItem(moduleKey, index)"
                            />
                          </div>
                        </div>
                        <div class="radio-footer-actions">
                          <el-button type="primary" size="small" icon="el-icon-plus" @click="addRadioItem(moduleKey)">添加选项</el-button>
                        </div>
                      </div>

                      <!-- 类型6: 勾选矩阵 -->
                      <div v-if="formData[currentFormType].modules[moduleKey].type === 6" class="module-type-content">
                        <div class="module-settings">
                          <div class="setting-control-group">
                            <el-button
                              type="primary"
                              size="small"
                              icon="el-icon-plus"
                              @click="addRow(moduleKey)"
                            >
                              增加行
                            </el-button>
                            <el-button
                              type="success"
                              size="small"
                              icon="el-icon-plus"
                              @click="addCol(moduleKey)"
                            >
                              增加列
                            </el-button>
                          </div>
                        </div>

                        <div class="module-table-container">
                          <table class="module-table">
                            <thead>
                              <tr>
                                <th class="corner-cell"></th>
                                <th
                                  v-for="colIndex in formData[currentFormType].modules[moduleKey].cols"
                                  :key="colIndex"
                                  class="col-header"
                                >
                                  <div class="col-header-content">
                                    <el-input
                                      v-model="formData[currentFormType].modules[moduleKey].colHeaders[colIndex - 1]"
                                      size="mini"
                                      :placeholder="`列${colIndex}`"
                                    />
                                    <el-button
                                      type="danger"
                                      size="mini"
                                      icon="el-icon-delete"
                                      circle
                                      :disabled="formData[currentFormType].modules[moduleKey].cols <= 1"
                                      @click="removeColAt(moduleKey, colIndex - 1)"
                                    />
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(rowData, rowIndex) in formData[currentFormType].modules[moduleKey].data" :key="rowIndex">
                                <td class="row-header">
                                  <div class="row-header-content">
                                    <el-input
                                      v-model="formData[currentFormType].modules[moduleKey].rowHeaders[rowIndex]"
                                      size="mini"
                                      :placeholder="`行${rowIndex + 1}`"
                                    />
                                    <el-button
                                      type="danger"
                                      size="mini"
                                      icon="el-icon-delete"
                                      circle
                                      :disabled="formData[currentFormType].modules[moduleKey].rows <= 1"
                                      @click="removeRowAt(moduleKey, rowIndex)"
                                    />
                                  </div>
                                </td>
                                <td
                                  v-for="(cell, colIndex) in rowData"
                                  :key="colIndex"
                                  class="data-cell checkbox-cell"
                                >
                                  <el-checkbox
                                    v-model="formData[currentFormType].modules[moduleKey].data[rowIndex][colIndex]"
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <!-- 类型7: 图片上传 -->
                      <div v-if="formData[currentFormType].modules[moduleKey].type === 7" class="module-type-content">
                        <div class="image-upload-section">
                          <el-upload
                            class="image-uploader"
                            :action="imageUploadAction"
                            list-type="picture-card"
                            :file-list="formData[currentFormType].modules[moduleKey].data || []"
                            :on-success="(response, file, fileList) => handleImageSuccess(moduleKey, response, file, fileList)"
                            :on-remove="(file, fileList) => handleImageRemove(moduleKey, file, fileList)"
                            :before-upload="beforeImageUpload"
                            :on-preview="handleImagePreview"
                            multiple
                          >
                            <i class="el-icon-plus"></i>
                          </el-upload>
                          <el-dialog :visible.sync="imagePreviewVisible" width="800px" append-to-body>
                            <img :src="imagePreviewUrl" style="width: 100%; display: block;" />
                          </el-dialog>
                          <div v-if="formData[currentFormType].modules[moduleKey].data && formData[currentFormType].modules[moduleKey].data.length > 0" class="image-list">
                            <div
                              v-for="(image, index) in formData[currentFormType].modules[moduleKey].data"
                              :key="index"
                              class="image-item"
                            >
                              <el-image
                                :src="image.url"
                                :preview-src-list="formData[currentFormType].modules[moduleKey].data.map(img => img.url)"
                                fit="cover"
                                class="image-preview"
                              />
                              <div class="image-info">
                                <el-input
                                  v-model="image.label"
                                  size="small"
                                  placeholder="图片标签"
                                  class="image-label-input"
                                />
                                <span class="image-name">{{ image.name }}</span>
                              </div>
                              <el-button
                                type="danger"
                                size="mini"
                                icon="el-icon-delete"
                                @click="removeImage(moduleKey, index)"
                              >
                                删除
                              </el-button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 类型8: 父子标题数据列表 -->
                      <div v-if="formData[currentFormType].modules[moduleKey].type === 8" class="module-type-content">
                        <div class="module-settings">
                          <div class="setting-control-group">
                            <el-button
                              type="primary"
                              size="small"
                              icon="el-icon-plus"
                              @click="addParentRow(moduleKey)"
                            >
                              增加课程目标
                            </el-button>
                          </div>
                        </div>

                        <!-- 数据表格 -->
                        <div class="module-table-container">
                          <table class="module-table parent-child-table">
                            <thead>
                              <tr>
                                <th class="parent-col-header">课程目标</th>
                                <th class="child-col-header">考核方式</th>
                                <th class="data-col-header">考核内容与评分方法</th>
                              </tr>
                            </thead>
                            <tbody>
                              <template v-for="(parentRow, parentIndex) in formData[currentFormType].modules[moduleKey].parentRows">
                                <!-- 子标题行 -->
                                <tr v-for="(child, sortedIndex) in getSortedChildren(parentRow.children)" :key="`parent-${parentIndex}-child-${sortedIndex}-${child.child}`">
                                  <!-- 父标题列（只在第一个子标题行显示，使用rowspan） -->
                                  <td v-if="sortedIndex === 0" class="parent-header" :rowspan="(parentRow.children && parentRow.children.length > 0 ? parentRow.children.length : 1)">
                                    <div class="parent-header-content">
                                      <el-input
                                        v-model="parentRow.parent"
                                        size="small"
                                        placeholder="课程目标"
                                        class="parent-input"
                                      />
                                      <el-button
                                        type="danger"
                                        size="mini"
                                        icon="el-icon-delete"
                                        @click="removeParentRow(moduleKey, parentIndex)"
                                      >
                                        删除
                                      </el-button>
                                    </div>
                                  </td>
                                  <!-- 子标题列 -->
                                  <td class="child-header">
                                    <div class="child-header-content">
                                      <el-input
                                        v-model="child.child"
                                        size="small"
                                        placeholder="考核方式"
                                        class="child-input"
                                      />
                                      <el-button
                                        type="danger"
                                        size="mini"
                                        icon="el-icon-delete"
                                        circle
                                          :disabled="!parentRow.children || parentRow.children.length <= 1 || child.child === '分析'"
                                          @click="removeChildColByChild(moduleKey, parentIndex, child)"
                                      />
                                    </div>
                                  </td>
                                  <!-- 数据列 -->
                                  <td class="data-cell">
                                    <el-input
                                      type="textarea"
                                      :autosize="{ minRows: 3, maxRows: 8 }"
                                      v-model="child.value"
                                      size="small"
                                      placeholder="考核内容与评分方法"
                                    />
                                  </td>
                                </tr>
                                <!-- 如果没有子标题，显示父标题和添加按钮 -->
                                <tr v-if="!parentRow.children || parentRow.children.length === 0" :key="`parent-${parentIndex}-empty`" class="add-child-row">
                                  <td class="parent-header">
                                    <div class="parent-header-content">
                                      <el-input
                                        v-model="parentRow.parent"
                                        size="small"
                                        placeholder="课程目标"
                                        class="parent-input"
                                      />
                                      <el-button
                                        type="danger"
                                        size="mini"
                                        icon="el-icon-delete"
                                        @click="removeParentRow(moduleKey, parentIndex)"
                                      >
                                        删除
                                      </el-button>
                                    </div>
                                  </td>
                                  <td colspan="2" class="add-child-cell">
                                    <el-button
                                      type="success"
                                      size="small"
                                      icon="el-icon-plus"
                                      @click="addChildCol(moduleKey, parentIndex)"
                                    >
                                      添加考核方式
                                    </el-button>
                                  </td>
                                </tr>
                                <!-- 如果有子标题，显示添加按钮行 -->
                                <tr v-else :key="`parent-${parentIndex}-add`" class="add-child-row">
                                  <td colspan="3" class="add-child-cell">
                                    <el-button
                                      type="success"
                                      size="small"
                                      icon="el-icon-plus"
                                      @click="addChildCol(moduleKey, parentIndex)"
                                    >
                                      添加考核方式
                                    </el-button>
                                  </td>
                                </tr>
                              </template>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <!-- 类型9: 列父子标题数据列表 -->
                      <div v-if="formData[currentFormType].modules[moduleKey].type === 9" class="module-type-content">
                        <div class="module-settings">
                          <div class="setting-control-group">
                            <el-button
                              type="primary"
                              size="small"
                              icon="el-icon-plus"
                              @click="addRow(moduleKey)"
                            >
                              增加行
                            </el-button>
                            <el-button
                              type="success"
                              size="small"
                              icon="el-icon-plus"
                              @click="addColParent(moduleKey)"
                            >
                              增加列父标题
                            </el-button>
                          </div>
                        </div>

                        <!-- 数据表格 -->
                        <div class="module-table-container">
                          <table class="module-table col-parent-child-table">
                            <thead>
                              <!-- 第一行：列父标题 -->
                              <tr>
                                <th class="corner-cell" rowspan="2">课程目标</th>
                                <template v-for="(colParent, colParentIndex) in formData[currentFormType].modules[moduleKey].colParents">
                                  <th
                                    v-if="colParent.children && colParent.children.length > 0"
                                    :key="`colParent-${colParentIndex}`"
                                    class="col-parent-header"
                                    :colspan="colParent.children.length"
                                  >
                                    <div class="col-parent-header-content">
                                      <el-input
                                        v-model="colParent.parent"
                                        size="small"
                                        placeholder="列父标题"
                                        class="col-parent-input"
                                      />
                                      <el-button
                                        type="danger"
                                        size="mini"
                                        icon="el-icon-delete"
                                        @click="removeColParent(moduleKey, colParentIndex)"
                                      >
                                        删除
                                      </el-button>
                                    </div>
                                  </th>
                                </template>
                              </tr>
                              <!-- 第二行：列子标题 -->
                              <tr>
                                <template v-for="(colParent, colParentIndex) in formData[currentFormType].modules[moduleKey].colParents">
                                  <th
                                    v-for="(colChild, colChildIndex) in getSortedColChildren(colParent.children)"
                                    :key="`colParent-${colParentIndex}-colChild-${colChildIndex}-${colChild.child}`"
                                    class="col-child-header"
                                  >
                                    <div class="col-child-header-content">
                                      <el-input
                                        type="textarea"
                                        :autosize="{ minRows: 2, maxRows: 4 }"
                                        v-model="colChild.child"
                                        size="small"
                                        placeholder="列子标题"
                                        class="col-child-input"
                                      />
                                      <el-button
                                        type="danger"
                                        size="mini"
                                        icon="el-icon-delete"
                                        circle
                                        :disabled="!colParent.children || colParent.children.length <= 1"
                                        @click="removeColChildByChild(moduleKey, colParentIndex, colChild)"
                                      />
                                    </div>
                                  </th>
                                </template>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(rowData, rowIndex) in formData[currentFormType].modules[moduleKey].data" :key="rowIndex">
                                <td class="row-header">
                                  <div class="row-header-content">
                                    <el-input
                                      v-model="formData[currentFormType].modules[moduleKey].rowHeaders[rowIndex]"
                                      size="small"
                                      placeholder="课程目标"
                                    />
                                    <el-button
                                      type="danger"
                                      size="mini"
                                      icon="el-icon-delete"
                                      circle
                                      :disabled="formData[currentFormType].modules[moduleKey].rows <= 1"
                                      @click="removeRowAt(moduleKey, rowIndex)"
                                    />
                                  </div>
                                </td>
                                <template v-for="(colParent, colParentIndex) in formData[currentFormType].modules[moduleKey].colParents">
                                  <td
                                    v-for="(colChild, colChildIndex) in getSortedColChildren(colParent.children)"
                                    :key="`row-${rowIndex}-colParent-${colParentIndex}-colChild-${colChildIndex}`"
                                    class="data-cell"
                                  >
                                    <el-input
                                      type="textarea"
                                      :autosize="{ minRows: 3, maxRows: 8 }"
                                      :value="getCellValue(moduleKey, rowIndex, colParentIndex, colChildIndex)"
                                      size="small"
                                      placeholder="数据值"
                                      @input="setCellValue(moduleKey, rowIndex, colParentIndex, colChildIndex, $event)"
                                    />
                                  </td>
                                </template>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <!-- 添加列子标题按钮区域 -->
                        <div class="col-child-actions">
                          <div
                            v-for="(colParent, colParentIndex) in formData[currentFormType].modules[moduleKey].colParents"
                            :key="`colParent-${colParentIndex}-actions`"
                            class="col-child-action-item"
                          >
                            <span class="col-parent-label">{{ colParent.parent || `列父标题${colParentIndex + 1}` }}</span>
                            <el-button
                              type="success"
                              size="small"
                              icon="el-icon-plus"
                              @click="addColChild(moduleKey, colParentIndex)"
                            >
                              添加列子标题
                            </el-button>
                          </div>
                        </div>
                      </div>

                      <!-- 类型10: 数据链接模块 -->
                      <div v-if="formData[currentFormType].modules[moduleKey].type === 10" class="module-type-content">
                        <div class="data-link-section">
                          <el-input
                            v-model="formData[currentFormType].modules[moduleKey].data.link"
                            size="small"
                            placeholder="数据链接地址"
                            class="data-link-input"
                          />
                        </div>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </draggable>
        </div>
      </el-card>
    </div>
    <!-- 右下角悬浮操作条：始终可见 -->
    <div class="floating-action-bar" v-if="currentFormType">
      <el-dropdown @command="handleAddModule">
        <el-button type="success" size="small">
          <i class="el-icon-plus"></i> 添加模块<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="1">
            <i class="el-icon-s-grid"></i> 数据类型（二维数据列表）
          </el-dropdown-item>
          <el-dropdown-item command="2">
            <i class="el-icon-upload"></i> 文件类型（文件上传）
          </el-dropdown-item>
          <el-dropdown-item command="3">
            <i class="el-icon-date"></i> 日期选择
          </el-dropdown-item>
          <el-dropdown-item command="4">
            <i class="el-icon-edit"></i> 文本输入（标签+输入框）
          </el-dropdown-item>
          <el-dropdown-item command="5">
            <i class="el-icon-check"></i> 单选
          </el-dropdown-item>
          <el-dropdown-item command="6">
            <i class="el-icon-finished"></i> 勾选矩阵
          </el-dropdown-item>
          <el-dropdown-item command="7">
            <i class="el-icon-picture"></i> 图片上传
          </el-dropdown-item>
          <el-dropdown-item command="8">
            <i class="el-icon-s-grid"></i> 父子标题数据列表
          </el-dropdown-item>
          <el-dropdown-item command="9">
            <i class="el-icon-s-grid"></i> 列父子标题数据列表
          </el-dropdown-item>
          <el-dropdown-item command="10">
            <i class="el-icon-s-grid"></i> 数据链接模块
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button type="primary" size="small" @click="saveFormData">
        <i class="el-icon-check"></i> 保存表单
      </el-button>
    </div>
  </div>
</template>

<script>
import { getFormModule, saveFormModules } from '@/api/exam/formModule'
import draggable from 'vuedraggable'

export default {
  name: 'DynamicFormBuilder',
  components: {
    draggable
  },
  data() {
    return {
      currentFormType: '',
      activeModules: [],
      // 数据结构：表单key -> 模块key -> 字段数据
      formData: {},
      formId: null,
      loading: false,
      uploadAction: '/api/upload', // 文件上传地址，需要根据实际情况修改
      imageUploadAction: process.env.VUE_APP_BASE_API + '/common/upload', // 图片上传地址
      showAddModuleDialog: false,
      newModuleType: 1,
      // 模块顺序数组，存储模块的 key，用于控制显示顺序
      moduleOrder: [],
      imagePreviewVisible: false,
      imagePreviewUrl: ''
    }
  },
  mounted() {
    this.loadFormData()
  },
  methods: {
    // 类型8: 获取排序后的子标题列表（"分析"始终在最后）
    getSortedChildren(children) {
      if (!Array.isArray(children) || children.length === 0) {
        return []
      }
      // 分离"分析"和其他子标题
      const analysisChild = children.find(item => item.child === '分析')
      const otherChildren = children.filter(item => item.child !== '分析')
      // 先返回其他子标题，最后返回"分析"
      return analysisChild ? [...otherChildren, analysisChild] : otherChildren
    },
    // 生成模块唯一标识
    generateModuleFieldId(moduleType) {
      const typeMap = { 1: 'table', 2: 'file', 3: 'date', 4: 'text', 5: 'radio', 6: 'checkbox', 7: 'image', 8: 'parent_child_table', 9: 'col_parent_child_table' }
      const typePrefix = typeMap[moduleType] || 'module'
      const existingIds = []
      if (this.currentFormType && this.formData[this.currentFormType]) {
        Object.values(this.formData[this.currentFormType].modules || {}).forEach(m => {
          if (m.fieldId) existingIds.push(m.fieldId)
        })
      }
      let num = 1
      let fieldId = `${typePrefix}_${num}`
      while (existingIds.includes(fieldId)) {
        num++
        fieldId = `${typePrefix}_${num}`
      }
      return fieldId
    },
    // 生成字段唯一标识
    generateFieldId(module, fieldType = 'field') {
      const existingIds = []
      if (module.data && Array.isArray(module.data)) {
        module.data.forEach(item => {
          if (item.fieldId) existingIds.push(item.fieldId)
        })
      }
      let num = 1
      let fieldId = `${fieldType}_${num}`
      while (existingIds.includes(fieldId)) {
        num++
        fieldId = `${fieldType}_${num}`
      }
      return fieldId
    },
    // 更新模块字段标识
    updateModuleFieldId(moduleKey, fieldId) {
      this.formData[this.currentFormType].modules[moduleKey].fieldId = fieldId
    },
    // 从后端加载表单数据
    async loadFormData() {
      const route = this.$route || {}
      const formId =
        (route.params && route.params.formId) ||
        (route.query && route.query.formId) ||
        1

      this.formId = formId
      this.loading = true

      try {
        const response = await getFormModule(formId)
        const payload = (response && response.data) || {}

        if (!payload || Object.keys(payload).length === 0) {
          this.formData = {}
          this.currentFormType = ''
          this.activeModules = []
          this.$message.warning('暂无表单模块数据')
          return
        }

        this.buildFormDataFromResponse(payload)
      } catch (error) {
        console.error('获取表单数据失败:', error)
        this.$message.error('获取表单数据失败')
        this.formData = {}
        this.currentFormType = ''
        this.activeModules = []
      } finally {
        this.loading = false
      }
    },
    // 构建前端所需的数据结构
    buildFormDataFromResponse(form = {}) {
      const formKey = `form_${this.formId}`
      const moduleEntries = form.modules || {}
      const modules = {}

      Object.keys(moduleEntries).forEach(moduleKey => {
        const moduleData = moduleEntries[moduleKey]
        // 从后端返回的数据中获取模块ID（后端生成）
        const moduleId = moduleData.id || null

        const normalizedModule = this.normalizeModule(moduleData)
        // 保存模块ID到模块数据中，以便后续保存时使用（由后端生成）
        normalizedModule._moduleId = moduleId

        // 使用模块ID作为key，如果没有ID则使用临时key（新模块）
        const finalModuleKey = moduleId ? `module_${moduleId}` : moduleKey
        modules[finalModuleKey] = normalizedModule
      })

      this.$set(this.formData, formKey, {
        name: form.name || formKey,
        modules
      })

      this.currentFormType = formKey
      this.activeModules = Object.keys(modules)
      // 初始化模块顺序数组
      this.moduleOrder = Object.keys(modules)
    },
    // 规范化模块数据
    normalizeModule(module = {}) {
      const moduleType = module.type || 1 // 默认为数据类型

      // 类型1: 二维数据列表
      if (moduleType === 1 || moduleType === 6) {
        const rowHeaders = Array.isArray(module.rowHeaders) ? [...module.rowHeaders] : []
        const colHeaders = Array.isArray(module.colHeaders) ? [...module.colHeaders] : []
        const rawData = Array.isArray(module.data) ? module.data : []

        const rows = module.rows || rowHeaders.length || rawData.length
        const cols =
          module.cols ||
          colHeaders.length ||
          (rawData[0] ? rawData[0].length : 0)

        while (rowHeaders.length < rows) {
          rowHeaders.push(`行${rowHeaders.length + 1}`)
        }
        if (rowHeaders.length > rows) {
          rowHeaders.splice(rows)
        }

        while (colHeaders.length < cols) {
          colHeaders.push(`列${colHeaders.length + 1}`)
        }
        if (colHeaders.length > cols) {
          colHeaders.splice(cols)
        }

        const data = []
        for (let i = 0; i < rows; i++) {
          const row = Array.isArray(rawData[i]) ? [...rawData[i]] : []
          while (row.length < cols) {
            row.push(moduleType === 6 ? false : '')
          }
          if (row.length > cols) {
            row.splice(cols)
          }
          data.push(row)
        }

        return {
          name: module.name || '',
          type: moduleType,
          rows,
          cols,
          rowHeaders,
          colHeaders,
          data,
          fixedRowCount: moduleType === 1 ? (module.fixedRowCount || 0) : 0,
          fixedRowPosition: moduleType === 1 ? (module.fixedRowPosition || 'top') : 'top',
          fixedColCount: moduleType === 1 ? (module.fixedColCount || 0) : 0,
          fixedColPosition: moduleType === 1 ? (module.fixedColPosition || 'left') : 'left',
          fieldId: module.fieldId || this.generateModuleFieldId(moduleType)
        }
      }

      // 类型2: 文件上传
      if (moduleType === 2) {
        return {
          name: module.name || '',
          type: 2,
          data: Array.isArray(module.data) ? [...module.data] : [],
          fieldId: module.fieldId || this.generateModuleFieldId(2)
        }
      }

      // 类型7: 图片上传
      if (moduleType === 7) {
        return {
          name: module.name || '',
          type: 7,
          data: Array.isArray(module.data) ? [...module.data] : [],
          fieldId: module.fieldId || this.generateModuleFieldId(7)
        }
      }

      // 类型8: 父子标题数据列表
      if (moduleType === 8) {
        // 处理父子标题结构：parentRows 数组，每个元素包含 parent 和 children
        let parentRows = Array.isArray(module.parentRows) ? [...module.parentRows] : []
        
        // 向后兼容：如果数据是旧格式，转换为新格式
        if (parentRows.length === 0 && module.rowHeaders && Array.isArray(module.rowHeaders)) {
          // 旧格式：rowHeaders 和 data，转换为新格式
          parentRows = module.rowHeaders.map((rowHeader, index) => {
            const parent = typeof rowHeader === 'string' ? rowHeader : (rowHeader.parent || rowHeader.line1 || `课程目标${index + 1}`)
            const children = []
            if (module.data && module.data[index]) {
              // 如果有列标题，使用列标题作为子标题
              if (module.colHeaders && module.colHeaders.length > 0) {
                module.colHeaders.forEach((colHeader, colIndex) => {
                  children.push({
                    child: colHeader,
                    value: module.data[index][colIndex] || ''
                  })
                })
              } else {
                // 如果没有列标题，创建一个默认子标题
                children.push({
                  child: '平时考核',
                  value: module.data[index][0] || ''
                })
              }
            } else {
              // 默认创建一个子标题
              children.push({
                child: '平时考核',
                value: ''
              })
            }
            return { parent, children }
          })
        }
        
        // 确保至少有一个父标题行
        if (parentRows.length === 0) {
          parentRows = [{
            parent: '课程目标1',
            children: this.ensureAnalysisChild([{
              child: '平时考核',
              value: ''
            }])
          }]
        }
        
        // 确保每个父标题至少有一个子标题，并且"分析"在最后
        parentRows = parentRows.map(row => {
          if (!row.children || row.children.length === 0) {
            row.children = [{ child: '平时考核', value: '' }]
          }
          // 确保"分析"子标题在最后
          row.children = this.ensureAnalysisChild(row.children)
          return row
        })

        return {
          name: module.name || '',
          type: 8,
          parentRows: parentRows,
          fieldId: module.fieldId || this.generateModuleFieldId(8)
        }
      }

      // 类型9: 列父子标题数据列表
      if (moduleType === 9) {
        // 处理列父子标题结构：colParents 数组，每个元素包含 parent 和 children
        let colParents = Array.isArray(module.colParents) ? [...module.colParents] : []
        
        // 向后兼容：如果数据是旧格式，转换为新格式
        if (colParents.length === 0 && module.colHeaders && Array.isArray(module.colHeaders)) {
          // 旧格式：colHeaders 和 data，转换为新格式
          colParents = module.colHeaders.map((colHeader, index) => {
            const parent = typeof colHeader === 'string' ? colHeader : (colHeader.parent || colHeader.line1 || `列父标题${index + 1}`)
            const children = []
            if (module.data && module.data[0]) {
              // 使用第一行数据作为参考
              children.push({
                child: '列子标题1',
                value: ''
              })
            } else {
              children.push({
                child: '列子标题1',
                value: ''
              })
            }
            return { parent, children }
          })
        }
        
        // 确保至少有一个列父标题
        if (colParents.length === 0) {
          colParents = [{
            parent: '列父标题1',
            children: [{
              child: '列子标题1',
              value: ''
            }]
          }]
        }
        
        // 确保每个列父标题至少有一个子标题
        colParents = colParents.map(colParent => {
          if (!colParent.children || colParent.children.length === 0) {
            colParent.children = [{ child: '列子标题1', value: '' }]
          }
          return colParent
        })

        // 处理行标题和数据
        const rowHeaders = Array.isArray(module.rowHeaders) ? [...module.rowHeaders] : []
        const rawData = Array.isArray(module.data) ? module.data : []
        
        // 计算总列数（所有列父标题的子标题数量之和）
        const totalCols = colParents.reduce((sum, colParent) => {
          return sum + (colParent.children ? colParent.children.length : 0)
        }, 0)
        
        const rows = module.rows || rowHeaders.length || rawData.length || 3

        while (rowHeaders.length < rows) {
          // 类型9：使用数字格式（1, 2, 3...）
          rowHeaders.push(`${rowHeaders.length + 1}`)
        }
        if (rowHeaders.length > rows) {
          rowHeaders.splice(rows)
        }

        // 初始化数据矩阵
        const data = []
        for (let i = 0; i < rows; i++) {
          const row = []
          for (let j = 0; j < totalCols; j++) {
            row.push(rawData[i] && rawData[i][j] !== undefined ? rawData[i][j] : '')
          }
          data.push(row)
        }

        return {
          name: module.name || '',
          type: 9,
          rows,
          rowHeaders,
          colParents: colParents,
          data: data,
          fieldId: module.fieldId || this.generateModuleFieldId(9)
        }
      }

      // 类型3: 日期选择
      if (moduleType === 3) {
        const dateData = Array.isArray(module.data)
          ? module.data.map((item, idx) => {
              // 如果 fieldId 为空或无效，生成一个唯一的标识
              let fieldId = item.fieldId && item.fieldId.trim() ? item.fieldId.trim() : null
              if (!fieldId) {
                // 生成唯一的 fieldId
                const existingIds = module.data
                  .filter((d, i) => i < idx && d.fieldId && d.fieldId.trim())
                  .map(d => d.fieldId.trim())
                let num = 1
                fieldId = `date_${num}`
                while (existingIds.includes(fieldId)) {
                  num++
                  fieldId = `date_${num}`
                }
              }
              return {
                fieldId: fieldId,
                label: item.label || '',
                value: item.value || null
              }
            })
          : []
        return {
          name: module.name || '',
          type: 3,
          data: dateData,
          fieldId: module.fieldId && module.fieldId.trim() ? module.fieldId.trim() : this.generateModuleFieldId(3)
        }
      }

      // 类型4: 标签+输入
      if (moduleType === 4) {
        const rows = Array.isArray(module.data)
          ? module.data.map((item, idx) => {
              // 如果 fieldId 为空或无效，生成一个唯一的标识
              let fieldId = item.fieldId && item.fieldId.trim() ? item.fieldId.trim() : null
              if (!fieldId) {
                // 生成唯一的 fieldId
                const existingIds = module.data
                  .filter((d, i) => i < idx && d.fieldId && d.fieldId.trim())
                  .map(d => d.fieldId.trim())
                let num = 1
                fieldId = `text_${num}`
                while (existingIds.includes(fieldId)) {
                  num++
                  fieldId = `text_${num}`
                }
              }
              return {
                fieldId: fieldId,
                label: item.label || '标签',
                value: item.value || '',
                inputType: item.inputType || 'text'
              }
            })
          : [{ fieldId: 'text_1', label: '标签', value: '', inputType: 'text' }]
        return {
          name: module.name || '',
          type: 4,
          data: rows,
          fieldId: module.fieldId && module.fieldId.trim() ? module.fieldId.trim() : this.generateModuleFieldId(4)
        }
      }

      // 类型5: 单选
      if (moduleType === 5) {
        const options = Array.isArray(module.data)
          ? module.data.map((item, idx) => {
              // 如果 fieldId 为空或无效，生成一个唯一的标识
              let fieldId = item.fieldId && item.fieldId.trim() ? item.fieldId.trim() : null
              if (!fieldId) {
                // 生成唯一的 fieldId
                const existingIds = module.data
                  .filter((d, i) => i < idx && d.fieldId && d.fieldId.trim())
                  .map(d => d.fieldId.trim())
                let num = 1
                fieldId = `radio_${num}`
                while (existingIds.includes(fieldId)) {
                  num++
                  fieldId = `radio_${num}`
                }
              }
              return {
                fieldId: fieldId,
                label: item.label || '选项',
                value: item.value || '',
              }
            })
          : [{ fieldId: 'radio_1', label: '选项1', value: 'opt1' }]
        return {
          name: module.name || '',
          type: 5,
          data: options,
          selected: module.selected || (options[0] ? options[0].value : ''),
          fieldId: module.fieldId && module.fieldId.trim() ? module.fieldId.trim() : this.generateModuleFieldId(5)
        }
      }

      // 类型10: 数据链接模块
      if (moduleType === 10) {
        return {
          name: module.name || '',
          type: 10,
          data: {
            link: (module.data && module.data.link) || ''
          },
          fieldId: module.fieldId && module.fieldId.trim() ? module.fieldId.trim() : this.generateModuleFieldId(10)
        }
      }

      // 默认返回数据类型
      return {
        name: module.name || '',
        type: 1,
        rows: 3,
        cols: 3,
        rowHeaders: ['行1', '行2', '行3'],
        colHeaders: ['列1', '列2', '列3'],
        data: [
          ['', '', ''],
          ['', '', ''],
          ['', '', '']
        ]
      }
    },
    // 处理添加模块（从下拉菜单调用）
    handleAddModule(command) {
      const moduleType = parseInt(command)
      this.addModule(moduleType)
    },
    // 添加模块
    addModule(moduleType = 1) {
      if (!this.currentFormType) {
        this.$message.warning('表单数据未加载')
        return
      }
      if (!this.formData[this.currentFormType]) {
        this.$set(this.formData, this.currentFormType, { name: '', modules: {} })
      }
      if (!this.formData[this.currentFormType].modules) {
        this.$set(this.formData[this.currentFormType], 'modules', {})
      }

      const moduleKey = `temp_module_${Date.now()}`
      let module = {}

      if (moduleType === 1) {
        // 数据类型
        module = {
          name: `模块${Object.keys(this.formData[this.currentFormType].modules).length + 1}`,
          type: 1,
          rows: 3,
          cols: 3,
          rowHeaders: ['行1', '行2', '行3'],
          colHeaders: ['列1', '列2', '列3'],
          data: [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
          ],
          fixedRowCount: 0,
          fixedRowPosition: 'top',
          fixedColCount: 0,
          fixedColPosition: 'left',
          fieldId: this.generateModuleFieldId(1),
          _moduleId: null
        }
      } else if (moduleType === 2) {
        // 文件类型
        module = {
          name: `模块${Object.keys(this.formData[this.currentFormType].modules).length + 1}`,
          type: 2,
          data: [],
          fieldId: this.generateModuleFieldId(2),
          _moduleId: null
        }
      } else if (moduleType === 3) {
        // 日期选择
        module = {
          name: `模块${Object.keys(this.formData[this.currentFormType].modules).length + 1}`,
          type: 3,
          data: [{ fieldId: 'date_1', label: '', value: null }],
          fieldId: this.generateModuleFieldId(3),
          _moduleId: null
        }
      } else if (moduleType === 4) {
        // 文本输入
        module = {
          name: `模块${Object.keys(this.formData[this.currentFormType].modules).length + 1}`,
          type: 4,
          data: [{ fieldId: 'text_1', label: '标签', value: '', inputType: 'text' }],
          fieldId: this.generateModuleFieldId(4),
          _moduleId: null
        }
      } else if (moduleType === 5) {
        // 单选
        module = {
          name: `模块${Object.keys(this.formData[this.currentFormType].modules).length + 1}`,
          type: 5,
          data: [
            { fieldId: 'radio_1', label: '选项1', value: 'opt1' },
            { fieldId: 'radio_2', label: '选项2', value: 'opt2' }
          ],
          selected: 'opt1',
          fieldId: this.generateModuleFieldId(5),
          _moduleId: null
        }
      } else if (moduleType === 6) {
        // 勾选矩阵
        module = {
          name: `模块${Object.keys(this.formData[this.currentFormType].modules).length + 1}`,
          type: 6,
          rows: 3,
          cols: 3,
          rowHeaders: ['行1', '行2', '行3'],
          colHeaders: ['列1', '列2', '列3'],
          data: [
            [false, false, false],
            [false, false, false],
            [false, false, false]
          ],
          fieldId: this.generateModuleFieldId(6),
          _moduleId: null
        }
      } else if (moduleType === 7) {
        // 图片上传
        module = {
          name: `模块${Object.keys(this.formData[this.currentFormType].modules).length + 1}`,
          type: 7,
          data: [],
          fieldId: this.generateModuleFieldId(7),
          _moduleId: null
        }
      } else if (moduleType === 8) {
        // 父子标题数据列表
        module = {
          name: `模块${Object.keys(this.formData[this.currentFormType].modules).length + 1}`,
          type: 8,
          parentRows: [
            {
              parent: '课程目标1',
              children: this.ensureAnalysisChild([
                { child: '平时考核', value: '' },
                { child: '期末考试', value: '' }
              ])
            },
            {
              parent: '课程目标2',
              children: this.ensureAnalysisChild([
                { child: '平时考核', value: '' }
              ])
            }
          ],
          fieldId: this.generateModuleFieldId(8),
          _moduleId: null
        }
      } else if (moduleType === 9) {
        // 列父子标题数据列表
        const colParents = [
          {
            parent: '列父标题1',
            children: [
              { child: '列子标题1', value: '' },
              { child: '列子标题2', value: '' }
            ]
          },
          {
            parent: '列父标题2',
            children: [
              { child: '列子标题1', value: '' }
            ]
          }
        ]
        const totalCols = colParents.reduce((sum, cp) => sum + cp.children.length, 0)
        module = {
          name: `模块${Object.keys(this.formData[this.currentFormType].modules).length + 1}`,
          type: 9,
          rows: 3,
          rowHeaders: ['1', '2', '3'],
          colParents: colParents,
          data: [
            Array(totalCols).fill(''),
            Array(totalCols).fill(''),
            Array(totalCols).fill('')
          ],
          fieldId: this.generateModuleFieldId(9),
          _moduleId: null
        }
      } else if (moduleType === 10) {
        // 数据链接模块
        module = {
          name: `模块${Object.keys(this.formData[this.currentFormType].modules).length + 1}`,
          type: 10,
          data: {
            link: ''
          },
          fieldId: this.generateModuleFieldId(10),
          _moduleId: null
        }
      } 

      console.log('添加模块:', moduleKey, module)

      this.$set(this.formData[this.currentFormType].modules, moduleKey, module)
      this.activeModules = Object.keys(this.formData[this.currentFormType].modules)
      // 将新模块添加到顺序数组的末尾
      if (!this.moduleOrder.includes(moduleKey)) {
        this.moduleOrder.push(moduleKey)
      }
    },
    // 删除模块
    removeModule(moduleKey) {
      this.$confirm('确认删除该模块吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$delete(this.formData[this.currentFormType].modules, moduleKey)
        const modules = this.formData[this.currentFormType].modules
        this.activeModules = Object.keys(modules)
        // 从顺序数组中移除
        const orderIndex = this.moduleOrder.indexOf(moduleKey)
        if (orderIndex > -1) {
          this.moduleOrder.splice(orderIndex, 1)
        }
        this.$message.success('模块删除成功')
      }).catch(() => {})
    },
    // 模块拖拽结束事件
    onModuleDragEnd() {
      // 拖拽结束后，moduleOrder 已经自动更新，这里可以做一些额外的处理
      // 比如保存顺序到后端（如果需要的话）
    },
    // 切换模块展开/收起
    toggleModule(moduleKey) {
      const index = this.activeModules.indexOf(moduleKey)
      if (index > -1) {
        // 如果已展开，则收起
        this.activeModules.splice(index, 1)
      } else {
        // 如果已收起，则展开
        this.activeModules.push(moduleKey)
      }
    },
    // 更新模块名称
    updateModuleName(moduleKey, name) {
      this.formData[this.currentFormType].modules[moduleKey].name = name
    },
    // 更新模块类型
    updateModuleType(moduleKey, newType) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      const oldType = module.type || 1

      if (oldType === newType) {
        return
      }

      // 切换类型时重置数据结构
      if (newType === 1) {
        // 切换到数据类型
        module.rows = 3
        module.cols = 3
        module.rowHeaders = ['行1', '行2', '行3']
        module.colHeaders = ['列1', '列2', '列3']
        module.data = [
          ['', '', ''],
          ['', '', ''],
          ['', '', '']
        ]
        module.fixedRowCount = module.fixedRowCount || 0
        module.fixedRowPosition = module.fixedRowPosition || 'top'
        module.fixedColCount = module.fixedColCount || 0
        module.fixedColPosition = module.fixedColPosition || 'left'
        if (!module.fieldId) {
          module.fieldId = this.generateModuleFieldId(1)
        }
      } else if (newType === 2) {
        // 切换到文件类型
        module.data = []
        if (!module.fieldId) {
          module.fieldId = this.generateModuleFieldId(2)
        }
      } else if (newType === 3) {
        // 切换到日期选择
        module.data = [{ fieldId: 'date_1', label: '', value: null }]
        if (!module.fieldId) {
          module.fieldId = this.generateModuleFieldId(3)
        }
      } else if (newType === 4) {
        // 切换到文本输入
        module.data = [{ fieldId: 'text_1', label: '标签', value: '', inputType: 'text' }]
        if (!module.fieldId) {
          module.fieldId = this.generateModuleFieldId(4)
        }
      } else if (newType === 5) {
        // 切换到单选
        module.data = [
          { fieldId: 'radio_1', label: '选项1', value: 'opt1' },
          { fieldId: 'radio_2', label: '选项2', value: 'opt2' }
        ]
        module.selected = 'opt1'
        if (!module.fieldId) {
          module.fieldId = this.generateModuleFieldId(5)
        }
      } else if (newType === 6) {
        // 切换到勾选矩阵
        module.rows = 3
        module.cols = 3
        module.rowHeaders = ['行1', '行2', '行3']
        module.colHeaders = ['列1', '列2', '列3']
        module.data = [
          [false, false, false],
          [false, false, false],
          [false, false, false]
        ]
        if (!module.fieldId) {
          module.fieldId = this.generateModuleFieldId(6)
        }
      } else if (newType === 7) {
        // 切换到图片上传
        module.data = []
        if (!module.fieldId) {
          module.fieldId = this.generateModuleFieldId(7)
        }
      } else if (newType === 8) {
        // 切换到父子标题数据列表
        module.parentRows = [
          {
            parent: '课程目标1',
            children: this.ensureAnalysisChild([
              { child: '平时考核', value: '' },
              { child: '期末考试', value: '' }
            ])
          },
          {
            parent: '课程目标2',
            children: this.ensureAnalysisChild([
              { child: '平时考核', value: '' }
            ])
          }
        ]
        if (!module.fieldId) {
          module.fieldId = this.generateModuleFieldId(8)
        }
      } else if (newType === 9) {
        // 切换到列父子标题数据列表
        const colParents = [
          {
            parent: '列父标题1',
            children: [
              { child: '列子标题1', value: '' },
              { child: '列子标题2', value: '' }
            ]
          },
          {
            parent: '列父标题2',
            children: [
              { child: '列子标题1', value: '' }
            ]
          }
        ]
        const totalCols = colParents.reduce((sum, cp) => sum + cp.children.length, 0)
        module.rows = 3
        module.rowHeaders = ['1', '2', '3']
        module.colParents = colParents
        module.data = [
          Array(totalCols).fill(''),
          Array(totalCols).fill(''),
          Array(totalCols).fill('')
        ]
        if (!module.fieldId) {
          module.fieldId = this.generateModuleFieldId(9)
        }
      }

      module.type = newType
    },
    // 更新模块矩阵（行列数变化时）
    updateModuleMatrix(moduleKey) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      const oldRows = module.data.length
      const oldCols = module.data[0] ? module.data[0].length : 0
      const newRows = module.rows
      const newCols = module.cols

      // 调整行数
      if (newRows > oldRows) {
        // 增加行
        for (let i = oldRows; i < newRows; i++) {
          const newRow = []
          for (let j = 0; j < newCols; j++) {
            newRow.push('')
          }
          module.data.push(newRow)
          // 根据模块类型决定行标题格式
          if (module.type === 8) {
            module.rowHeaders.push({ parent: `行${i + 1}`, child: '' })
          } else {
            module.rowHeaders.push(`行${i + 1}`)
          }
        }
      } else if (newRows < oldRows) {
        // 减少行
        module.data.splice(newRows)
        module.rowHeaders.splice(newRows)
      }

      // 调整列数
      if (newCols > oldCols) {
        // 增加列
        module.data.forEach((row, index) => {
          for (let j = oldCols; j < newCols; j++) {
            row.push('')
          }
        })
        for (let j = oldCols; j < newCols; j++) {
          module.colHeaders.push(`列${j + 1}`)
        }
      } else if (newCols < oldCols) {
        // 减少列
        module.data.forEach(row => {
          row.splice(newCols)
        })
        module.colHeaders.splice(newCols)
      }
    },
    // 增加行
    addRow(moduleKey) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      const newRow = []
      // 根据模块类型计算列数
      if (module.type === 9) {
        // 类型9：通过colParents计算总列数
        const totalCols = module.colParents ? module.colParents.reduce((sum, cp) => {
          return sum + (cp.children ? cp.children.length : 0)
        }, 0) : 0
        for (let j = 0; j < totalCols; j++) {
          newRow.push('')
        }
      } else {
        // 其他类型：使用cols
        for (let j = 0; j < module.cols; j++) {
          newRow.push(module.type === 6 ? false : '')
        }
      }
      module.data.push(newRow)
      // 根据模块类型决定行标题格式
      if (module.type === 8) {
        module.rowHeaders.push({ parent: `行${module.data.length}`, child: '' })
      } else if (module.type === 9) {
        // 类型9：使用数字格式（1, 2, 3...）
        module.rowHeaders.push(`${module.data.length}`)
      } else {
        module.rowHeaders.push(`行${module.data.length}`)
      }
      module.rows = module.data.length
    },
    // 删除指定行
    removeRowAt(moduleKey, rowIndex) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (module.rows <= 1) {
        this.$message.warning('至少需要保留一行')
        return
      }
      module.data.splice(rowIndex, 1)
      module.rowHeaders.splice(rowIndex, 1)
      module.rows = module.data.length
    },
    // 增加列
    addCol(moduleKey) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      module.data.forEach(row => {
        row.push('')
      })
      module.colHeaders.push(`列${module.colHeaders.length + 1}`)
      module.cols = module.colHeaders.length
    },
    // 删除指定列
    removeColAt(moduleKey, colIndex) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (module.cols <= 1) {
        this.$message.warning('至少需要保留一列')
        return
      }
      module.data.forEach(row => {
        row.splice(colIndex, 1)
      })
      module.colHeaders.splice(colIndex, 1)
      module.cols = module.colHeaders.length
    },
    // 类型8: 确保"分析"子标题在最后
    ensureAnalysisChild(children) {
      if (!Array.isArray(children)) {
        children = []
      }
      // 移除现有的"分析"子标题
      children = children.filter(item => item.child !== '分析')
      // 在最后添加"分析"子标题
      children.push({ child: '分析', value: '' })
      return children
    },
    // 类型8: 添加父标题行
    addParentRow(moduleKey) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.parentRows) {
        module.parentRows = []
      }
      module.parentRows.push({
        parent: `课程目标${module.parentRows.length + 1}`,
        children: this.ensureAnalysisChild([{ child: '平时考核', value: '' }])
      })
    },
    // 类型8: 删除父标题行
    removeParentRow(moduleKey, parentIndex) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (module.parentRows && module.parentRows.length <= 1) {
        this.$message.warning('至少需要保留一个课程目标')
        return
      }
      if (module.parentRows && module.parentRows[parentIndex]) {
        module.parentRows.splice(parentIndex, 1)
      }
    },
    // 类型8: 添加子标题列
    addChildCol(moduleKey, parentIndex) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.parentRows || !module.parentRows[parentIndex]) {
        return
      }
      if (!module.parentRows[parentIndex].children) {
        module.parentRows[parentIndex].children = []
      }
      // 确保"分析"在最后，先移除它
      const children = module.parentRows[parentIndex].children.filter(item => item.child !== '分析')
      // 添加新的子标题
      children.push({
        child: `考核方式${children.length + 1}`,
        value: ''
      })
      // 在最后添加"分析"
      children.push({ child: '分析', value: '' })
      module.parentRows[parentIndex].children = children
    },
    // 类型8: 删除子标题列
    removeChildCol(moduleKey, parentIndex, childIndex) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.parentRows || !module.parentRows[parentIndex] || !module.parentRows[parentIndex].children) {
        return
      }
      const child = module.parentRows[parentIndex].children[childIndex]
      // 不能删除"分析"子标题
      if (child && child.child === '分析') {
        this.$message.warning('不能删除"分析"子标题')
        return
      }
      // 确保删除后还有至少一个非"分析"的子标题
      const nonAnalysisChildren = module.parentRows[parentIndex].children.filter(item => item.child !== '分析')
      if (nonAnalysisChildren.length <= 1) {
        this.$message.warning('至少需要保留一个考核方式')
        return
      }
      // 移除指定的子标题，然后重新确保"分析"在最后
      module.parentRows[parentIndex].children.splice(childIndex, 1)
      module.parentRows[parentIndex].children = this.ensureAnalysisChild(module.parentRows[parentIndex].children)
    },
    // 类型8: 通过child对象删除子标题列（用于排序后的列表）
    removeChildColByChild(moduleKey, parentIndex, child) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.parentRows || !module.parentRows[parentIndex] || !module.parentRows[parentIndex].children) {
        return
      }
      // 找到child在原始数组中的索引
      const childIndex = module.parentRows[parentIndex].children.findIndex(item => item === child)
      if (childIndex === -1) {
        return
      }
      // 调用原有的删除方法
      this.removeChildCol(moduleKey, parentIndex, childIndex)
    },
    // 类型9: 获取列子标题（直接返回，不排序）
    getSortedColChildren(children) {
      if (!Array.isArray(children)) {
        return []
      }
      // 直接返回children，不进行排序
      return children
    },
    // 类型9: 添加列父标题
    addColParent(moduleKey) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.colParents) {
        module.colParents = []
      }
      const newColParent = {
        parent: `列父标题${module.colParents.length + 1}`,
        children: [{ child: '列子标题1', value: '' }]
      }
      module.colParents.push(newColParent)
      // 更新data数组，为新的列父标题添加列
      const newColsCount = newColParent.children.length
      const currentColsCount = module.data[0] ? module.data[0].length : 0
      module.data.forEach((row, rowIndex) => {
        for (let i = 0; i < newColsCount; i++) {
          row.push('')
        }
      })
    },
    // 类型9: 删除列父标题
    removeColParent(moduleKey, colParentIndex) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.colParents || module.colParents.length <= 1) {
        this.$message.warning('至少需要保留一个列父标题')
        return
      }
      // 计算要删除的列数
      const colParent = module.colParents[colParentIndex]
      const colsToRemove = colParent ? colParent.children.length : 0
      // 计算要删除的列的起始索引
      let startColIndex = 0
      for (let i = 0; i < colParentIndex; i++) {
        startColIndex += module.colParents[i].children.length
      }
      // 从data数组中删除对应的列
      module.data.forEach(row => {
        row.splice(startColIndex, colsToRemove)
      })
      // 删除列父标题
      module.colParents.splice(colParentIndex, 1)
    },
    // 类型9: 添加列子标题
    addColChild(moduleKey, colParentIndex) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.colParents || !module.colParents[colParentIndex]) {
        return
      }
      const colParent = module.colParents[colParentIndex]
      if (!colParent.children) {
        colParent.children = []
      }
      // 添加新的列子标题
      const newChild = { child: `列子标题${colParent.children.length + 1}`, value: '' }
      colParent.children.push(newChild)
      // 计算新列的插入位置
      let insertColIndex = 0
      for (let i = 0; i < colParentIndex; i++) {
        insertColIndex += module.colParents[i].children.length
      }
      // 在最后插入新列
      insertColIndex += colParent.children.length - 1
      // 在data数组中插入新列
      module.data.forEach(row => {
        row.splice(insertColIndex, 0, '')
      })
    },
    // 类型9: 删除列子标题
    removeColChild(moduleKey, colParentIndex, colChildIndex) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.colParents || !module.colParents[colParentIndex] || !module.colParents[colParentIndex].children) {
        return
      }
      // 确保删除后还有至少一个子标题
      if (module.colParents[colParentIndex].children.length <= 1) {
        this.$message.warning('至少需要保留一个列子标题')
        return
      }
      // 计算要删除的列的索引
      let startColIndex = 0
      for (let i = 0; i < colParentIndex; i++) {
        startColIndex += module.colParents[i].children.length
      }
      startColIndex += colChildIndex
      // 从data数组中删除对应的列
      module.data.forEach(row => {
        row.splice(startColIndex, 1)
      })
      // 移除指定的列子标题
      module.colParents[colParentIndex].children.splice(colChildIndex, 1)
    },
    // 类型9: 通过child对象删除列子标题（用于排序后的列表）
    removeColChildByChild(moduleKey, colParentIndex, colChild) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.colParents || !module.colParents[colParentIndex] || !module.colParents[colParentIndex].children) {
        return
      }
      // 找到colChild在原始数组中的索引
      const colChildIndex = module.colParents[colParentIndex].children.findIndex(item => item === colChild)
      if (colChildIndex === -1) {
        return
      }
      // 调用原有的删除方法
      this.removeColChild(moduleKey, colParentIndex, colChildIndex)
    },
    // 类型9: 获取单元格值
    getCellValue(moduleKey, rowIndex, colParentIndex, colChildIndex) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.data || !module.data[rowIndex]) {
        return ''
      }
      // 计算列索引
      let colIndex = 0
      for (let i = 0; i < colParentIndex; i++) {
        colIndex += module.colParents[i].children.length
      }
      // 获取排序后的子标题列表，找到colChildIndex对应的原始索引
      const colParent = module.colParents[colParentIndex]
      const sortedChildren = this.getSortedColChildren(colParent.children)
      const colChild = sortedChildren[colChildIndex]
      // 在原始children数组中找到对应的索引
      const originalColChildIndex = colParent.children.findIndex(item => item === colChild)
      colIndex += originalColChildIndex
      return module.data[rowIndex][colIndex] || ''
    },
    // 类型9: 设置单元格值
    setCellValue(moduleKey, rowIndex, colParentIndex, colChildIndex, value) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.data || !module.data[rowIndex]) {
        return
      }
      // 计算列索引
      let colIndex = 0
      for (let i = 0; i < colParentIndex; i++) {
        colIndex += module.colParents[i].children.length
      }
      // 获取排序后的子标题列表，找到colChildIndex对应的原始索引
      const colParent = module.colParents[colParentIndex]
      const sortedChildren = this.getSortedColChildren(colParent.children)
      const colChild = sortedChildren[colChildIndex]
      // 在原始children数组中找到对应的索引
      const originalColChildIndex = colParent.children.findIndex(item => item === colChild)
      colIndex += originalColChildIndex
      this.$set(module.data[rowIndex], colIndex, value)
    },
    // 文件上传成功回调
    handleFileSuccess(moduleKey, response, file, fileList) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.data) {
        module.data = []
      }
      
      // 添加文件到列表，格式：{ label: '', name: '', url: '' }
      const fileItem = {
        label: file.name, // 默认标签为文件名
        name: file.name,
        url: response.url || response.data || file.url || ''
      }
      module.data.push(fileItem)
    },
    // 文件移除回调
    handleFileRemove(moduleKey, file, fileList) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.data) {
        module.data = []
        return
      }
      
      // 从列表中移除文件
      const index = module.data.findIndex(item => item.name === file.name || item.url === file.url)
      if (index > -1) {
        module.data.splice(index, 1)
      }
    },
    // 文件上传前验证
    beforeFileUpload(file) {
      // 可以在这里添加文件大小、类型等验证
      return true
    },
    // 删除文件
    removeFile(moduleKey, index) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (module.data && module.data[index]) {
        module.data.splice(index, 1)
      }
    },
    // 图片上传成功回调
    handleImageSuccess(moduleKey, response, file, fileList) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.data) {
        module.data = []
      }
      
      // 添加图片到列表，格式：{ label: '', name: '', url: '' }
      const imageItem = {
        label: file.name, // 默认标签为文件名
        name: file.name,
        url: response.url || response.data || file.url || ''
      }
      module.data.push(imageItem)
    },
    // 图片移除回调
    handleImageRemove(moduleKey, file, fileList) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.data) {
        module.data = []
        return
      }
      
      // 从列表中移除图片
      const index = module.data.findIndex(item => item.name === file.name || item.url === file.url)
      if (index > -1) {
        module.data.splice(index, 1)
      }
    },
    // 图片上传前验证
    beforeImageUpload(file) {
      const isImage = file.type.indexOf('image') > -1
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('上传图片大小不能超过 10MB!')
        return false
      }
      return true
    },
    // 图片预览
    handleImagePreview(file) {
      this.imagePreviewUrl = file.url || file.response?.url || file.response?.data
      this.imagePreviewVisible = true
    },
    // 删除图片
    removeImage(moduleKey, index) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (module.data && module.data[index]) {
        module.data.splice(index, 1)
      }
    },
    // 添加日期字段
    addDateItem(moduleKey) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.data) {
        module.data = []
      }
      module.data.push({
        fieldId: this.generateFieldId(module, 'date'),
        label: '',
        value: null
      })
    },
    // 删除日期字段
    removeDateItem(moduleKey, index) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (module.data && module.data[index]) {
        module.data.splice(index, 1)
      }
    },
    // 添加文本输入字段
    addTextItem(moduleKey) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.data) {
        module.data = []
      }
      module.data.push({
        fieldId: this.generateFieldId(module, 'text'),
        label: `字段${module.data.length + 1}`,
        value: '',
        inputType: 'text'
      })
    },
    // 删除文本输入字段
    removeTextItem(moduleKey, index) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (module.data && module.data[index]) {
        module.data.splice(index, 1)
      }
    },
    // 单选：添加选项
    addRadioItem(moduleKey) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (!module.data) {
        module.data = []
      }
      const nextIndex = module.data.length + 1
      const val = `opt${nextIndex}`
      module.data.push({
        fieldId: this.generateFieldId(module, 'radio'),
        label: `选项${nextIndex}`,
        value: val
      })
      if (!module.selected) {
        module.selected = val
      }
    },
    // 单选：删除选项
    removeRadioItem(moduleKey, index) {
      const module = this.formData[this.currentFormType].modules[moduleKey]
      if (module.data && module.data[index]) {
        const removedVal = module.data[index].value
        module.data.splice(index, 1)
        if (module.selected === removedVal) {
          module.selected = module.data[0] ? module.data[0].value : ''
        }
      }
    },
    // 保存表单数据
    async saveFormData() {
      if (!this.currentFormType) {
        this.$message.warning('请先选择表单类型')
        return
      }

      const currentForm = this.formData[this.currentFormType]
      if (!currentForm || !currentForm.modules) {
        this.$message.warning('表单数据为空，无法保存')
        return
      }

      // 检查是否有模块
      // 使用 moduleOrder 来保证顺序，如果没有则使用 Object.keys 作为后备
      const moduleKeys = this.moduleOrder && this.moduleOrder.length > 0 
        ? this.moduleOrder.filter(key => currentForm.modules[key]) 
        : Object.keys(currentForm.modules)
      if (moduleKeys.length === 0) {
        this.$message.warning('请至少添加一个模块')
        return
      }

      // 构建保存数据（按照 moduleOrder 的顺序）
      const modules = []
      moduleKeys.forEach(moduleKey => {
        const module = currentForm.modules[moduleKey]

        console.log('准备保存模块:', moduleKey, module)

        // 只使用后端返回的模块ID（存储在_moduleId中）
        // 如果_moduleId为null，说明是新模块，后端会生成ID
        const moduleId = module._moduleId || null

        // 确保模块名称不为空
        const moduleName = module.name && module.name.trim() ? module.name.trim() : '未命名模块'

        // 获取模块类型，默认为1（数据类型）
        const moduleType = module.type || 1

        // 根据类型构建不同的数据结构
        const moduleData = {
          id: moduleId, // 有ID则更新，无ID则新建（由后端生成）
          name: moduleName,
          type: moduleType
        }

        // 确保模块 fieldId 存在，如果不存在则生成
        if (!module.fieldId || !module.fieldId.trim()) {
          module.fieldId = this.generateModuleFieldId(moduleType)
        }
        moduleData.fieldId = module.fieldId

        if (moduleType === 1) {
          // 数据类型：包含 rowHeaders, colHeaders, data
          moduleData.rowHeaders = module.rowHeaders || []
          moduleData.colHeaders = module.colHeaders || []
          moduleData.data = module.data || []
          moduleData.fixedRowCount = module.fixedRowCount || 0
          moduleData.fixedRowPosition = module.fixedRowPosition || 'top'
          moduleData.fixedColCount = module.fixedColCount || 0
          moduleData.fixedColPosition = module.fixedColPosition || 'left'
        } else if (moduleType === 2) {
          // 文件类型：只包含 data
          moduleData.data = Array.isArray(module.data)
            ? module.data.map((item, idx) => ({
                fieldId: item.fieldId && item.fieldId.trim() ? item.fieldId : this.generateFieldId(module, 'file'),
                label: item.label || '',
                name: item.name || '',
                url: item.url || ''
              }))
            : []
        } else if (moduleType === 3) {
          // 日期选择：只包含 data
          moduleData.data = Array.isArray(module.data)
            ? module.data.map((item, idx) => ({
                fieldId: item.fieldId && item.fieldId.trim() ? item.fieldId : this.generateFieldId(module, 'date'),
                label: item.label || '',
                value: item.value || null
              }))
            : []
        } else if (moduleType === 4) {
          // 文本输入：标签+默认值
          moduleData.data = Array.isArray(module.data)
            ? module.data.map((item, idx) => ({
                fieldId: item.fieldId && item.fieldId.trim() ? item.fieldId : this.generateFieldId(module, 'text'),
                label: item.label || '',
                value: item.value || '',
                inputType: item.inputType || 'text'
              }))
            : []
        } else if (moduleType === 5) {
          // 单选
          moduleData.data = Array.isArray(module.data)
            ? module.data.map((item, idx) => ({
                fieldId: item.fieldId && item.fieldId.trim() ? item.fieldId : this.generateFieldId(module, 'radio'),
                label: item.label || '',
                value: item.value || ''
              }))
            : []
          moduleData.selected = module.selected || (moduleData.data[0] ? moduleData.data[0].value : '')
        } else if (moduleType === 6) {
          // 勾选矩阵：与二维表类似，存储布尔矩阵
          moduleData.rowHeaders = module.rowHeaders || []
          moduleData.colHeaders = module.colHeaders || []
          moduleData.data = module.data || []
          moduleData.rows = module.rows
          moduleData.cols = module.cols
        } else if (moduleType === 8) {
          // 父子标题数据列表：包含 parentRows 数组
          // 深拷贝 parentRows，确保每个 parentRow 和其 children 都是新对象
          moduleData.parentRows = Array.isArray(module.parentRows)
            ? module.parentRows.map(parentRow => ({
                parent: parentRow.parent || '',
                children: Array.isArray(parentRow.children)
                  ? parentRow.children.map(child => ({
                      child: child.child || '',
                      value: child.value || ''
                    }))
                  : []
              }))
            : []
        } else if (moduleType === 9) {
          // 列父子标题数据列表：包含 colParents 数组、rowHeaders 和 data
          // 深拷贝 colParents，确保每个 colParent 和其 children 都是新对象
          moduleData.colParents = Array.isArray(module.colParents)
            ? module.colParents.map(colParent => ({
                parent: colParent.parent || '',
                children: Array.isArray(colParent.children)
                  ? colParent.children.map(child => ({
                      child: child.child || '',
                      value: child.value || ''
                    }))
                  : []
              }))
            : []
          // 深拷贝 rowHeaders 和 data
          moduleData.rowHeaders = Array.isArray(module.rowHeaders) ? [...module.rowHeaders] : []
          moduleData.data = Array.isArray(module.data)
            ? module.data.map(row => Array.isArray(row) ? [...row] : [])
            : []
          moduleData.rows = module.rows || 0
        } else if (moduleType === 7) {
          // 图片上传：只包含 data
          moduleData.data = Array.isArray(module.data)
            ? module.data.map((item, idx) => ({
                fieldId: item.fieldId && item.fieldId.trim() ? item.fieldId : this.generateFieldId(module, 'image'),
                label: item.label || '',
                name: item.name || '',
                url: item.url || ''
              }))
            : []
        } else if (moduleType === 10) {
          console.log(module)
          moduleData.data = module.data || ''
        }

        modules.push(moduleData)
      })

      console.log('准备保存的数据:', {
        formId: this.formId,
        formName: currentForm.name,
        modules: modules
      })

      const saveData = {
        formId: this.formId,
        formName: currentForm.name || '未命名表单',
        modules: modules
      }

      this.loading = true
      try {
        const response = await saveFormModules(saveData)
        const savedFormId = response.data

        // 更新formId
        this.formId = savedFormId

        // 更新模块ID（从后端返回的数据中获取）
        // 由于后端返回的是表单ID，我们需要重新加载数据来获取模块ID
        // 或者从保存响应中获取模块ID列表
        this.$message.success('保存成功')

        // 重新加载表单数据以获取最新的模块ID
        await this.loadFormData()
      } catch (error) {
        console.error('保存表单失败:', error)
        this.$message.error('保存失败：' + (error.msg || error.message || '未知错误'))
      } finally {
        this.loading = false

        console.log('当前表单数据状态:', this.formData[this.currentFormType] || {})
      }
    }
  }
}
</script>

<style scoped>
.form-builder-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.modules-section {
  margin-bottom: 20px;
}

.modules-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.floating-action-bar {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 999;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 16px;
  background-color: #ffffff;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modules-list {
  margin-top: 10px;
}

.module-wrapper {
  margin-bottom: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: white;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: stretch;
}

.module-drag-handle {
  cursor: move;
  padding: 12px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  color: #909399;
  flex-shrink: 0;
}

.module-drag-handle:hover {
  background-color: #ebeef5;
  color: #409EFF;
}

.module-drag-handle i {
  font-size: 18px;
}

.module-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 避免内容挤压时超宽 */
}

.module-header-bar {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #e4e7ed;
  gap: 10px;
  background-color: #fafafa;
  flex: 1;
}

.modules-draggable-list {
  width: 100%;
}

.module-type-select {
  width: 120px;
  flex-shrink: 0;
}

.module-name-input {
  flex: 1;
}

.module-field-id-input {
  width: 150px;
  flex-shrink: 0;
}

.module-collapse {
  border: none;
}

.module-item {
  border: none;
  margin-bottom: 0;
}

.collapse-title {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 15px;
}

.collapse-label {
  color: #606266;
  font-size: 14px;
}

.collapse-arrow {
  cursor: pointer;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  transition: color 0.3s;
  margin-right: 8px;
  flex-shrink: 0;
}

.collapse-arrow:hover {
  color: #409EFF;
}

.collapse-arrow i {
  font-size: 14px;
}

.module-content {
  padding: 20px;
}

.module-settings {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.setting-control-group {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-start;
}

.setting-label {
  color: #666;
  font-size: 14px;
  min-width: 50px;
}

.module-table-container {
  overflow-x: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.module-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.module-table th,
.module-table td {
  border: 1px solid #e4e7ed;
  padding: 8px;
  text-align: center;
  min-width: 100px;
}

.module-table th {
  background-color: #f5f7fa;
  font-weight: 600;
}

.corner-cell {
  background-color: #f5f7fa;
  min-width: 120px;
}

.row-header {
  background-color: #f5f7fa;
  font-weight: 500;
}

.row-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-header-inputs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.row-header-parent,
.row-header-child {
  width: 100%;
}

/* 类型8: 父子标题表格样式 */
.parent-child-table .parent-col-header {
  min-width: 150px;
}

.parent-child-table .child-col-header {
  min-width: 150px;
}

.parent-child-table .data-col-header {
  min-width: 300px;
}

.parent-child-table .data-cell {
  text-align: left;
}

.parent-child-table .data-cell .el-textarea {
  width: 100%;
}

.parent-header {
  background-color: #f5f7fa;
  font-weight: 500;
  vertical-align: middle;
}

.parent-header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.parent-input {
  width: 100%;
}

.child-header {
  background-color: #fafafa;
  vertical-align: middle;
}

.child-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.child-input {
  flex: 1;
}

.add-child-row {
  background-color: #f9f9f9;
}

.add-child-cell {
  text-align: left;
  padding: 8px;
}

.col-header {
  background-color: #f5f7fa;
}

.col-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-direction: row;
  justify-content: center;
}

.checkbox-cell {
  text-align: center;
}
.checkbox-cell .el-checkbox__inner {
  width: 20px;
  height: 20px;
  border: 2px solid #303133;
}
.checkbox-cell .el-checkbox__inner::after {
  top: 3px;
  left: 6px;
  width: 4px;
  height: 9px;
  border-color: #303133;
}

.data-cell {
  background-color: white;
}

.data-cell .el-input {
  width: 100%;
}

.data-cell .el-textarea {
  width: 100%;
}

.data-cell .el-textarea__inner {
  resize: vertical;
}

.el-collapse-item__header {
  padding-left: 10px;
  cursor: default;
  outline: none;
}

.el-collapse-item__header:hover {
  background-color: transparent;
}

.el-collapse-item__header:focus {
  outline: none;
}

/* 隐藏 Element UI 默认的箭头 */
.el-collapse-item__arrow {
  display: none !important;
}

.el-collapse-item__content {
  padding: 0;
}

/* 模块类型内容区域 */
.module-type-content {
  padding: 20px;
}

/* 文件上传区域 */
.file-upload-section {
  padding: 20px;
}

.file-uploader {
  margin-bottom: 20px;
}

.file-list {
  margin-top: 20px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 10px;
}

.file-label-input {
  width: 200px;
}

.file-name {
  color: #606266;
  font-size: 14px;
}

/* 文本输入模块 */
.text-type-content {
  background: #f9fafb;
  border-radius: 6px;
  padding: 12px;
}
.text-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.text-row {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.text-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.text-row-title {
  font-weight: 600;
  color: #303133;
}
.text-row-actions {
  display: flex;
  gap: 8px;
}
.text-row-body {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.text-item-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: #f7f9fc;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}
.text-field-id-input {
  width: 120px;
  flex-shrink: 0;
}
.text-label-input {
  width: 140px;
}
.text-value-input {
  width: 180px;
}
.text-type-select {
  width: 90px;
}
.text-value-textarea {
  width: 260px;
}
.text-footer-actions {
  margin-top: 8px;
}

/* 单选模块 */
.radio-type-content {
  background: #f9fafb;
  border-radius: 6px;
  padding: 12px;
}
.radio-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.radio-item-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}
.radio-field-id-input {
  width: 120px;
  flex-shrink: 0;
}
.radio-label-input {
  width: 160px;
}
.radio-value-input {
  width: 140px;
}
.radio-footer-actions {
  margin-top: 8px;
}
/* 日期选择区域 */
.date-section {
  padding: 20px;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
}

.date-field-id-input {
  width: 120px;
  flex-shrink: 0;
}
.date-label-input {
  width: 200px;
}

.date-picker {
  flex: 1;
}

/* 图片上传区域 */
.image-upload-section {
  padding: 20px;
}

.image-uploader {
  margin-bottom: 20px;
}

.image-list {
  margin-top: 20px;
}

.image-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
}

.image-preview {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
}

.image-info {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 10px;
}

.image-label-input {
  width: 200px;
}

.image-name {
  color: #606266;
  font-size: 12px;
}

/* 类型9: 列父子标题表格样式 */
.col-parent-child-table .col-parent-header {
  background-color: #f5f7fa;
  font-weight: 600;
  vertical-align: middle;
}

.col-parent-header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 8px;
}

.col-parent-input {
  width: 100%;
}

.col-parent-child-table .col-child-header {
  background-color: #fafafa;
  vertical-align: middle;
}

.col-child-header-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
}

.col-child-input {
  flex: 1;
}

.col-child-input .el-textarea {
  width: 100%;
}

.col-child-input .el-textarea__inner {
  resize: vertical;
}

.col-child-actions {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.col-child-action-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.col-parent-label {
  font-weight: 500;
  color: #606266;
  min-width: 100px;
}
</style>

