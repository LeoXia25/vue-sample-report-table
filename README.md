# Vue SampleReportTable

Vue 3 通用报表查询组件 — 零依赖、开箱即用。

## 特性

- 🧩 **6 种表单字段**：input / select / date / daterange / checkbox / radio
- 🔄 **动态选项**：支持通过 API 接口动态获取下拉选项
- 🎨 **4 种布局**：top / bottom / left / right，实时切换
- 📏 **列宽严格固定**：完全按照后端返回的 `width` 渲染，超出自动横向滚动
- 🔒 **表头固定**：纵向滚动时表头吸顶，数据行独立滚动
- 📦 **原生导出**：不依赖任何库，支持当前页 / 全部导出 Excel
- 🔌 **全回调支持**：查询 / 导出 / 自定义按钮均有回调
- ⚡ **零第三方依赖**：纯 Vue 3 + TypeScript + 原生 CSS

## 安装

```bash
npm install vue-sample-report-table
# 或
yarn add vue-sample-report-table
# 或
pnpm add vue-sample-report-table
```

## 快速开始

```vue
<script setup>
import { ref } from 'vue'
import SampleReportTable from 'vue-sample-report-table'
import 'vue-sample-report-table/dist/style.css'

const formFields = [
  { key: 'startTime', label: '开始时间', type: 'date', defaultValue: '2025-01-01' },
  { key: 'endTime',   label: '结束时间', type: 'date' },
  { key: 'name',      label: '姓名',     type: 'input', placeholder: '请输入...' }
]

const apiUrl = ref('/api/report/list')
const layout = ref('top')

function onSearch(payload) {
  console.log('查询结果', payload.tableData)
}
</script>

<template>
  <div style="height: 100vh; overflow: hidden;">
    <SampleReportTable
      :report-id="'my-report'"
      :form-fields="formFields"
      :api-url="apiUrl"
      :method="'GET'"
      :layout="layout"
      :pagination="{ enabled: true, pageSize: 10, pageSizes: [10, 20, 50] }"
      :on-search="onSearch"
      @update:layout="layout = $event"
    />
  </div>
</template>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `reportId` | `string` | — | 报表标识（用于导出文件名） |
| `formFields` | `FormField[]` | — | 表单字段配置（必填） |
| `apiUrl` | `string` | — | 数据接口地址（必填） |
| `method` | `'GET' \| 'POST'` | `'GET'` | 请求方法 |
| `pagination` | `PaginationConfig` | `{ enabled: true }` | 分页配置 |
| `layout` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 布局模式 |
| `formAreaStyle` | `object` | `{}` | 参数面板样式（可覆盖背景色等） |
| `searchText` | `string` | `'查询'` | 查询按钮文本 |
| `resetText` | `string` | `'重置'` | 重置按钮文本 |
| `onSearch` | `Function` | — | 查询完成回调 |
| `onExportCurrent` | `Function` | — | 导出当前页回调 |
| `onExportAll` | `Function` | — | 导出全部回调 |
| `customButtons` | `CustomButton[]` | `[]` | 自定义按钮 |

## 布局模式

```
top    — 参数面板在上，表格在下
bottom — 参数面板在下，表格在上
left   — 参数面板在左（侧边栏），表格在右
right  — 参数面板在右（侧边栏），表格在左
```

## 表单字段类型

```typescript
// 静态选项
{ key: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }] }

// 动态选项（API 获取）
{
  key: 'hospital',
  label: '医疗机构',
  type: 'select',
  dynamicOptions: {
    optionsUrl: '/api/hospitals',
    optionsLabelKey: 'hospitalName',
    optionsValueKey: 'hospitalCode'
  }
}

// 日期范围
{ key: 'range', label: '日期范围', type: 'daterange', defaultValue: { start: '2025-01-01', end: '2025-12-31' } }
```

## 后端接口协议

**响应格式：**
```json
{
  "code": 200,
  "data": {
    "columns": [
      { "key": "name", "label": "姓名", "width": 120 },
      { "key": "age",  "label": "年龄", "width": 80 }
    ],
    "dataSource": [
      { "name": "张三", "age": 30 },
      { "name": "李四", "age": 25 }
    ],
    "recordCount": 100,
    "pageIndex": 1,
    "pageSize": 10
  }
}
```

> 列宽 `width` 为数值（px），组件严格按照此值渲染。建议总宽度不超过 2000px。

## License

MIT
