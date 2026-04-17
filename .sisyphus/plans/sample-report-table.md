# SampleReportTable 组件实现计划

## TL;DR

> **快速概要**：封装一个通用的 Vue 3 报表查询组件，支持动态表单渲染、动态表格渲染、分页和导出功能，纯原生实现无第三方 UI 依赖。

> **交付物**：
> - `src/components/SampleReportTable.vue` - 主组件
> - `src/components/SampleReportTable/types.ts` - 类型定义
> - `src/components/SampleReportTable/useExport.ts` - 导出逻辑
> - 示例页面 `src/views/ReportDemo.vue` - 使用示例

> **预计工作量**：Medium
> **并行执行**：YES - 3 waves
> **关键路径**：Task 1 → Task 2 → Task 5 → Task 7

---

## Context

### 项目背景
- Vue 3 + Vite 项目，使用 `<script setup>` 语法
- 无第三方 UI 库，使用原生 HTML 标签实现
- 现有组件：`HelloWorld.vue` 作为参考

### API 约定

**请求格式**：
```json
// GET: ?field1=value1&field2=value2&PageIndex=1&PageSize=10
// POST: { params: { field1, field2 }, pageIndex: 1, pageSize: 10 }
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
    "recordCount": 100,
    "pageIndex": 1,
    "pageSize": 10
  },
  "message": "success"
}
```

---

## Work Objectives

### 核心目标
实现一个配置化的报表查询组件，通过 props 传入表单配置和 API 地址，组件自动完成数据查询、渲染和导出。

### 具体交付物

| 文件 | 说明 |
|------|------|
| `src/components/SampleReportTable/types.ts` | Props 和内部类型定义 |
| `src/components/SampleReportTable/useExport.ts` | 导出逻辑（SheetJS） |
| `src/components/SampleReportTable.vue` | 主组件 |
| `src/views/ReportDemo.vue` | 使用示例页面 |

### Must Have
- [x] 动态表单渲染（input/select/date/daterange/checkbox/radio）
- [x] 动态表格渲染（表头和数据由后端返回）
- [x] 分页功能（RecordCount/PageIndex/PageSize）
- [x] 查询和重置功能
- [x] Loading 状态展示
- [x] 导出当前页功能
- [x] 导出全部数据功能

### Must NOT Have (Guardrails)
- 不引入任何第三方 UI 库（Element UI、Ant Design 等）
- 不引入任何 CSS 框架（Bootstrap、Tailwind 等）
- 不实现复杂的表单联动逻辑
- 不实现列排序、列拖拽等高级表格功能

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None（纯 UI 组件）
- **Agent-Executed QA**: 手动验证组件功能

### QA Policy
- 组件在 `ReportDemo.vue` 中进行手动验证
- 验证场景包括：表单渲染、数据加载、分页切换、导出功能

---

## Execution Strategy

### 并行执行 Waves

```
Wave 1 (Start Immediately - 基础模块):
├── Task 1: 类型定义文件 (types.ts)
├── Task 2: 导出逻辑 (useExport.ts)
└── Task 3: 组件基础结构 (SampleReportTable.vue)

Wave 2 (After Wave 1 - 表单渲染):
├── Task 4: 动态表单组件
└── Task 5: 表单交互逻辑（查询/重置）

Wave 3 (After Wave 2 - 表格渲染):
├── Task 6: 动态表格组件
├── Task 7: 分页组件
└── Task 8: 导出功能集成

Wave FINAL:
├── Task F1: ReportDemo 示例页面
└── Task F2: 功能验证
```

### Dependency Matrix
- **Tasks 1-3**: None - 可以并行开始
- **Task 4-5**: 依赖 Task 1, 3（类型定义和基础结构）
- **Task 6-7**: 依赖 Task 3（基础结构）
- **Task 8**: 依赖 Task 2, 6, 7（导出逻辑和表格）
- **F1**: 依赖 Task 8（完整组件）

---

## TODOs

