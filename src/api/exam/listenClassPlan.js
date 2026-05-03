import request from '@/utils/request'

// 查询听课计划列表
export function listPlan(query) {
  return request({
    url: '/exam/listenClassPlan/list',
    method: 'get',
    params: query
  })
}

// 查询听课计划详细
export function getPlan(id) {
  return request({
    url: '/exam/listenClassPlan/' + id,
    method: 'get'
  })
}

// 新增听课计划
export function addPlan(data) {
  return request({
    url: '/exam/listenClassPlan',
    method: 'post',
    data: data
  })
}

// 修改听课计划
export function updatePlan(data) {
  return request({
    url: '/exam/listenClassPlan',
    method: 'put',
    data: data
  })
}

// 删除听课计划
export function delPlan(id) {
  return request({
    url: '/exam/listenClassPlan/' + id,
    method: 'delete'
  })
}
