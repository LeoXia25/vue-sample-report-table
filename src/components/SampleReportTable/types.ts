/**
 * SampleReportTable 组件类型定义
 */

// 表单字段类型
export type FieldType = 'input' | 'select' | 'date' | 'daterange' | 'checkbox' | 'radio'

// 静态选项
export interface FieldOption {
  /** 显示文本 */
  label: string
  /** 值 */
  value: any
}

// 动态选项配置
export interface DynamicOptionsConfig {
  /** 选项接口地址 */
  optionsUrl?: string
  /** 请求方法，默认 GET */
  optionsMethod?: 'GET' | 'POST'
  /** 请求参数（GET 时作为 Query，POST 时作为 Body） */
  optionsParams?: Record<string, any>
  /** 响应中表示成功的状态码，默认 0 或 200 */
  optionsSuccessCode?: number
  /** 响应中状态字段名，默认 'code' */
  optionsCodeKey?: string
  /** 响应数据中选项数组的字段名，如 'data' */
  optionsDataKey?: string
  /** 映射到 label 的字段名，如 'hospitalName' */
  optionsLabelKey?: string
  /** 映射到 value 的字段名，如 'hospitalCode' */
  optionsValueKey?: string
}

// 表单字段配置
export interface FormField {
  /** 字段唯一标识 */
  key: string
  /** 显示的标签 */
  label: string
  /** 字段类型 */
  type: FieldType
  /** 占位文本 */
  placeholder?: string
  /** 静态选项列表（select/radio/checkbox 使用） */
  options?: FieldOption[]
  /** 动态选项配置（与 options 二选一） */
  dynamicOptions?: DynamicOptionsConfig
  /** 默认值 */
  defaultValue?: any
  /** 提示信息 */
  tip?: string
  /** select 是否启用多选（Ctrl+点击） */
  multiple?: boolean
}

// 表格列配置
export interface TableColumn {
  /** 列标识（对应数据字段） */
  key: string
  /** 列标题 */
  label: string
  /** 列宽度（px） */
  width?: number
}

// API 响应数据
export interface ApiResponseData {
  /** 表头配置 */
  columns: TableColumn[]
  /** 数据源 */
  dataSource: Record<string, any>[]
  /** 总记录数 */
  recordCount: number
  /** 当前页码 */
  pageIndex: number
  /** 每页条数 */
  pageSize: number
}

// API 响应结构
export interface ApiResponse {
  code: number
  data: ApiResponseData
  message: string
}

// 分页配置
export interface PaginationConfig {
  /** 是否启用分页 */
  enabled: boolean
  /** 默认每页条数 */
  pageSize?: number
  /** 可选择的每页条数 */
  pageSizes?: number[]
}

// 回调参数（查询 / 导出通用）
export interface CallbackPayload {
  /** 表单数据 */
  formData: Record<string, any>
  /** 表格数据 */
  tableData: Record<string, any>[]
  /** 列配置 */
  columns: TableColumn[]
  /** 分页信息（仅查询回调有） */
  pagination?: {
    current: number
    pageSize: number
    total: number
    pageCount: number
  }
}

// 自定义按钮配置
export interface CustomButton {
  /** 按钮文本 */
  text: string
  /** 点击回调，接收表单数据和表格数据 */
  onClick: (payload: { formData: Record<string, any>; tableData: Record<string, any>[] }) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式（如 'background: #ff6600; color: #fff'） */
  style?: string
}

// 组件 Props
export interface Props {
  /** 报表标识 */
  reportId: string
  /** 表单字段配置 */
  formFields: FormField[]
  /** API 地址 */
  apiUrl: string
  /** 请求方法 */
  method?: 'GET' | 'POST'
  /** 分页配置 */
  pagination?: PaginationConfig
  /** 查询按钮文本 */
  searchText?: string
  /** 重置按钮文本 */
  resetText?: string
  /** 查询按钮点击回调 */
  onSearch?: (payload: CallbackPayload) => void
  /** 导出当前页按钮点击回调 */
  onExportCurrent?: (payload: Omit<CallbackPayload, 'pagination'>) => void
  /** 导出全部按钮点击回调 */
  onExportAll?: (payload: Omit<CallbackPayload, 'pagination'>) => void
  /** 自定义按钮（按顺序排在重置按钮后面） */
  customButtons?: CustomButton[]
}

// 导出选项
export interface ExportOptions {
  /** 列配置 */
  columns: TableColumn[]
  /** 数据 */
  data: Record<string, any>[]
  /** 文件名 */
  filename: string
  /** 导出模式 */
  mode: 'current' | 'all'
}