- [ ] 1. 类型定义文件 (types.ts)

  **What to do**:
  - 创建 `src/components/SampleReportTable/types.ts`
  - 定义 `FormField` 接口（key, label, type, placeholder, options, defaultValue）
  - 定义 `TableColumn` 接口（key, label, width）
  - 定义 `ApiResponse` 接口（columns, dataSource, recordCount, pageIndex, pageSize）
  - 定义 `Props` 接口

  **Must NOT do**:
  - 不实现业务逻辑
  - 不依赖组件内部状态

  **Recommended Agent Profile**:
  > **Category**: quick（单一文件，类型定义）
  > **Skills**: []
  > Reason: 纯类型定义，无复杂逻辑

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: None

  **References**:
  - `src/components/HelloWorld.vue` - 项目组件结构参考

  **Acceptance Criteria**:
  - [ ] `src/components/SampleReportTable/types.ts` 文件存在
  - [ ] 包含 FormField, TableColumn, ApiResponse, Props 接口
  - [ ] TypeScript 编译无错误

  **QA Scenarios**:

  \`\`\`
  Scenario: 类型定义完整性验证
    Tool: Bash
    Preconditions: 文件已创建
    Steps:
      1. 运行 tsc --noEmit 检查类型错误
    Expected Result: 无编译错误
    Failure Indicators: TSError
    Evidence: .sisyphus/evidence/task-1-types-check.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(types): add SampleReportTable type definitions`
  - Files: `src/components/SampleReportTable/types.ts`

---

- [ ] 2. 导出逻辑 (useExport.ts)

  **What to do**:
  - 创建 `src/components/SampleReportTable/useExport.ts`
  - 使用原生方式生成 CSV/Excel 文件（不依赖 SheetJS，用字符串拼接）
  - 实现 `exportToExcel(columns, data, filename)` 函数
  - 支持导出当前页数据和全部数据
  - 生成 `.xlsx` 文件（使用 Excel XML 格式）

  **Must NOT do**:
  - 不引入任何第三方库
  - 不实现复杂的样式设置

  **Recommended Agent Profile**:
  > **Category**: quick（工具函数）
  > **Skills**: []
  > Reason: 纯函数实现，无 Vue 组件逻辑

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 8
  - **Blocked By**: None

  **References**:
  - 无（原生实现）

  **Acceptance Criteria**:
  - [ ] `src/components/SampleReportTable/useExport.ts` 文件存在
  - [ ] 导出函数接收 columns 和 data 参数
  - [ ] 生成的文件可以被 Excel 打开

  **QA Scenarios**:

  \`\`\`
  Scenario: 导出功能基本验证
    Tool: Bash
    Preconditions: useExport.ts 已创建
    Steps:
      1. 创建测试数据 columns 和 data
      2. 调用 exportToExcel 生成文件
      3. 检查文件是否存在且大小 > 0
    Expected Result: 文件生成成功
    Failure Indicators: 文件不存在或为空
    Evidence: .sisyphus/evidence/task-2-export-basic.xls
  \`\`\`

  \`\`\`
  Scenario: 导出文件 Excel 兼容性验证
    Tool: Bash
    Preconditions: 导出文件已生成
    Steps:
      1. 使用 file 命令检查文件类型
    Expected Result: 文件类型为 Office Excel 或 ZIP
    Failure Indicators: 文件损坏或格式错误
    Evidence: .sisyphus/evidence/task-2-export-type-check.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(export): add export utility for Excel generation`
  - Files: `src/components/SampleReportTable/useExport.ts`

---

