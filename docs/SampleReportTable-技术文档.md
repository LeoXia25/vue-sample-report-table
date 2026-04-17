# SampleReportTable 组件技术文档

> 基于 Vue 3 + TypeScript + 原生 CSS 构建的通用报表查询组件，不依赖任何第三方 UI 库。

---

## 目录

1. [组件概述](#1-组件概述)
2. [文件结构](#2-文件结构)
3. [核心特性](#3-核心特性)
4. [API Props](#4-api-props)
5. [后端接口协议](#5-后端接口协议)
6. [使用示例](#6-使用示例)
7. [表格滚动实现原理](#7-表格滚动实现原理)
8. [列宽固定实现原理](#8-列宽固定实现原理)
9. [CSS 样式架构](#9-css-样式架构)
10. [事件回调](#10-事件回调)
11. [常见问题](#11-常见问题)

---

## 1. 组件概述

`SampleReportTable` 是一个高度可配置的通用报表查询组件，适用于管理后台的数据展示场景。

### 技术栈

- Vue 3 (Composition API + `<script setup>`)
- TypeScript
- 原生 CSS（无 Tailwind / Bootstrap / Element UI 等第三方库）
- 原生 Fetch（无 Axios）
- 原生方式导出 Excel（无 xlsx / exceljs 等库）

---

## 2. 文件结构

```
src/components/SampleReportTable/
├── index.vue      # 主组件（模板 + 逻辑 + 样式）
├── types.ts       # TypeScript 类型定义
└── useExport.ts  # Excel 导出工具函数
```

---

## 3. 核心特性

| 特性 | 说明 |
|---|---|
| **6 种表单字段** | input / select / date / daterange / checkbox / radio |
| **动态选项** | 支持通过 API 接口动态获取下拉选项（GET/POST） |
| **4 种布局模式** | top / bottom / left / right |
| **参数面板收缩** | 支持展开/收起，left/right 布局有细条模式 |
| **布局切换** | 工具栏按钮实时切换 4 种布局 |
| **列宽严格固定** | 完全按照后端返回的 `width` 值渲染列宽 |
| **横向滚动** | 列宽之和超过容器宽度时自动出现横向滚动条 |
| **纵向滚动** | 表头固定，数据区域独立滚动 |
| **单元格边框** | 四周边框完整，滚动时边框不断开 |
| **Excel 导出** | 原生方式导出，支持当前页 / 全部，含列宽 |
| **回调机制** | 查询/导出/自定义按钮均有回调支持 |

---

## 4. API Props

```vue
<SampleReportTable
  :report-id="'blood-info-report'"        <!-- 报表标识（用于导出文件名） -->
  :form-fields="formFields"             <!-- 表单字段配置（必填） -->
  :api-url="apiUrl"                      <!-- 数据接口地址（必填） -->
  :method="method"                        <!-- 请求方法：'GET' | 'POST'（默认 GET） -->
  :pagination="paginationConfig"          <!-- 分页配置对象 -->
  :layout="layout"                       <!-- 布局：'top' | 'bottom' | 'left' | 'right' -->
  :form-area-style="formAreaStyle"       <!-- 参数面板样式 -->
  :on-search="onSearch"                  <!-- 查询完成回调 -->
  :on-export-current="onExportCurrent"     <!-- 导出当前页回调 -->
  :on-export-all="onExportAll"            <!-- 导出全部回调 -->
  :custom-buttons="customButtons"         <!-- 自定义按钮数组 -->
  :search-text="'查询'"                  <!-- 查询按钮文本 -->
  :reset-text="'重置'"                   <!-- 重置按钮文本 -->
  @update:layout="layout = $event"     <!-- 布局切换事件 -->
/>
```

### Props 详细说明

#### `formFields` — 表单字段配置

```typescript
type FieldType = 'input' | 'select' | 'date' | 'daterange' | 'checkbox' | 'radio'

interface FormField {
  key: string              // 字段标识（与后端接口参数名对应）
  label: string            // 显示标签
  type: FieldType          // 字段类型
  placeholder?: string     // 占位文本
  defaultValue?: any       // 默认值（daterange 需 { start, end }）
  multiple?: boolean       // select 是否多选
  options?: FieldOption[]  // 静态选项（select/checkbox/radio 用）
  dynamicOptions?: {        // 动态选项（与 options 二选一）
    optionsUrl: string          // 选项接口地址
    optionsMethod?: 'GET' | 'POST'   // 默认 GET
    optionsParams?: Record<string, any>
    optionsSuccessCode?: number       // 默认 0 或 200
    optionsCodeKey?: string           // 默认 'code'
    optionsDataKey?: string           // 默认 'data'
    optionsLabelKey?: string          // 如 'hospitalName'
    optionsValueKey?: string          // 如 'hospitalCode'
  }
}
```

#### `pagination` — 分页配置

```typescript
interface PaginationConfig {
  enabled: boolean       // 是否启用（必填）
  pageSize?: number       // 默认每页条数（默认 10）
  pageSizes?: number[]    // 可选条数（默认 [10, 20, 50]）
}
```

#### `customButtons` — 自定义按钮

```typescript
interface CustomButton {
  text: string                     // 按钮文本
  style?: string                   // 内联样式（如 'background: #52c41a; color: #fff'）
  disabled?: boolean               // 是否禁用
  onClick: (payload: { formData: any; tableData: any[] }) => void
}
```

---

## 5. 后端接口协议

### 请求格式

**GET 请求**：
```
GET /api/xxx?startTime=2025-03-17&endTime=2026-05-17&PageIndex=1&PageSize=10
```

**POST 请求**：
```json
POST /api/xxx
Content-Type: application/json

{
  "params": {
    "startTime": "2025-03-17",
    "endTime": "2026-05-17"
  },
  "pageIndex": 1,
  "pageSize": 10
}
```

### 响应格式

```json
{
  "code": 200,
  "data": {
    "columns": [
      { "key": "name",        "label": "姓名",     "width": 120 },
      { "key": "gender",     "label": "性别",     "width": 80  },
      { "key": "birthday",   "label": "出生日期", "width": 120 },
      { "key": "status",     "label": "状态",     "width": 80  },
      { "key": "createTime", "label": "创建时间", "width": 120 }
    ],
    "dataSource": [
      { "name": "张三", "gender": "男", "birthday": "1990-01-01", "status": "启用", "createTime": "2024-01-15" }
    ],
    "recordCount": 19,
    "pageIndex": 1,
    "pageSize": 10
  },
  "message": "success"
}
```

> **列宽说明**：`columns[].width` 为数值（单位 px），组件会严格按照此值渲染列宽。建议总宽度不超过 2000px，超出时横向滚动自动出现。

---

## 6. 使用示例

### 6.1 基础用法（Top 布局）

```vue
<script setup>
import { ref } from 'vue'
import SampleReportTable from '@/components/SampleReportTable/index.vue'

const formFields = [
  {
    key: 'startTime',
    label: '开始时间',
    type: 'date',
    defaultValue: '2025-03-17'
  },
  {
    key: 'hospitalCode',
    label: '医疗机构',
    type: 'select',
    defaultValue: '',
    dynamicOptions: {
      optionsUrl: '/api/Sys_Hospital/GetHospitals',
      optionsLabelKey: 'HospitalName',
      optionsValueKey: 'HospitalCode'
    }
  },
  {
    key: 'queryStr',
    label: '查询条件',
    type: 'input',
    placeholder: '请输入...'
  }
]

const apiUrl = ref('/api/QcEvaluate/queryBloodInfo')
const layout = ref('top')

function onSearch(payload) {
  console.log('查询结果', payload.tableData)
}
</script>

<template>
  <div style="height: 100vh; overflow: hidden;">
    <SampleReportTable
      :report-id="'blood-report'"
      :form-fields="formFields"
      :api-url="apiUrl"
      :method="'GET'"
      :layout="layout"
      :pagination="{ enabled: true, pageSize: 10, pageSizes: [10, 20, 50] }"
      @update:layout="layout = $event"
      :on-search="onSearch"
    />
  </div>
</template>
```

### 6.2 Left 布局（侧边栏参数面板）

```typescript
const layout = ref('left')
```

### 6.3 带自定义按钮

```typescript
const customButtons = [
  {
    text: '通过审核',
    style: 'background: #52c41a; color: #fff;',
    onClick: ({ formData, tableData }) => {
      console.log('选中的数据', tableData)
    }
  },
  {
    text: '批量删除',
    style: 'background: #ff4d4f; color: #fff;',
    disabled: false
  }
]
```

---

## 7. 表格滚动实现原理

### 滚动结构

```
.table-scroll-x (overflow: auto)              ← 横向 + 纵向滚动容器
  table.data-table (width: tableMinWidth)
       thead th (position: sticky; top:0)   ← 纵向滚动时固定
       tbody                                  ← 纵向滚动区域
```

### 关键技术点

**1. `position: sticky` 固定表头**

```css
.data-table thead th {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 2;
}
```

- `top: 0` → 纵向滚动时表头吸顶固定
- `left: 0` → 横向滚动时表头跟随滚动，与内容始终对齐
- `z-index: 2` → 保证表头在内容之上

**2. 单 table 结构**

- 不使用双 table（thead + tbody 分离）方案
- 单 table 中 `position: sticky` 让 thead 自然固定
- 横向滚动时表头和内容天然同步，因为是同一个 table

**3. `border-collapse: separate`**

- `border-collapse: collapse` 与 `position: sticky` 存在已知冲突：滚动时 sticky 元素的左右边框会被滚动容器的 `overflow: clip` 吃掉
- 使用 `border-collapse: separate` + 每个单元格独立四边框解决

---

## 8. 列宽固定实现原理

### 目标

- 列宽严格按照后端返回的 `width` 值渲染
- 列宽之和 < 容器宽度 → 不拉伸，列宽保持不变
- 列宽之和 ≥ 容器宽度 → 触发横向滚动

### 实现方式

**Step 1 — `table-layout: fixed`**

```css
.data-table {
  table-layout: fixed;
}
```

告诉浏览器按照固定布局算法计算列宽，不再根据内容自动分配。

**Step 2 — 表格宽度设为列宽之和**

```typescript
// JS: 计算列宽总和
const tableMinWidth = computed(() => {
  return columns.value.reduce((sum, col) => sum + (col.width || 100), 0)
})
```

```html
<!-- 模板: 绑定到 table 的 inline style -->
<table class="data-table" :style="{ width: tableMinWidth + 'px' }">
```

- `inline style` 优先级高于 CSS
- 表格宽度 = 列宽之和，不会被容器压缩

**Step 3 — 每列指定宽度**

```html
<colgroup>
  <col v-for="col in columns" :style="{ width: (col.width || 100) + 'px' }" />
</colgroup>
<thead>
  <th ... :style="{ width: (col.width || 100) + 'px' }">{{ col.label }}</th>
</thead>
<tbody>
  <td ... :style="{ width: (col.width || 100) + 'px' }">{{ row[col.key] }}</td>
</tbody>
```

`<col>` + `<th>` + `<td>` 三者同时指定宽度，形成强制约束。

**Step 4 — 横向滚动**

```css
.table-scroll-x {
  overflow: auto;    /* 横向和纵向滚动都在这里 */
}
```

当 `tableMinWidth` > 容器宽度时，`overflow: auto` 自动产生横向滚动条。

---

## 9. CSS 样式架构

### 布局相关

| 类名 | 说明 |
|---|---|
| `.layout-top` | 上下布局：表单在上，表格在下 |
| `.layout-bottom` | 上下布局：表单在下，表格在上 |
| `.layout-left` | 左右布局：表单在左，表格在右 |
| `.layout-right` | 左右布局：表单在右，表格在左 |

### 参数面板

| 类名 | 说明 |
|---|---|
| `.form-area` | 横向参数面板容器 |
| `.form-area-vertical` | 纵向参数面板容器（左右布局） |
| `.form-area-collapsed` | 收缩状态（宽度缩小至 52px） |
| `.form-fields` | 表单字段横向排列 |
| `.form-fields-vertical` | 表单字段纵向排列 |
| `.layout-toggle-group` | 布局切换按钮组 |
| `.collapse-bar` | 收缩时显示的细条（上下布局） |
| `.left-collapse-strip` | 收缩竖条（左右布局） |

### 表格

| 类名 | 说明 |
|---|---|
| `.table-wrapper` | 表格 + 分页容器 |
| `.table-scroll-x` | 滚动容器（横向+纵向滚动，四周边框） |
| `.data-table` | 表格（`table-layout: fixed`） |
| `.loading-cell` | 加载中单元格（跨列居中） |
| `.empty-cell` | 空数据单元格（跨列居中） |

### 自定义样式变量

参数面板支持通过 `formAreaStyle` 自定义，CSS 变量自动适配：

| CSS 变量 | 说明 | 默认值 |
|---|---|---|
| `--form-text-color` | 表单文字颜色 | `#333` |
| `--form-border-color` | 表单边框颜色 | `#ccc` |
| `--form-input-bg` | 输入框背景色 | `#fff` |
| `--toggle-active-color` | 布局按钮激活色 | `#1890ff` |
| `--toggle-inactive-color` | 布局按钮未激活色 | `#999` |

---

## 10. 事件回调

### `onSearch` — 查询完成回调

```typescript
function onSearch(payload: {
  formData: Record<string, any>     // 表单数据
  tableData: Record<string, any>[]   // 表格数据
  columns: TableColumn[]             // 列配置（含 width）
  pagination: {                      // 分页信息
    current: number
    pageSize: number
    total: number
    pageCount: number
  }
}) => void
```

### `onExportCurrent` — 导出当前页回调

```typescript
function onExportCurrent(payload: {
  formData: Record<string, any>
  tableData: Record<string, any>[]
  columns: TableColumn[]
}) => void
```

### `onExportAll` — 导出全部回调

```typescript
function onExportAll(payload: {
  formData: Record<string, any>
  tableData: Record<string, any>[]  // 全部数据（不限分页）
  columns: TableColumn[]
}) => void
```

### `update:layout` — 布局切换事件

```vue
@update:layout="layout = $event"
```

`$event` 值为 `'top'` | `'bottom'` | `'left'` | `'right'` 之一。

---

## 11. 常见问题

**Q: 列宽没有按后端返回值显示？**

A: 确保后端接口返回的 `columns` 数组中每个元素包含 `width` 数值字段（如 `"width": 120`）。组件默认列宽为 `100px`，仅当后端返回 `width` 时才按返回值渲染。

**Q: 横向滚动条没有出现？**

A: 检查列宽之和是否超过组件容器宽度。后端每列 `width` 建议总和在 1500px 以上，可触发滚动条。

**Q: 表头在滚动时左右边框消失了？**

A: 这是 `border-collapse: collapse` 与 `position: sticky` 的已知冲突。组件已使用 `border-collapse: separate` + 独立四边框解决。

**Q: 导出 Excel 乱码？**

A: 组件使用 UTF-8 编码的 XML 格式导出，Excel 2007+ 可直接打开。某些低版本 Excel 打开可能显示警告，建议后端生成或转换格式。

**Q: 参数面板的动态选项加载失败？**

A: 检查 `dynamicOptions.optionsUrl` 接口是否可访问，返回格式是否符合 `optionsDataKey`、`optionsLabelKey`、`optionsValueKey` 配置。加载失败时组件会在控制台输出警告，不阻塞主流程。

---

*文档版本：v1.0 | 更新日期：2026-04-17*
