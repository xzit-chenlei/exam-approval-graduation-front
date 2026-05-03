/**
 * 模块工具函数
 */

/**
 * 获取模块类型文本
 */
export function renderModuleTypeText(type) {
  const typeMap = {
    1: '数据类型',
    2: '文件类型',
    3: '日期选择',
    4: '文本输入',
    5: '单选',
    6: '勾选矩阵',
    7: '图片上传',
    8: '父子标题数据列表',
    9: '列父子标题数据列表'
  }
  return typeMap[type] || '未知类型'
}

/**
 * 获取模块类型标签类型
 */
export function renderModuleTypeTag(type) {
  const tagMap = {
    1: 'success',
    2: 'warning',
    3: 'info',
    4: 'primary',
    5: 'success',
    6: 'success',
    7: 'warning',
    8: 'success',
    9: 'success'
  }
  return tagMap[type] || 'info'
}

/**
 * 获取排序后的子标题（"分析"始终在最后）
 */
export function getSortedChildren(children) {
  if (!Array.isArray(children)) return []
  const sorted = [...children]
  const analysisIndex = sorted.findIndex(ch => ch.child === '分析')
  if (analysisIndex > -1) {
    const analysis = sorted.splice(analysisIndex, 1)[0]
    sorted.push(analysis)
  }
  return sorted
}

/**
 * 获取排序后的列子标题（"分析"始终在最后）
 */
export function getSortedColChildren(children) {
  if (!Array.isArray(children)) return []
  const sorted = [...children]
  const analysisIndex = sorted.findIndex(ch => ch.child === '分析')
  if (analysisIndex > -1) {
    const analysis = sorted.splice(analysisIndex, 1)[0]
    sorted.push(analysis)
  }
  return sorted
}

/**
 * 计算类型9模块的单元格索引
 */
export function getCellIndex(rowIndex, colParentIndex, colChildIndex, colParents) {
  let colIndex = 0
  for (let i = 0; i < colParentIndex; i++) {
    if (colParents[i] && colParents[i].children) {
      colIndex += colParents[i].children.length
    }
  }
  colIndex += colChildIndex
  return rowIndex * getTotalCols(colParents) + colIndex
}

/**
 * 获取总列数（类型9）
 */
export function getTotalCols(colParents) {
  return colParents.reduce((sum, cp) => sum + (cp.children ? cp.children.length : 0), 0)
}

