/**
 * 模块数据规范化工具
 * 统一处理各种模块类型的数据结构
 */

/**
 * 规范化单个模块
 * @param {Object} module - 原始模块数据
 * @returns {Object} 规范化后的模块数据
 */
export function normalizeModule(module = {}) {
  const moduleType = module.type || 1

  // 类型1: 二维数据列表 或 类型6: 勾选矩阵
  if (moduleType === 1 || moduleType === 6) {
    const rowHeaders = Array.isArray(module.rowHeaders) ? [...module.rowHeaders] : []
    const colHeaders = Array.isArray(module.colHeaders) ? [...module.colHeaders] : []
    const data = Array.isArray(module.data) ? module.data.map(row => [...row]) : []
    const rows = module.rows || rowHeaders.length || data.length || 1
    const cols = module.cols || colHeaders.length || (data[0] ? data[0].length : 0) || 1

    // 补齐行头
    while (rowHeaders.length < rows) {
      rowHeaders.push(`行${rowHeaders.length + 1}`)
    }
    if (rowHeaders.length > rows) rowHeaders.splice(rows)

    // 补齐列头
    while (colHeaders.length < cols) {
      colHeaders.push(`列${colHeaders.length + 1}`)
    }
    if (colHeaders.length > cols) colHeaders.splice(cols)

    // 补齐数据
    const fixedData = []
    for (let i = 0; i < rows; i++) {
      const row = Array.isArray(data[i]) ? [...data[i]] : []
      while (row.length < cols) {
        row.push(moduleType === 6 ? false : '')
      }
      if (row.length > cols) row.splice(cols)
      fixedData.push(row)
    }

    return {
      id: module.id || module._moduleId || null,
      fieldId: module.fieldId,
      name: module.name || '',
      type: moduleType,
      rows,
      cols,
      rowHeaders,
      colHeaders,
      data: fixedData,
      fixedRowCount: moduleType === 1 ? (module.fixedRowCount || 0) : 0,
      fixedRowPosition: moduleType === 1 ? (module.fixedRowPosition || 'top') : 'top',
      fixedColCount: moduleType === 1 ? (module.fixedColCount || 0) : 0,
      fixedColPosition: moduleType === 1 ? (module.fixedColPosition || 'left') : 'left'
    }
  }

  // 类型2: 文件上传
  if (moduleType === 2) {
    return {
      id: module.id || module._moduleId || null,
      fieldId: module.fieldId,
      name: module.name || '',
      type: 2,
      data: Array.isArray(module.data) ? module.data.map(item => ({ ...item })) : []
    }
  }

  // 类型3: 日期选择
  if (moduleType === 3) {
    return {
      id: module.id || module._moduleId || null,
      fieldId: module.fieldId,
      name: module.name || '',
      type: 3,
      data: Array.isArray(module.data)
        ? module.data.map(item => ({
            ...item,
            label: item.label || '日期字段',
            value: item.value || null
          }))
        : [{ label: '日期字段', value: null }]
    }
  }

  // 类型4: 文本输入
  if (moduleType === 4) {
    return {
      id: module.id || module._moduleId || null,
      fieldId: module.fieldId,
      name: module.name || '',
      type: 4,
      data: Array.isArray(module.data)
        ? module.data.map(item => ({
            ...item,
            label: item.label || '标签',
            value: item.value || '',
            inputType: item.inputType || 'text'
          }))
        : [{ label: '标签', value: '', inputType: 'text' }]
    }
  }

  // 类型5: 单选
  if (moduleType === 5) {
    const options = Array.isArray(module.data)
      ? module.data.map(item => ({
          ...item,
          label: item.label || '选项',
          value: item.value || ''
        }))
      : [{ label: '选项1', value: 'opt1' }]
    return {
      id: module.id || module._moduleId || null,
      fieldId: module.fieldId,
      name: module.name || '',
      type: 5,
      data: options,
      selected: module.selected || (options[0] ? options[0].value : '')
    }
  }

  // 类型7: 图片上传
  if (moduleType === 7) {
    return {
      id: module.id || module._moduleId || null,
      fieldId: module.fieldId,
      name: module.name || '',
      type: 7,
      data: Array.isArray(module.data) ? module.data.map(item => ({ ...item })) : []
    }
  }

  // 类型8: 父子标题数据列表
  if (moduleType === 8) {
    let parentRows = []
    if (module.parentRows && Array.isArray(module.parentRows)) {
      parentRows = module.parentRows.map(pr => ({
        parent: pr.parent || '',
        children: Array.isArray(pr.children)
          ? pr.children.map(ch => ({
              child: ch.child || '',
              value: ch.value || ''
            }))
          : []
      }))
    } else if (module.rowHeaders && Array.isArray(module.rowHeaders)) {
      // 兼容旧格式
      parentRows = module.rowHeaders.map((parent, idx) => ({
        parent: parent || `课程目标${idx + 1}`,
        children: [
          { child: '平时考核', value: '' },
          { child: '期末考试', value: '' },
          { child: '分析', value: '' }
        ]
      }))
    } else {
      parentRows = [
        {
          parent: '课程目标1',
          children: [
            { child: '平时考核', value: '' },
            { child: '期末考试', value: '' },
            { child: '分析', value: '' }
          ]
        }
      ]
    }

    // 确保每个父标题都有"分析"子标题
    parentRows.forEach(pr => {
      ensureAnalysisChild(pr.children)
    })

    return {
      id: module.id || module._moduleId || null,
      fieldId: module.fieldId,
      name: module.name || '',
      type: 8,
      parentRows
    }
  }

  // 类型9: 列父子标题数据列表
  if (moduleType === 9) {
    let colParents = []
    if (module.colParents && Array.isArray(module.colParents)) {
      colParents = module.colParents.map(cp => ({
        parent: cp.parent || '',
        children: Array.isArray(cp.children)
          ? cp.children.map(ch => ({
              child: ch.child || '',
              value: ch.value || ''
            }))
          : []
      }))
    } else if (module.colHeaders && Array.isArray(module.colHeaders)) {
      // 兼容旧格式
      colParents = module.colHeaders.map((parent, idx) => ({
        parent: parent || `列父标题${idx + 1}`,
        children: [
          { child: '列子标题1', value: '' },
          { child: '分析', value: '' }
        ]
      }))
    } else {
      colParents = [
        {
          parent: '列父标题1',
          children: [
            { child: '列子标题1', value: '' },
            { child: '分析', value: '' }
          ]
        }
      ]
    }

    // 确保每个列父标题都有"分析"子标题
    colParents.forEach(cp => {
      ensureColAnalysisChild(cp.children)
    })

    const rowHeaders = Array.isArray(module.rowHeaders) ? [...module.rowHeaders] : ['行标题1']
    const totalCols = colParents.reduce((sum, cp) => sum + (cp.children ? cp.children.length : 0), 0)
    const rows = module.rows || rowHeaders.length || 1
    const data = Array.isArray(module.data) ? [...module.data] : []

    // 补齐行头
    while (rowHeaders.length < rows) {
      rowHeaders.push(`行标题${rowHeaders.length + 1}`)
    }
    if (rowHeaders.length > rows) rowHeaders.splice(rows)

    // 补齐数据（一维数组，按行*列展开）
    while (data.length < rows * totalCols) {
      data.push('')
    }
    if (data.length > rows * totalCols) {
      data.splice(rows * totalCols)
    }

    return {
      id: module.id || module._moduleId || null,
      fieldId: module.fieldId,
      name: module.name || '',
      type: 9,
      colParents,
      rowHeaders,
      rows,
      data
    }
  }

  // 默认返回
  return {
    id: module.id || module._moduleId || null,
    fieldId: module.fieldId,
    name: module.name || '',
    type: moduleType,
    data: []
  }
}

