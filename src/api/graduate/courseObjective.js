import request from '@/utils/request'

// 查询课程目标列表
export function listCourseObjective(query) {
  return request({
    url: '/graduate/courseObjective/list',
    method: 'get',
    params: query
  })
}

// 查询课程目标详细
export function getCourseObjective(id) {
  return request({
    url: '/graduate/courseObjective/' + id,
    method: 'get'
  })
}

// 新增课程目标
export function addCourseObjective(data) {
  return request({
    url: '/graduate/courseObjective',
    method: 'post',
    data: data
  })
}

// 修改课程目标
export function updateCourseObjective(data) {
  return request({
    url: '/graduate/courseObjective',
    method: 'put',
    data: data
  })
}

// 删除课程目标
export function delCourseObjective(id) {
  return request({
    url: '/graduate/courseObjective/' + id,
    method: 'delete'
  })
}

// 获取课程目标达成度数据
export function getObjectiveAchievement(courseId) {
  return request({
    url: '/graduate/courseObjective/achievement/' + courseId,
    method: 'get'
  })
}

// 获取特定试卷的能力达成度数据
export function getPaperObjectiveAchievement(paperId) {
  return request({
    url: '/graduate/courseObjective/paper-achievement/' + paperId,
    method: 'get'
  })
}

// 导出课程目标
export function exportCourseObjective(query) {
  return request({
    url: '/graduate/courseObjective/export',
    method: 'post',
    data: query
  })
} 