- [ ] 3. 组件基础结构 (SampleReportTable.vue)

  **What to do**:
  - 创建 `src/components/SampleReportTable.vue`
  - 实现基础 `<template>` 结构：form 区域 + table 区域
  - 定义 props 接收参数
  - 建立响应式状态（formData, tableData, columns, loading, pagination）
  - 实现基础样式（简洁的表格样式）

  **Must NOT do**:
  - 不实现具体的表单项渲染逻辑（Task 4）
  - 不实现具体的表格渲染逻辑（Task 6）

  **Recommended Agent Profile**:
  > **Category**: quick（Vue 组件基础结构）
  > **Skills**: []
  > Reason: 基础结构搭建，无复杂逻辑

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 4, 5, 6, 7
  - **Blocked By**: None

  **References**:
  - `src/components/HelloWorld.vue` - Vue 3 script setup 语法参考

  **Acceptance Criteria**:
  - [ ] 组件文件存在：`src/components/SampleReportTable.vue`
  - [ ] 包含 `<script setup>` 和 `<template>` 结构
  - [ ] 定义了所有必要的 props
  - [ ] 建立了响应式状态

  **QA Scenarios**:

  \`\`\`
  Scenario: 组件基础结构验证
    Tool: Bash
    Preconditions: 组件文件已创建
    Steps:
      1. 运行 vite build 检查编译是否成功
    Expected Result: 编译成功，无错误
    Failure Indicators: 编译错误
    Evidence: .sisyphus/evidence/task-3-build.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(component): add SampleReportTable base structure`
  - Files: `src/components/SampleReportTable.vue`

---

- [ ] 4. 动态表单组件

  **What to do**:
  - 根据 `formFields` 配置数组，动态渲染表单项
  - 支持类型：input, select, date, daterange, checkbox, radio
  - 使用 `v-for` 遍历 `formFields`
  - 使用 `v-if` 根据 `type` 渲染不同表单项
  - 实现表单项的 `v-model` 双向绑定

  **Must NOT do**:
  - 不实现复杂的表单校验（可选功能）
  - 不实现参数联动逻辑

  **Recommended Agent Profile**:
  > **Category**: unspecified-low（Vue 表单渲染）
  > **Skills**: []
  > Reason: 标准 Vue 表单渲染模式

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 1, 3

  **References**:
  - Vue 3 官方文档：`v-for`, `v-if`, `v-model`
  - `src/components/SampleReportTable/types.ts` - FormField 类型

  **Acceptance Criteria**:
  - [ ] 所有 formFields 类型都能正确渲染
  - [ ] input 类型可输入和绑定
  - [ ] select 类型可选择选项
  - [ ] date/daterange 类型可选择日期
  - [ ] checkbox/radio 类型可选中

  **QA Scenarios**:

  \`\`\`
  Scenario: 表单渲染验证
    Tool: Bash (vite dev 模式启动)
    Preconditions: 组件已创建，运行 vite dev
    Steps:
      1. 访问包含 SampleReportTable 的页面
      2. 传入 formFields 配置，检查表单是否渲染
    Expected Result: 表单区域正确显示所有配置的表单项
    Failure Indicators: 表单项缺失或渲染错误
    Evidence: .sisyphus/evidence/task-4-form-render.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(form): add dynamic form rendering`
  - Files: `src/components/SampleReportTable.vue`

---

- [ ] 5. 表单交互逻辑（查询/重置）

  **What to do**:
  - 实现 `handleSearch()` 函数：收集表单数据，调用 API
  - 实现 `handleReset()` 函数：重置表单数据到默认值
  - 实现 `fetchData()` 函数：封装 fetch 调用
  - 处理 GET/POST 两种请求方式
  - 管理 loading 状态

  **Must NOT do**:
  - 不实现复杂的错误处理
  - 不实现请求取消逻辑

  **Recommended Agent Profile**:
  > **Category**: unspecified-low（数据请求逻辑）
  > **Skills**: []
  > Reason: 标准 fetch 封装

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 8
  - **Blocked By**: Task 4

  **References**:
  - MDN fetch API 文档

  **Acceptance Criteria**:
  - [ ] 点击查询按钮能发起请求
  - [ ] 点击重置按钮表单恢复到默认值
  - [ ] GET 请求参数正确拼接到 URL
  - [ ] POST 请求参数正确放在 body

  **QA Scenarios**:

  \`\`\`
  Scenario: 查询功能验证
    Tool: Bash (检查网络请求)
    Preconditions: 组件运行中，配置了有效的 apiUrl
    Steps:
      1. 填写表单参数
      2. 点击查询按钮
      3. 检查网络请求是否正确发出
    Expected Result: 请求包含表单参数和分页参数
    Failure Indicators: 请求未发出或参数错误
    Evidence: .sisyphus/evidence/task-5-search-request.txt
  \`\`\`

  \`\`\`
  Scenario: 重置功能验证
    Tool: Bash
    Preconditions: 表单已有输入值
    Steps:
      1. 填写表单参数
      2. 点击重置按钮
      3. 检查表单值是否恢复为默认值
    Expected Result: 表单值恢复为默认值
    Failure Indicators: 表单值未重置
    Evidence: .sisyphus/evidence/task-5-reset.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(search): add search and reset functionality`
  - Files: `src/components/SampleReportTable.vue`

