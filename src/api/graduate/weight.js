import request from "@/utils/request";

// 查询毕业达成度各课程三类考试权重列表
export function listWeight(query) {
  return request({
    url: "/graduate/weight/list",
    method: "get",
    params: query,
  });
}

// 查询毕业达成度各课程三类考试权重详细
export function getWeight(id) {
  return request({
    url: "/graduate/weight/" + id,
    method: "get",
  });
}

// 新增毕业达成度各课程三类考试权重
export function addWeight(data) {
  return request({
    url: "/graduate/weight",
    method: "post",
    data: data,
  });
}

// 修改毕业达成度各课程三类考试权重
export function updateWeight(data) {
  return request({
    url: "/graduate/weight",
    method: "put",
    data: data,
  });
}

// 删除毕业达成度各课程三类考试权重
export function delWeight(id) {
  return request({
    url: "/graduate/weight/" + id,
    method: "delete",
  });
}
