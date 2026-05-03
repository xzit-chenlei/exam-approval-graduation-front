import request from '@/utils/request'

// 查询课程列表
export function listCourse(query) {
  return request({
    url: '/graduate/course/list',
    method: 'get',
    params: query
  })
}

// 查询课程详细
export function getCourse(id) {
  return request({
    url: '/graduate/course/' + id,
    method: 'get'
  })
}

// 新增课程
export function addCourse(data) {
  return request({
    url: '/graduate/course',
    method: 'post',
    data: data
  })
}

// 修改课程
export function updateCourse(data) {
  return request({
    url: '/graduate/course',
    method: 'put',
    data: data
  })
}

// 删除课程
export function delCourse(id) {
  return request({
    url: '/graduate/course/' + id,
    method: 'delete'
  })
}

// 导出课程
export function exportCourse(query) {
  return request({
    url: '/graduate/course/export',
    method: 'post',
    data: query
  })
}

// 入学年级-专业-课程 级联选项（供流程发起页级联框使用）
export function getCourseCascaderOptions() {
  return request({
    url: '/graduate/course/cascaderOptions',
    method: 'get'
  })
}

// 获取课程的综合毕业能力达成度
export function getCourseAbilityAchievement(courseId) {
  return request({
    url: '/graduate/course/abilityAchievement/' + courseId,
    method: 'get'
  })
}

// 导出课程毕业能力达成度Excel
export function exportCourseAbilityAchievement(courseId) {
  return request({
    url: '/graduate/course/abilityAchievement/export/' + courseId,
    method: 'get',
    responseType: 'blob'
  })
}