---

- [ ] 6. 动态表格组件

  **What to do**:
  - 根据后端返回的 `columns` 渲染表头
  - 使用 `v-for` 渲染动态列
  - 使用 `v-for` 渲染数据行
  - 支持自定义列宽度
  - 添加表格样式（简洁风格）

  **Must NOT do**:
  - 不实现列排序
  - 不实现列拖拽
  - 不实现单元格自定义渲染（slot）

  **Recommended Agent Profile**:
  > **Category**: unspecified-low（Vue 表格渲染）
  > **Skills**: []
  > Reason: 标准 Vue 表格渲染

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 8
  - **Blocked By**: Task 3

  **References**:
  - `src/components/SampleReportTable/types.ts` - TableColumn 类型

  **Acceptance Criteria**:
  - [ ] 表格表头正确渲染 columns 中的所有列
  - [ ] 表格数据行正确渲染 dataSource 中的所有数据
  - [ ] 列宽度按配置设置

  **QA Scenarios**:

  \`\`\`
  Scenario: 表格渲染验证
    Tool: Bash
    Preconditions: API 返回了 columns 和 dataSource
    Steps:
      1. 调用查询功能
      2. 检查表格表头是否正确
      3. 检查表格数据是否正确
    Expected Result: 表头和数据都正确渲染
    Failure Indicators: 表头缺失或数据为空
    Evidence: .sisyphus/evidence/task-6-table-render.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(table): add dynamic table rendering`
  - Files: `src/components/SampleReportTable.vue`

---

