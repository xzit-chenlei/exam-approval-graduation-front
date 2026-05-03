import request from '@/utils/request'

// 查询试卷信息列表
export function listExamPaper(query) {
  return request({
    url: '/graduate/examPaper/list',
    method: 'get',
    params: query
  })
}

// 查询试卷信息详细
export function getExamPaper(id) {
  return request({
    url: '/graduate/examPaper/' + id,
    method: 'get'
  })
}

// 新增试卷信息
export function addExamPaper(data) {
  return request({
    url: '/graduate/examPaper',
    method: 'post',
    data: data
  })
}

// 修改试卷信息
export function updateExamPaper(data) {
  return request({
    url: '/graduate/examPaper',
    method: 'put',
    data: data
  })
}

// 删除试卷信息
export function delExamPaper(id) {
  return request({
    url: '/graduate/examPaper/' + id,
    method: 'delete'
  })
}

// 导出试卷信息
export function exportExamPaper(query) {
  return request({
    url: '/graduate/examPaper/export',
    method: 'post',
    data: query
  })
}

// 获取试卷的题目与毕业能力关系及达成度
export function getAbilityAchievement(paperId) {
  return request({
    url: '/graduate/examPaper/abilityAchievement/' + paperId,
    method: 'get'
  })
}