import request from '@/utils/request'
// 获取文件路径
export function getTmpUrl(query) {
  return request({
    url: '/common/v3/getTmpUrl',
    method: 'get',
    params: query
  })
}
// 获取文件路径列表
export function getTmpUrlList(query) {
  return request({
    url: '/common/v3/getTmpUrlList',
    method: 'get',
    params: query
  })
}
export function deleteFile(query) {
  return request({
    url: '/common/v3/delete',
    method: 'delete',
    params: query
  })
}