/**
 * 确保"分析"子标题存在且位于最后
 */
function ensureAnalysisChild(children) {
  if (!Array.isArray(children)) {
    children = []
  }
  const analysisIndex = children.findIndex(ch => ch.child === '分析')
  if (analysisIndex > -1) {
    const analysis = children.splice(analysisIndex, 1)[0]
    children.push(analysis)
  } else {
    children.push({ child: '分析', value: '' })
  }
}

/**
 * 确保列"分析"子标题存在且位于最后
 */
function ensureColAnalysisChild(children) {
  if (!Array.isArray(children)) {
    children = []
  }
  const analysisIndex = children.findIndex(ch => ch.child === '分析')
  if (analysisIndex > -1) {
    const analysis = children.splice(analysisIndex, 1)[0]
    children.push(analysis)
  } else {
    children.push({ child: '分析', value: '' })
  }
}

/**
 * 规范化模块数组
 * @param {Object|Array} modules - 模块数据（对象或数组）
 * @returns {Array} 规范化后的模块数组
 */
export function normalizeModules(modules) {
  if (Array.isArray(modules)) {
    return modules.map(module => normalizeModule(module))
  }
  if (typeof modules === 'object' && modules !== null) {
    return Object.keys(modules).map(key => normalizeModule(modules[key]))
  }
  return []
}