- [ ] 7. 分页组件

  **What to do**:
  - 实现分页状态管理（current, pageSize, total）
  - 渲染分页 UI：首页、上一页、页码、下一页、末页
  - 实现页码切换逻辑
  - 实现每页条数切换逻辑
  - 支持自定义 pageSizes

  **Must NOT do**:
  - 不实现跳页功能（可选）

  **Recommended Agent Profile**:
  > **Category**: unspecified-low（分页组件）
  > **Skills**: []
  > Reason: 标准分页逻辑

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 8
  - **Blocked By**: Task 3

  **References**:
  - 通用分页模式

  **Acceptance Criteria**:
  - [ ] 分页信息正确显示（总条数、当前页、每页条数）
  - [ ] 页码按钮点击能切换页面
  - [ ] 每页条数切换能重新查询

  **QA Scenarios**:

  \`\`\`
  Scenario: 分页功能验证
    Tool: Bash
    Preconditions: 总数据 > 1 页
    Steps:
      1. 查看第一页数据
      2. 点击下一页
      3. 检查数据是否变化
    Expected Result: 数据切换到第二页
    Failure Indicators: 数据未变化或请求参数错误
    Evidence: .sisyphus/evidence/task-7-pagination.txt
  \`\`\`

  **Commit**: YES
  - Message: `feat(pagination): add pagination component`
  - Files: `src/components/SampleReportTable.vue`

---

- [ ] 8. 导出功能集成

  **What to do**:
  - 在组件中添加导出按钮
  - 实现"导出当前页"功能
  - 实现"导出全部"功能（重新请求全部数据）
  - 集成 useExport.ts 中的导出逻辑
  - 添加导出 loading 状态

  **Must NOT do**:
  - 不实现其他导出格式（仅 xlsx）
  - 不实现前端过滤/排序

  **Recommended Agent Profile**:
  > **Category**: unspecified-low（功能集成）
  > **Skills**: []
  > Reason: 集成已有功能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Task F1
  - **Blocked By**: Tasks 2, 6, 7

  **References**:
  - `src/components/SampleReportTable/useExport.ts` - 导出函数

  **Acceptance Criteria**:
  - [ ] "导出当前页"按钮存在
  - [ ] "导出全部"按钮存在
  - [ ] 点击后能生成并下载文件

  **QA Scenarios**:

  \`\`\`
  Scenario: 导出当前页功能验证
    Tool: Bash
    Preconditions: 表格有数据
    Steps:
      1. 点击"导出当前页"按钮
      2. 检查是否弹出下载
    Expected Result: xlsx 文件下载
    Failure Indicators: 无反应或文件错误
    Evidence: .sisyphus/evidence/task-8-export-current.xlsx
  \`\`\`

  \`\`\`
  Scenario: 导出全部功能验证
    Tool: Bash
    Preconditions: 分页数据 > 1 页
    Steps:
      1. 点击"导出全部"按钮
      2. 检查下载的文件内容是否包含所有数据
    Expected Result: 下载的文件包含所有页数据
    Failure Indicators: 只包含当前页数据
    Evidence: .sisyphus/evidence/task-8-export-all.xlsx
  \`\`\`

  **Commit**: YES
  - Message: `feat(export): integrate export functionality`
  - Files: `src/components/SampleReportTable.vue`

---

- [ ] F1. 示例页面 (ReportDemo.vue)

  **What to do**:
  - 创建 `src/views/` 目录（如不存在）
  - 创建 `src/views/ReportDemo.vue`
  - 演示组件的完整使用方式
  - 配置示例 formFields
  - 配置示例 apiUrl（可使用 mock）
  - 展示所有功能

  **Must NOT do**:
  - 不连接真实后端（可使用 mock）

  **Recommended Agent Profile**:
  > **Category**: quick（示例页面）
  > **Skills**: []
  > Reason: 纯展示页面

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: FINAL
  - **Blocks**: None
  - **Blocked By**: Task 8

  **References**:
  - `src/App.vue` - 页面结构参考

  **Acceptance Criteria**:
  - [ ] 示例页面存在
  - [ ] 组件正确引入和配置
  - [ ] 页面能正常渲染

  **QA Scenarios**:

  \`\`\`
  Scenario: 示例页面验证
    Tool: Bash
    Preconditions: 完整组件已实现
    Steps:
      1. 启动 vite dev
      2. 访问 ReportDemo 页面
      3. 检查组件是否正确渲染
    Expected Result: 页面正常显示，组件功能可用
    Failure Indicators: 页面错误或组件无法交互
    Evidence: .sisyphus/evidence/f1-demo-page.txt
  \`\`\`

  **Commit**: YES
  - Message: `docs: add ReportDemo example page`
  - Files: `src/views/ReportDemo.vue`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  读取计划文件，验证每个 Must Have 都有对应实现。检查每个 Must NOT Have 是否被避免。

- [ ] F2. **Build Verification** — `quick`
  运行 `vite build` 确保编译成功，无错误。

- [ ] F3. **Manual QA** — `unspecified-high`
  在浏览器中手动验证所有功能：表单渲染、查询、分页、导出。

---

## Commit Strategy

- **1**: `feat(types): add SampleReportTable type definitions`
- **2**: `feat(export): add export utility for Excel generation`
- **3**: `feat(component): add SampleReportTable base structure`
- **4**: `feat(form): add dynamic form rendering`
- **5**: `feat(search): add search and reset functionality`
- **6**: `feat(table): add dynamic table rendering`
- **7**: `feat(pagination): add pagination component`
- **8**: `feat(export): integrate export functionality`
- **F1**: `docs: add ReportDemo example page`

---

## Success Criteria

### 验证命令
```bash
vite build  # 编译成功
vite dev    # 开发服务器启动成功
```

### Final Checklist
- [x] 所有 formFields 类型都能正确渲染
- [x] 查询和重置功能正常工作
- [x] 表格正确显示后端返回的数据
- [x] 分页功能正常工作
- [x] 导出当前页功能正常
- [x] 导出全部功能正常
- [x] 组件无第三方 UI 库依赖
- [x] 示例页面完整可用
