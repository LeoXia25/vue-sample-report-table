# Draft: SampleReportTable 组件实现方案

## 需求理解

### 用户描述
- 封装一个报表查询组件 `@src/components/SampleReportTable.vue`
- 组件构成：表单组件 + 表格组件
- 通过传入组件的入参，自动渲染参数面板
- 传入 API 接口地址，组件内部发起请求获取数据
- 动态表格：表头和数据都由后端返回
- 不依赖第三方 UI 库，使用原生标签实现

---

## 技术方案

### 1. 组件 Props 设计

```typescript
interface FormField {
  key: string           // 字段标识
  label: string         // 显示标签
  type: 'input' | 'select' | 'date' | 'daterange' | 'checkbox' | 'radio'
  placeholder?: string
  options?: { label: string, value: any }[]  // select/radio/checkbox 选项
  defaultValue?: any
  rules?: string        // 校验规则，暂时用简单字符串
}

interface Props {
  // 报表标识
  reportId: string
  // 表单字段配置
  formFields: FormField[]
  // API 地址
  apiUrl: string
  // 请求方法
  method?: 'GET' | 'POST'
  // 表格列配置（可选，如果后端返回则可省略）
  columns?: TableColumn[]
  // 分页配置
  pagination?: {
    enabled: boolean
    pageSize?: number
    pageSizes?: number[]
  }
  // 查询按钮文本
  searchText?: string
  // 重置按钮文本
  resetText?: string
}
```

### 2. API 响应格式设计

**请求格式**：
```json
{
  "params": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

**响应格式**：
```json
{
  "code": 200,
  "data": {
    "columns": [
      { "key": "name", "label": "姓名", "width": 120 },
      { "key": "age", "label": "年龄", "width": 80 }
    ],
    "dataSource": [
      { "name": "张三", "age": 25 },
      { "name": "李四", "age": 30 }
    ],
    "total": 100
  },
  "message": "success"
}
```

### 3. 组件内部状态

```typescript
const state = {
  // 表单数据
  formData: {} as Record<string, any>,
  // 表格数据
  tableData: [] as any[],
  // 表格列配置
  columns: [] as TableColumn[],
  // 加载状态
  loading: false,
  // 分页
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  }
}
```

### 4. 组件结构

```
SampleReportTable
├── 表单区域 (form)
│   ├── 根据 formFields 动态渲染表单项
│   ├── 查询按钮
│   └── 重置按钮
└── 表格区域 (table)
    ├── 动态表头 (thead)
    └── 动态数据行 (tbody)
```

### 5. 技术实现要点

#### 5.1 动态表单渲染
- 使用 `v-for` 遍历 `formFields`
- 根据 `type` 渲染不同类型的表单项：
  - `input` → `<input type="text">`
  - `select` → `<select>`
  - `date` → `<input type="date">`
  - `daterange` → 两个 `<input type="date">`
  - `checkbox` → `<input type="checkbox">`
  - `radio` → `<input type="radio">`

#### 5.2 动态表格渲染
- 表头从后端返回的 `columns` 读取
- 使用 `v-for` 渲染动态列
- 支持自定义列宽度

#### 5.3 数据请求
- 使用原生 `fetch` API
- 支持 GET/POST 方法
- GET 请求：参数拼接到 URL
- POST 请求：参数放在 body 中（JSON 格式）

#### 5.4 分页实现
- 组件内部维护分页状态
- 查询时传入分页参数
- 后端需支持分页参数返回

---

## 依赖分析

- **Vue 3**: 已使用 Composition API
- **fetch API**: 原生浏览器 API，无需额外依赖
- **无第三方 UI 库**: 全部使用原生 HTML 标签

---

## 实现计划

### Task 1: 组件基础结构
- 定义 Props 接口
- 建立响应式状态
- 基础模板结构

### Task 2: 动态表单渲染
- 实现各类型表单项的渲染逻辑
- 表单数据绑定
- 查询和重置按钮

### Task 3: 数据请求逻辑
- fetch 封装
- GET/POST 处理
- 错误处理和 loading 状态

### Task 4: 动态表格渲染
- 表头动态渲染
- 数据行渲染
- 列宽处理

### Task 5: 分页功能
- 分页状态管理
- 分页 UI 实现
- 分页查询逻辑

---

## 待确认问题

1. **API 响应格式是否与上述一致？** 需要用户提供实际后端接口规范
2. **是否需要导出按钮？** 如 Excel 导出
3. **表单校验规则的具体格式？** 简单实现 vs 复杂校验
4. **是否需要支持参数联动？** 如选择省后联动市
5. **是否需要键盘快捷键？** 如回车查询
