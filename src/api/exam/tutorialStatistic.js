import request from '@/utils/request'

// 查询辅导答疑统计列表
export function listStatistic(query) {
  return request({
    url: '/exam/tutorialStatistic/list',
    method: 'get',
    params: query
  })
}

// 查询辅导答疑统计详细
export function getStatistic(id) {
  return request({
    url: '/exam/tutorialStatistic/' + id,
    method: 'get'
  })
}

// 新增辅导答疑统计
export function addStatistic(data) {
  return request({
    url: '/exam/tutorialStatistic',
    method: 'post',
    data: data
  })
}

// 修改辅导答疑统计
export function updateStatistic(data) {
  return request({
    url: '/exam/tutorialStatistic',
    method: 'put',
    data: data
  })
}

// 删除辅导答疑统计
export function delStatistic(id) {
  return request({
    url: '/exam/tutorialStatistic/' + id,
    method: 'delete'
  })
}
