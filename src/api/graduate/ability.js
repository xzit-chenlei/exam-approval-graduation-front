import request from '@/utils/request'

// 查询毕业达成度能力列表
export function listAbility(query) {
  return request({
    url: '/graduate/ability/list',
    method: 'get',
    params: query
  })
}

// 查询毕业达成度能力详细
export function getAbility(id) {
  return request({
    url: '/graduate/ability/' + id,
    method: 'get'
  })
}

// 新增毕业达成度能力
export function addAbility(data) {
  return request({
    url: '/graduate/ability',
    method: 'post',
    data: data
  })
}

// 修改毕业达成度能力
export function updateAbility(data) {
  return request({
    url: '/graduate/ability',
    method: 'put',
    data: data
  })
}

// 删除毕业达成度能力
export function delAbility(id) {
  return request({
    url: '/graduate/ability/' + id,
    method: 'delete'
  })
}

// 导出毕业达成度能力
export function exportAbility(query) {
  return request({
    url: '/graduate/ability/export',
    method: 'post',
    data: query
  })
}

// 获取格式化的能力下拉列表
export function getAbilityDropdown(majorId) {
  return request({
    url: '/graduate/ability/dropdown',
    method: 'get',
    params: { majorId }
  })
} 