import request from '@/utils/request'

// 教研室列表
export function listOffice(query) {
  return request({
    url: '/exam/teachingResearchOffice/list',
    method: 'get',
    params: query
  })
}

// 教研室详情
export function getOffice(id) {
  return request({
    url: `/exam/teachingResearchOffice/${id}`,
    method: 'get'
  })
}

// 新增教研室
export function addOffice(data) {
  return request({
    url: '/exam/teachingResearchOffice',
    method: 'post',
    data
  })
}

// 更新教研室
export function updateOffice(data) {
  return request({
    url: '/exam/teachingResearchOffice',
    method: 'put',
    data
  })
}

// 删除教研室
export function delOffice(id) {
  return request({
    url: `/exam/teachingResearchOffice/${id}`,
    method: 'delete'
  })
}

// 查询教研室下用户
export function listOfficeUsers(officeId, query) {
  return request({
    url: `/exam/teachingResearchOffice/${officeId}/users`,
    method: 'get',
    params: query
  })
}

// 向教研室批量添加用户
export function addOfficeUsers(officeId, userIds) {
  return request({
    url: `/exam/teachingResearchOffice/${officeId}/users`,
    method: 'post',
    data: { userIds }
  })
}

// 从教研室批量移除用户
export function removeOfficeUsers(officeId, userIds) {
  return request({
    url: `/exam/teachingResearchOffice/${officeId}/users`,
    method: 'delete',
    data: { userIds }
  })
}

// 公共接口：获取全部教研室（无权限校验）
export function listAllOffices() {
  return request({
    url: '/exam/teachingResearchOffice/public/listAll',
    method: 'get'
  })
}
