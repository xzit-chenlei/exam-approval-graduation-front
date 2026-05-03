import request from '@/utils/request'

// 查询题目与课程目标关联列表
export function listQuestionObjective(query) {
  return request({
    url: '/graduate/questionObjective/list',
    method: 'get',
    params: query
  })
}

// 查询题目与课程目标关联详细
export function getQuestionObjective(id) {
  return request({
    url: '/graduate/questionObjective/' + id,
    method: 'get'
  })
}

// 新增题目与课程目标关联
export function addQuestionObjective(data) {
  return request({
    url: '/graduate/questionObjective',
    method: 'post',
    data: data
  })
}

// 修改题目与课程目标关联
export function updateQuestionObjective(data) {
  return request({
    url: '/graduate/questionObjective',
    method: 'put',
    data: data
  })
}

// 删除题目与课程目标关联
export function delQuestionObjective(id) {
  return request({
    url: '/graduate/questionObjective/' + id,
    method: 'delete'
  })
}

// 导出题目与课程目标关联
export function exportQuestionObjective(query) {
  return request({
    url: '/graduate/questionObjective/export',
    method: 'post',
    data: query
  })
}