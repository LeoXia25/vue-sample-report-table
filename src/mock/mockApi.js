/**
 * Mock 数据 - 模拟后端接口
 */

// 模拟数据源
const mockDataSource = [
  { name: '张三', gender: '男', birthday: '1990-01-01', status: '启用', createTime: '2024-01-15' },
  { name: '李四', gender: '女', birthday: '1992-05-20', status: '启用', createTime: '2024-01-16' },
  { name: '王五', gender: '男', birthday: '1988-08-10', status: '禁用', createTime: '2024-01-17' },
  { name: '赵六', gender: '女', birthday: '1995-12-25', status: '启用', createTime: '2024-01-18' },
  { name: '钱七', gender: '男', birthday: '1991-03-08', status: '启用', createTime: '2024-01-19' },
  { name: '孙八', gender: '女', birthday: '1993-07-14', status: '禁用', createTime: '2024-01-20' },
  { name: '周九', gender: '男', birthday: '1989-10-30', status: '启用', createTime: '2024-01-21' },
  { name: '吴十', gender: '女', birthday: '1994-02-28', status: '启用', createTime: '2024-01-22' },
  { name: '郑一', gender: '男', birthday: '1990-06-18', status: '启用', createTime: '2024-01-23' },
  { name: '王二', gender: '女', birthday: '1996-09-05', status: '禁用', createTime: '2024-01-24' },
  { name: '冯三', gender: '男', birthday: '1987-11-12', status: '启用', createTime: '2024-01-25' },
  { name: '陈四', gender: '女', birthday: '1992-04-22', status: '启用', createTime: '2024-01-26' },
  { name: '褚五', gender: '男', birthday: '1991-08-03', status: '禁用', createTime: '2024-01-27' },
  { name: '卫六', gender: '女', birthday: '1988-12-19', status: '启用', createTime: '2024-01-28' },
  { name: '蒋七', gender: '男', birthday: '1993-05-07', status: '启用', createTime: '2024-01-29' },
  { name: '沈八', gender: '女', birthday: '1995-01-11', status: '启用', createTime: '2024-01-30' },
  { name: '韩九', gender: '男', birthday: '1990-07-23', status: '禁用', createTime: '2024-01-31' },
  { name: '杨十', gender: '女', birthday: '1989-03-15', status: '启用', createTime: '2024-02-01' },
  { name: '朱一', gender: '男', birthday: '1994-10-09', status: '启用', createTime: '2024-02-02' },
  { name: '秦二', gender: '女', birthday: '1992-06-26', status: '启用', createTime: '2024-02-03' }
]

// 列定义（统一）
const MOCK_COLUMNS = [
  { key: 'name', label: '姓名', width: 120 },
  { key: 'gender', label: '性别', width: 80 },
  { key: 'birthday', label: '出生日期', width: 120 },
  { key: 'status', label: '状态', width: 80 },
  { key: 'createTime', label: '创建时间', width: 120 }
]

/**
 * 从请求中解析查询参数（兼容 GET 和 POST）
 */
function parseQueryParams(request) {
  const params = {}

  // GET：从 URL 解析
  if (request.method === 'GET' || !request.method) {
    const url = new URL(request.url)
    url.searchParams.forEach((value, key) => {
      if (key !== 'PageIndex' && key !== 'PageSize') {
        params[key] = value
      }
    })
  }

  // POST：从 body 解析
  if (request.method === 'POST') {
    try {
      const body = request._body || null
      if (body) {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body
        // body 可能是 { params: {...}, pageIndex, pageSize } 或直接是 {...}
        const data = parsed.params || parsed
        for (const [key, value] of Object.entries(data)) {
          if (key !== 'PageIndex' && key !== 'PageSize' && value !== undefined && value !== null) {
            params[key] = String(value)
          }
        }
      }
    } catch (e) {
      // body 解析失败，忽略
    }
  }

  return params
}

/**
 * 处理 mock API 请求
 */
export async function handleMockRequest(request) {
  // 支持 POST body 读取
  if (request.method === 'POST' && !request._body) {
    try {
      request._body = await request.clone().text()
    } catch (e) {
      request._body = null
    }
  }

  // 解析分页参数（优先从 URL，POST 时也读 body）
  const url = new URL(request.url)
  let pageIndex = parseInt(url.searchParams.get('PageIndex') || '1', 10)
  let pageSize = parseInt(url.searchParams.get('PageSize') || '10', 10)

  if (request.method === 'POST' && request._body) {
    try {
      const parsed = JSON.parse(request._body)
      if (parsed.PageIndex) pageIndex = parseInt(parsed.PageIndex, 10)
      if (parsed.PageSize) pageSize = parseInt(parsed.PageSize, 10)
      if (parsed.pageIndex) pageIndex = parseInt(parsed.pageIndex, 10)
      if (parsed.pageSize) pageSize = parseInt(parsed.pageSize, 10)
    } catch (e) {}
  }

  // 解析查询参数
  const params = parseQueryParams(request)

  // 模拟过滤
  let filteredData = mockDataSource.filter(item => {
    for (const [key, value] of Object.entries(params)) {
      if (key === 'name' && !item.name.includes(value)) return false
      if (key === 'gender' && item.gender !== value) return false
      if (key === 'status' && item.status !== value) return false
      if (key === 'hobbies' && !item.hobbies?.includes(value)) return false
    }
    return true
  })

  // 模拟分页
  const total = filteredData.length
  const start = (pageIndex - 1) * pageSize
  const end = start + pageSize
  const paginatedData = filteredData.slice(start, end)

  const response = {
    code: 200,
    data: {
      columns: MOCK_COLUMNS,
      dataSource: paginatedData,
      recordCount: total,
      pageIndex: pageIndex,
      pageSize: pageSize
    },
    message: 'success'
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 注册 mock fetch 拦截（开发环境）
 */
export function registerMockServiceWorker() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return

  const originalFetch = window.fetch
  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input
      : input instanceof URL ? input.href
      : input.url

    if (url.includes('/api/')) {
      const req = new Request(url, init || {})
      return handleMockRequest(req)
    }

    return originalFetch(input, init)
  }
}
