import request from '@/utils/request'

// 查询试卷题目列表
export function listExamQuestion(query) {
  return request({
    url: '/graduate/examQuestion/list',
    method: 'get',
    params: query
  })
}

// 查询试卷题目详细
export function getExamQuestion(id) {
  return request({
    url: '/graduate/examQuestion/' + id,
    method: 'get'
  })
}

// 新增试卷题目
export function addExamQuestion(data) {
  return request({
    url: '/graduate/examQuestion',
    method: 'post',
    data: data
  })
}

// 修改试卷题目
export function updateExamQuestion(data) {
  return request({
    url: '/graduate/examQuestion',
    method: 'put',
    data: data
  })
}

// 删除试卷题目
export function delExamQuestion(id) {
  return request({
    url: '/graduate/examQuestion/' + id,
    method: 'delete'
  })
}

// 导出试卷题目
export function exportExamQuestion(query) {
  return request({
    url: '/graduate/examQuestion/export',
    method: 'post',
    data: query
  })
}