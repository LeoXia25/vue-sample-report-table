<template>
  <div :class="mainContainerClass">
    <!-- 上下布局 -->
    <template v-if="!isHorizontalLayout">
      
      <!-- 居上布局 -->
      <template v-if="layoutType === 'top'">
        <!-- 收缩时显示的细条 -->
        <div v-if="collapsed" class="collapse-bar" :style="collapseBarStyle">
          <button type="button" class="btn-collapse" @click="toggleCollapse" title="展开参数面板">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" :style="{ transform: 'rotate(-45deg)' }">
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
            </svg>
            <span>展开参数</span>
          </button>
        </div>
        <!-- 参数面板 -->
        <div v-show="!collapsed" class="form-area" :style="mergedFormAreaStyle">
          <div class="form-header">
            <span class="form-title">查询条件</span>
            <!-- 布局切换按钮组 -->
            <div class="layout-toggle-group">
              <button
                v-for="opt in layoutOptions"
                :key="opt.value"
                type="button"
                class="layout-toggle-btn"
                :class="{ active: layoutType === opt.value }"
                :title="opt.label"
                @click="switchLayout(opt.value)"
              >
                <svg :viewBox="layoutIconViewBox" width="16" height="16">
                  <rect :x="getLayoutIconRect(opt.value).x" :y="getLayoutIconRect(opt.value).y" width="6" height="3" rx="0.5" :fill="layoutType === opt.value ? 'var(--toggle-active-color, #1890ff)' : 'var(--toggle-inactive-color, #999)'"/>
                  <rect x="0" y="0" width="12" height="7" rx="1" fill="none" stroke="var(--toggle-inactive-color, #999)" stroke-width="1"/>
                </svg>
              </button>
            </div>
            <button type="button" class="btn-collapse-pin" @click="toggleCollapse" title="收起参数面板">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
              </svg>
            </button>
          </div>
          <div class="form-fields">
            <div v-for="field in formFields" :key="field.key" class="form-field">
              <label :for="field.key">{{ field.label }}</label>
              <input v-if="field.type === 'input'" :id="field.key" type="text" v-model="formData[field.key]" :placeholder="field.placeholder" />
              <select v-else-if="field.type === 'select'" :id="field.key" v-model="formData[field.key]" :multiple="field.multiple">
                <option value="">{{ field.placeholder || '请选择' }}</option>
                <option v-for="opt in getFieldOptions(field)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <input v-else-if="field.type === 'date'" :id="field.key" type="date" v-model="formData[field.key]" :placeholder="field.placeholder" />
              <div v-else-if="field.type === 'daterange'" class="daterange-wrapper">
                <input type="date" v-model="formData[field.key + '_start']" :placeholder="field.placeholder ? '开始日期' : ''" />
                <span class="daterange-separator">至</span>
                <input type="date" v-model="formData[field.key + '_end']" :placeholder="field.placeholder ? '结束日期' : ''" />
              </div>
              <div v-else-if="field.type === 'checkbox'" class="checkbox-group">
                <label v-for="opt in getFieldOptions(field)" :key="opt.value" class="checkbox-label">
                  <input type="checkbox" :value="opt.value" v-model="formData[field.key]" />{{ opt.label }}
                </label>
              </div>
              <div v-else-if="field.type === 'radio'" class="radio-group">
                <label v-for="opt in getFieldOptions(field)" :key="opt.value" class="radio-label">
                  <input type="radio" :name="field.key" :value="opt.value" v-model="formData[field.key]" />{{ opt.label }}
                </label>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <div class="action-group">
              <button type="button" class="btn-search" @click="handleSearch">{{ searchText }}</button>
              <button type="button" class="btn-reset" @click="handleReset">{{ resetText }}</button>
              <button
                v-for="(btn, idx) in customButtons"
                :key="idx"
                type="button"
                class="btn-custom"
                :style="btn.style"
                :disabled="btn.disabled"
                @click="triggerCustomButton(btn)"
              >{{ btn.text }}</button>
            </div>
            <div class="action-group action-group-right">
              <button type="button" class="btn-export" @click="handleExportCurrent" :disabled="loading || !tableData.length">导出当前页</button>
              <button type="button" class="btn-export" @click="handleExportAll" :disabled="loading">导出全部</button>
            </div>
          </div>
        </div>
        <div class="table-wrapper">
          <div ref="tableScrollTop" class="table-scroll-x">
            <table class="data-table" :style="{ width: tableMinWidth + 'px' }">
              <colgroup>
                <col v-for="col in columns" :key="col.key" :style="{ width: (col.width || 100) + 'px' }" />
              </colgroup>
              <thead><tr><th v-for="col in columns" :key="col.key" :title="col.label" :style="{ width: (col.width || 100) + 'px' }">{{ col.label }}</th></tr></thead>
              <tbody>
                <tr v-if="loading"><td :colspan="columns.length || 1" class="loading-cell" title="加载中...">加载中...</td></tr>
                <tr v-else-if="!tableData.length"><td :colspan="columns.length || 1" class="empty-cell" title="暂无数据">暂无数据</td></tr>
                <tr v-for="(row, index) in tableData" :key="index"><td v-for="col in columns" :key="col.key" :title="row[col.key]" :style="{ width: (col.width || 100) + 'px' }">{{ row[col.key] }}</td></tr>
              </tbody>
            </table>
          </div>
          <div v-if="paginationConfig.enabled" class="pagination">
            <span class="pagination-info">共 {{ pagination.total }} 条，第 {{ pagination.current }} / {{ pagination.pageCount }} 页</span>
            <div class="pagination-controls">
              <button type="button" class="page-btn" :disabled="pagination.current <= 1" @click="goToPage(1)">首页</button>
              <button type="button" class="page-btn" :disabled="pagination.current <= 1" @click="goToPage(pagination.current - 1)">上一页</button>
              <button type="button" class="page-btn" :disabled="pagination.current >= pagination.pageCount" @click="goToPage(pagination.current + 1)">下一页</button>
              <button type="button" class="page-btn" :disabled="pagination.current >= pagination.pageCount" @click="goToPage(pagination.pageCount)">末页</button>
            </div>
            <div class="page-size-select">
              <select v-model="pagination.pageSize" @change="handlePageSizeChange">
                <option v-for="size in paginationConfig.pageSizes || [10, 20, 50]" :key="size" :value="size">{{ size }} 条/页</option>
              </select>
            </div>
          </div>
        </div>
      </template>

      <!-- 居下布局 -->
      <template v-else>
        <div class="table-wrapper">
          <div class="table-scroll-x">
            <table class="data-table" :style="{ width: tableMinWidth + 'px' }">
              <colgroup>
                <col v-for="col in columns" :key="col.key" :style="{ width: (col.width || 100) + 'px' }" />
              </colgroup>
              <thead><tr><th v-for="col in columns" :key="col.key" :title="col.label" :style="{ width: (col.width || 100) + 'px' }">{{ col.label }}</th></tr></thead>
              <tbody>
                <tr v-if="loading"><td :colspan="columns.length || 1" class="loading-cell" title="加载中...">加载中...</td></tr>
                <tr v-else-if="!tableData.length"><td :colspan="columns.length || 1" class="empty-cell" title="暂无数据">暂无数据</td></tr>
                <tr v-for="(row, index) in tableData" :key="index"><td v-for="col in columns" :key="col.key" :title="row[col.key]" :style="{ width: (col.width || 100) + 'px' }">{{ row[col.key] }}</td></tr>
              </tbody>
            </table>
          </div>
          <div v-if="paginationConfig.enabled" class="pagination">
            <span class="pagination-info">共 {{ pagination.total }} 条，第 {{ pagination.current }} / {{ pagination.pageCount }} 页</span>
            <div class="pagination-controls">
              <button type="button" class="page-btn" :disabled="pagination.current <= 1" @click="goToPage(1)">首页</button>
              <button type="button" class="page-btn" :disabled="pagination.current <= 1" @click="goToPage(pagination.current - 1)">上一页</button>
              <button type="button" class="page-btn" :disabled="pagination.current >= pagination.pageCount" @click="goToPage(pagination.current + 1)">下一页</button>
              <button type="button" class="page-btn" :disabled="pagination.current >= pagination.pageCount" @click="goToPage(pagination.pageCount)">末页</button>
            </div>
            <div class="page-size-select">
              <select v-model="pagination.pageSize" @change="handlePageSizeChange">
                <option v-for="size in paginationConfig.pageSizes || [10, 20, 50]" :key="size" :value="size">{{ size }} 条/页</option>
              </select>
            </div>
          </div>
        </div>
        <!-- 收缩时显示的细条 -->
        <div v-if="collapsed" class="collapse-bar" :style="collapseBarStyle">
          <button type="button" class="btn-collapse" @click="toggleCollapse" title="展开参数面板">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" :style="{ transform: 'rotate(-45deg)' }">
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
            </svg>
            <span>展开参数</span>
          </button>
        </div>
        <div v-show="!collapsed" class="form-area" :style="mergedFormAreaStyle">
          <div class="form-header">
            <span class="form-title">查询条件</span>
            <!-- 布局切换按钮组 -->
            <div class="layout-toggle-group">
              <button
                v-for="opt in layoutOptions"
                :key="opt.value"
                type="button"
                class="layout-toggle-btn"
                :class="{ active: layoutType === opt.value }"
                :title="opt.label"
                @click="switchLayout(opt.value)"
              >
                <svg :viewBox="layoutIconViewBox" width="16" height="16">
                  <rect :x="getLayoutIconRect(opt.value).x" :y="getLayoutIconRect(opt.value).y" width="6" height="3" rx="0.5" :fill="layoutType === opt.value ? 'var(--toggle-active-color, #1890ff)' : 'var(--toggle-inactive-color, #999)'"/>
                  <rect x="0" y="0" width="12" height="7" rx="1" fill="none" stroke="var(--toggle-inactive-color, #999)" stroke-width="1"/>
                </svg>
              </button>
            </div>
            <button type="button" class="btn-collapse-pin" @click="toggleCollapse" title="收起参数面板">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
              </svg>
            </button>
          </div>
          <div class="form-fields">
            <div v-for="field in formFields" :key="field.key" class="form-field">
              <label :for="field.key">{{ field.label }}</label>
              <input v-if="field.type === 'input'" :id="field.key" type="text" v-model="formData[field.key]" :placeholder="field.placeholder" />
              <select v-else-if="field.type === 'select'" :id="field.key" v-model="formData[field.key]" :multiple="field.multiple">
                <option value="">{{ field.placeholder || '请选择' }}</option>
                <option v-for="opt in getFieldOptions(field)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <input v-else-if="field.type === 'date'" :id="field.key" type="date" v-model="formData[field.key]" :placeholder="field.placeholder" />
              <div v-else-if="field.type === 'daterange'" class="daterange-wrapper">
                <input type="date" v-model="formData[field.key + '_start']" :placeholder="field.placeholder ? '开始日期' : ''" />
                <span class="daterange-separator">至</span>
                <input type="date" v-model="formData[field.key + '_end']" :placeholder="field.placeholder ? '结束日期' : ''" />
              </div>
              <div v-else-if="field.type === 'checkbox'" class="checkbox-group">
                <label v-for="opt in getFieldOptions(field)" :key="opt.value" class="checkbox-label">
                  <input type="checkbox" :value="opt.value" v-model="formData[field.key]" />{{ opt.label }}
                </label>
              </div>
              <div v-else-if="field.type === 'radio'" class="radio-group">
                <label v-for="opt in getFieldOptions(field)" :key="opt.value" class="radio-label">
                  <input type="radio" :name="field.key" :value="opt.value" v-model="formData[field.key]" />{{ opt.label }}
                </label>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <div class="action-group">
              <button type="button" class="btn-search" @click="handleSearch">{{ searchText }}</button>
              <button type="button" class="btn-reset" @click="handleReset">{{ resetText }}</button>
              <button
                v-for="(btn, idx) in customButtons"
                :key="idx"
                type="button"
                class="btn-custom"
                :style="btn.style"
                :disabled="btn.disabled"
                @click="triggerCustomButton(btn)"
              >{{ btn.text }}</button>
            </div>
            <div class="action-group action-group-right">
              <button type="button" class="btn-export" @click="handleExportCurrent" :disabled="loading || !tableData.length">导出当前页</button>
              <button type="button" class="btn-export" @click="handleExportAll" :disabled="loading">导出全部</button>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- 左右布局 -->
    <template v-else>
      <!-- 左侧参数面板 -->
      <div v-if="layoutType === 'left'" class="form-area form-area-vertical" :style="mergedFormAreaStyle" :class="{ 'form-area-collapsed': collapsed }">
        <!-- 收缩时：显示竖条图钉按钮 -->
        <div v-if="collapsed" class="left-collapse-strip" :style="{ background: props.formAreaStyle?.background || '#f5f5f5', color: getContrastColor(props.formAreaStyle?.background || '#f5f5f5') }">
          <button type="button" class="left-collapse-btn" @click="toggleCollapse" title="展开参数面板">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" :style="{ transform: 'rotate(-45deg)' }">
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
            </svg>
            <span>展开参数</span>
          </button>
        </div>
        <!-- 展开时：完整面板 -->
        <template v-if="!collapsed">
          <div class="form-header-vertical">
            <span class="form-title">查询条件</span>
            <div class="layout-toggle-group">
              <button
                v-for="opt in layoutOptions"
                :key="opt.value"
                type="button"
                class="layout-toggle-btn"
                :class="{ active: layoutType === opt.value }"
                :title="opt.label"
                @click="switchLayout(opt.value)"
              >
                <svg :viewBox="layoutIconViewBox" width="16" height="16">
                  <rect :x="getLayoutIconRect(opt.value).x" :y="getLayoutIconRect(opt.value).y" width="6" height="3" rx="0.5" :fill="layoutType === opt.value ? 'var(--toggle-active-color, #1890ff)' : 'var(--toggle-inactive-color, #999)'"/>
                  <rect x="0" y="0" width="12" height="7" rx="1" fill="none" stroke="var(--toggle-inactive-color, #999)" stroke-width="1"/>
                </svg>
              </button>
            </div>
            <button type="button" class="btn-collapse-pin" @click="toggleCollapse" title="收起参数面板">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
              </svg>
            </button>
          </div>
          <div class="form-body-vertical">
            <div class="form-fields-vertical">
              <div v-for="field in formFields" :key="field.key" class="form-field-vertical">
                <label :for="field.key">{{ field.label }}</label>
                <input v-if="field.type === 'input'" :id="field.key" type="text" v-model="formData[field.key]" :placeholder="field.placeholder" />
                <select v-else-if="field.type === 'select'" :id="field.key" v-model="formData[field.key]" :multiple="field.multiple">
                  <option value="">请选择</option>
                  <option v-for="opt in getFieldOptions(field)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <input v-else-if="field.type === 'date'" :id="field.key" type="date" v-model="formData[field.key]" :placeholder="field.placeholder" />
                <div v-else-if="field.type === 'daterange'" class="daterange-wrapper-vertical">
                  <input type="date" v-model="formData[field.key + '_start']" :placeholder="field.placeholder ? '开始日期' : ''" />
                  <input type="date" v-model="formData[field.key + '_end']" :placeholder="field.placeholder ? '结束日期' : ''" />
                </div>
                <div v-else-if="field.type === 'checkbox'" class="checkbox-group">
                  <label v-for="opt in getFieldOptions(field)" :key="opt.value" class="checkbox-label">
                    <input type="checkbox" :value="opt.value" v-model="formData[field.key]" />{{ opt.label }}
                  </label>
                </div>
                <div v-else-if="field.type === 'radio'" class="radio-group">
                  <label v-for="opt in getFieldOptions(field)" :key="opt.value" class="radio-label">
                    <input type="radio" :name="field.key" :value="opt.value" v-model="formData[field.key]" />{{ opt.label }}
                  </label>
                </div>
              </div>
            </div>
            <div class="form-actions-vertical">
              <button type="button" class="btn-search" @click="handleSearch">{{ searchText }}</button>
              <button type="button" class="btn-reset" @click="handleReset">{{ resetText }}</button>
              <button
                v-for="(btn, idx) in customButtons"
                :key="idx"
                type="button"
                class="btn-custom"
                :style="btn.style"
                :disabled="btn.disabled"
                @click="triggerCustomButton(btn)"
              >{{ btn.text }}</button>
              <button type="button" class="btn-export" @click="handleExportCurrent" :disabled="loading || !tableData.length">导出当前页</button>
              <button type="button" class="btn-export" @click="handleExportAll" :disabled="loading">导出全部</button>
            </div>
          </div>
        </template>
      </div>

      <!-- 表格区域 -->
      <div class="table-wrapper table-wrapper-flex">
        <div class="table-scroll-x">
          <table class="data-table" :style="{ width: tableMinWidth + 'px' }">
            <colgroup>
              <col v-for="col in columns" :key="col.key" :style="{ width: (col.width || 100) + 'px' }" />
            </colgroup>
            <thead><tr><th v-for="col in columns" :key="col.key" :title="col.label" :style="{ width: (col.width || 100) + 'px' }">{{ col.label }}</th></tr></thead>
            <tbody>
              <tr v-if="loading"><td :colspan="columns.length || 1" class="loading-cell" title="加载中...">加载中...</td></tr>
              <tr v-else-if="!tableData.length"><td :colspan="columns.length || 1" class="empty-cell" title="暂无数据">暂无数据</td></tr>
              <tr v-for="(row, index) in tableData" :key="index"><td v-for="col in columns" :key="col.key" :title="row[col.key]" :style="{ width: (col.width || 100) + 'px' }">{{ row[col.key] }}</td></tr>
            </tbody>
          </table>
        </div>
        <div v-if="paginationConfig.enabled" class="pagination">
          <span class="pagination-info">共 {{ pagination.total }} 条，第 {{ pagination.current }} / {{ pagination.pageCount }} 页</span>
          <div class="pagination-controls">
            <button type="button" class="page-btn" :disabled="pagination.current <= 1" @click="goToPage(1)">首页</button>
            <button type="button" class="page-btn" :disabled="pagination.current <= 1" @click="goToPage(pagination.current - 1)">上一页</button>
            <button type="button" class="page-btn" :disabled="pagination.current >= pagination.pageCount" @click="goToPage(pagination.current + 1)">下一页</button>
            <button type="button" class="page-btn" :disabled="pagination.current >= pagination.pageCount" @click="goToPage(pagination.pageCount)">末页</button>
          </div>
          <div class="page-size-select">
            <select v-model="pagination.pageSize" @change="handlePageSizeChange">
              <option v-for="size in paginationConfig.pageSizes || [10, 20, 50]" :key="size" :value="size">{{ size }} 条/页</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 右侧参数面板 -->
      <div v-if="layoutType === 'right'" class="form-area form-area-vertical form-area-right" :style="mergedFormAreaStyle" :class="{ 'form-area-collapsed': collapsed }">
        <!-- 展开时：完整面板 -->
        <template v-if="!collapsed">
          <div class="form-header-vertical">
            <span class="form-title">查询条件</span>
            <div class="layout-toggle-group">
              <button
                v-for="opt in layoutOptions"
                :key="opt.value"
                type="button"
                class="layout-toggle-btn"
                :class="{ active: layoutType === opt.value }"
                :title="opt.label"
                @click="switchLayout(opt.value)"
              >
                <svg :viewBox="layoutIconViewBox" width="16" height="16">
                  <rect :x="getLayoutIconRect(opt.value).x" :y="getLayoutIconRect(opt.value).y" width="6" height="3" rx="0.5" :fill="layoutType === opt.value ? 'var(--toggle-active-color, #1890ff)' : 'var(--toggle-inactive-color, #999)'"/>
                  <rect x="0" y="0" width="12" height="7" rx="1" fill="none" stroke="var(--toggle-inactive-color, #999)" stroke-width="1"/>
                </svg>
              </button>
            </div>
            <button type="button" class="btn-collapse-pin" @click="toggleCollapse" title="收起参数面板">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
              </svg>
            </button>
          </div>
          <div class="form-body-vertical">
            <div class="form-fields-vertical">
              <div v-for="field in formFields" :key="field.key" class="form-field-vertical">
                <label :for="field.key">{{ field.label }}</label>
                <input v-if="field.type === 'input'" :id="field.key" type="text" v-model="formData[field.key]" :placeholder="field.placeholder" />
                <select v-else-if="field.type === 'select'" :id="field.key" v-model="formData[field.key]" :multiple="field.multiple">
                  <option value="">请选择</option>
                  <option v-for="opt in getFieldOptions(field)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <input v-else-if="field.type === 'date'" :id="field.key" type="date" v-model="formData[field.key]" :placeholder="field.placeholder" />
                <div v-else-if="field.type === 'daterange'" class="daterange-wrapper-vertical">
                  <input type="date" v-model="formData[field.key + '_start']" :placeholder="field.placeholder ? '开始日期' : ''" />
                  <input type="date" v-model="formData[field.key + '_end']" :placeholder="field.placeholder ? '结束日期' : ''" />
                </div>
                <div v-else-if="field.type === 'checkbox'" class="checkbox-group">
                  <label v-for="opt in getFieldOptions(field)" :key="opt.value" class="checkbox-label">
                    <input type="checkbox" :value="opt.value" v-model="formData[field.key]" />{{ opt.label }}
                  </label>
                </div>
                <div v-else-if="field.type === 'radio'" class="radio-group">
                  <label v-for="opt in getFieldOptions(field)" :key="opt.value" class="radio-label">
                    <input type="radio" :name="field.key" :value="opt.value" v-model="formData[field.key]" />{{ opt.label }}
                  </label>
                </div>
              </div>
            </div>
            <div class="form-actions-vertical">
              <button type="button" class="btn-search" @click="handleSearch">{{ searchText }}</button>
              <button type="button" class="btn-reset" @click="handleReset">{{ resetText }}</button>
              <button
                v-for="(btn, idx) in customButtons"
                :key="idx"
                type="button"
                class="btn-custom"
                :style="btn.style"
                :disabled="btn.disabled"
                @click="triggerCustomButton(btn)"
              >{{ btn.text }}</button>
              <button type="button" class="btn-export" @click="handleExportCurrent" :disabled="loading || !tableData.length">导出当前页</button>
              <button type="button" class="btn-export" @click="handleExportAll" :disabled="loading">导出全部</button>
            </div>
          </div>
        </template>
        <!-- 收缩时：显示竖条图钉按钮 -->
        <div v-if="collapsed" class="left-collapse-strip" :style="{ background: props.formAreaStyle?.background || '#f5f5f5', color: getContrastColor(props.formAreaStyle?.background || '#f5f5f5') }">
          <button type="button" class="left-collapse-btn" @click="toggleCollapse" title="展开参数面板">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" :style="{ transform: 'rotate(-45deg)' }">
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
            </svg>
            <span>展开参数</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { exportToExcel } from './useExport'
import './types'

// Props 定义
const props = defineProps({
  reportId: String,
  formFields: Array,
  apiUrl: String,
  method: { type: String, default: 'GET' },
  pagination: { type: Object, default: () => ({ enabled: true, pageSize: 10, pageSizes: [10, 20, 50] }) },
  searchText: { type: String, default: '查询' },
  resetText: { type: String, default: '重置' },
  layout: { type: String, default: 'top' },
  formAreaStyle: { type: Object, default: () => ({}) },
  // 按钮回调
  onSearch: { type: Function, default: null },
  onExportCurrent: { type: Function, default: null },
  onExportAll: { type: Function, default: null },
  customButtons: { type: Array, default: () => [] }
})

// 布局类型
const layoutType = computed(() => props.layout || 'top')

// 根据背景色自动计算字体颜色
function getContrastColor(bgColor) {
  let hex = bgColor || '#f5f5f5'
  if (hex.startsWith('#')) hex = hex.slice(1)
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#333333' : '#ffffff'
}

function getInputBackgroundColor(bgColor) {
  let hex = bgColor || '#f5f5f5'
  if (hex.startsWith('#')) hex = hex.slice(1)
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'
}

function getBorderColor(bgColor) {
  let hex = bgColor || '#f5f5f5'
  if (hex.startsWith('#')) hex = hex.slice(1)
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)'
}

const mergedFormAreaStyle = computed(() => {
  const bgColor = props.formAreaStyle?.background || '#f5f5f5'
  const textColor = getContrastColor(bgColor)
  const borderColor = getBorderColor(bgColor)
  return {
    background: '#f5f5f5',
    borderRadius: '4px',
    padding: '16px',
    color: textColor,
    '--form-text-color': textColor,
    '--form-border-color': borderColor,
    '--form-input-bg': getInputBackgroundColor(bgColor),
    ...props.formAreaStyle
  }
})

const isHorizontalLayout = computed(() => layoutType.value === 'left' || layoutType.value === 'right')

const mainContainerClass = computed(() => ({
  'main-container': true,
  'layout-top': layoutType.value === 'top',
  'layout-bottom': layoutType.value === 'bottom',
  'layout-left': layoutType.value === 'left',
  'layout-right': layoutType.value === 'right'
}))

// 响应式状态
const formData = reactive({})
const tableData = ref([])
const columns = ref([])
// 表格宽度 = 各列宽度之和（确保列宽严格按后端返回值渲染，超出时触发横向滚动）
const tableMinWidth = computed(() => {
  return columns.value.reduce((sum, col) => sum + (col.width || 100), 0)
})
const loading = ref(false)
const allDataCache = ref([])    // 导出全部时使用
// 动态选项（用 ref 避免 reactive 对新增属性不追踪的问题）
const dynamicOptions = ref<Record<string, { label: string; value: any }[]>>({})

const pagination = reactive({
  current: 1,
  pageSize: props.pagination?.pageSize || 10,
  total: 0,
  pageCount: 1
})

const paginationConfig = computed(() => props.pagination)

// 收缩/展开状态
const collapsed = ref(false)

function toggleCollapse() {
  collapsed.value = !collapsed.value
}

// 布局切换
const emit = defineEmits(['update:layout'])

const layoutOptions = [
  { value: 'top', label: '居上', icon: 'top' },
  { value: 'bottom', label: '居下', icon: 'bottom' },
  { value: 'left', label: '居左', icon: 'left' },
  { value: 'right', label: '居右', icon: 'right' }
]

function switchLayout(newLayout) {
  emit('update:layout', newLayout)
}

// 布局图标参数（相对于 12x7 viewBox）
const layoutIconViewBox = '0 0 12 7'
function getLayoutIconRect(layout) {
  const R = { w: 6, h: 3 }
  switch (layout) {
    case 'top':    return { x: 3, y: 0 }          // 表单在顶部
    case 'bottom': return { x: 3, y: 4 }          // 表单在底部
    case 'left':   return { x: 0, y: 2 }          // 表单在左侧
    case 'right':  return { x: 6, y: 2 }          // 表单在右侧
    default:       return { x: 3, y: 0 }
  }
}

// 收缩时上下布局的细条样式
const collapseBarStyle = computed(() => {
  const bgColor = props.formAreaStyle?.background || '#f5f5f5'
  const textColor = getContrastColor(bgColor)
  return { background: bgColor, color: textColor }
})

function initFormData() {
  props.formFields.forEach(field => {
    if (field.type === 'daterange') {
      formData[field.key + '_start'] = field.defaultValue?.start ?? ''
      formData[field.key + '_end'] = field.defaultValue?.end ?? ''
    } else if (field.type === 'checkbox' || field.multiple) {
      formData[field.key] = field.defaultValue ?? []
    } else {
      formData[field.key] = field.defaultValue ?? ''
    }
  })
}

// 获取字段选项（优先动态选项，其次静态选项）
function getFieldOptions(field) {
  if (dynamicOptions.value[field.key] && dynamicOptions.value[field.key].length > 0) {
    return dynamicOptions.value[field.key]
  }
  return field.options || []
}

// 初始化动态选项（从接口获取）
async function initDynamicOptions() {
  const fieldsWithDynamic = props.formFields.filter(f => f.dynamicOptions?.optionsUrl)
  if (!fieldsWithDynamic.length) return

  await Promise.all(fieldsWithDynamic.map(async (field) => {
    const cfg = field.dynamicOptions!
    try {
      const url = cfg.optionsUrl!
      const options: { label: string; value: any }[] = []
      const successCode = cfg.optionsSuccessCode ?? 0

      if (cfg.optionsMethod === 'POST') {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cfg.optionsParams || {})
        })
        const json = await res.json()
        const codeKey = cfg.optionsCodeKey || 'code'
        if (json[codeKey] !== successCode && json[codeKey] !== 200) {
          throw new Error(json.msg || json.message || '选项接口返回错误')
        }
        const dataKey = cfg.optionsDataKey || 'data'
        const rawList = json.data?.[dataKey] || json[dataKey] || json.data || []
        for (const item of rawList) {
          options.push({
            label: item[cfg.optionsLabelKey || 'label'] ?? String(item),
            value: String(item[cfg.optionsValueKey || 'value'] ?? item)
          })
        }
      } else {
        let query = ''
        if (cfg.optionsParams) {
          const ps = new URLSearchParams()
          for (const [k, v] of Object.entries(cfg.optionsParams)) {
            if (v !== null && v !== undefined) ps.append(k, String(v))
          }
          const qs = ps.toString()
          if (qs) query = '?' + qs
        }
        const res = await fetch(url + query)
        const json = await res.json()
        const codeKey = cfg.optionsCodeKey || 'code'
        if (json[codeKey] !== successCode && json[codeKey] !== 200) {
          throw new Error(json.msg || json.message || '选项接口返回错误')
        }
        const dataKey = cfg.optionsDataKey || 'data'
        const rawList = json.data?.[dataKey] || json[dataKey] || json.data || []
        for (const item of rawList) {
          options.push({
            label: item[cfg.optionsLabelKey || 'label'] ?? String(item),
            value: String(item[cfg.optionsValueKey || 'value'] ?? item)
          })
        }
      }
      dynamicOptions.value[field.key] = options
      // 标准化默认值：将数组中的值转成字符串，与选项值类型对齐
      const dv = props.formFields.find(f => f.key === field.key)?.defaultValue
      if (Array.isArray(dv) && dv.length > 0) {
        formData[field.key] = dv.map(v => String(v))
      }
    } catch (e) {
      console.warn(`[SampleReportTable] 动态选项加载失败 [${field.key}]:`, e)
      dynamicOptions.value[field.key] = []
    }
  }))
}

function handleReset() {
  props.formFields.forEach(field => {
    if (field.type === 'daterange') {
      formData[field.key + '_start'] = field.defaultValue?.start ?? ''
      formData[field.key + '_end'] = field.defaultValue?.end ?? ''
    } else if (field.type === 'checkbox' || field.multiple) {
      formData[field.key] = field.defaultValue ?? []
    } else {
      formData[field.key] = field.defaultValue ?? ''
    }
  })
  pagination.current = 1
}

function buildRequestParams() {
  const params = new URLSearchParams()
  props.formFields.forEach(field => {
    if (field.type === 'daterange') {
      const startVal = formData[field.key + '_start']
      const endVal = formData[field.key + '_end']
      if (startVal) params.append(field.key + '_start', startVal)
      if (endVal) params.append(field.key + '_end', endVal)
    } else if (field.type === 'checkbox') {
      const arr = formData[field.key]
      if (Array.isArray(arr) && arr.length > 0) params.append(field.key, arr.join(','))
    } else {
      const value = formData[field.key]
      if (value !== '' && value !== null && value !== undefined) params.append(field.key, String(value))
    }
  })
  if (props.pagination.enabled) {
    params.append('PageIndex', String(pagination.current))
    params.append('PageSize', String(pagination.pageSize))
  }
  return params
}

async function fetchData() {
  loading.value = true
  try {
    const params = buildRequestParams()
    let url = props.apiUrl
    let fetchOptions = { method: props.method }
    if (props.method === 'GET') {
      url = `${props.apiUrl}?${params.toString()}`
    } else {
      const processedParams = {}
      props.formFields.forEach(field => {
        if (field.type === 'daterange') {
          const startVal = formData[field.key + '_start']
          const endVal = formData[field.key + '_end']
          if (startVal) processedParams[field.key + '_start'] = startVal
          if (endVal) processedParams[field.key + '_end'] = endVal
        } else if (field.type === 'checkbox') {
          const arr = formData[field.key]
          if (Array.isArray(arr) && arr.length > 0) processedParams[field.key] = arr.join(',')
        } else {
          const value = formData[field.key]
          if (value !== '' && value !== null && value !== undefined) processedParams[field.key] = value
        }
      })
      fetchOptions.headers = { 'Content-Type': 'application/json' }
      fetchOptions.body = JSON.stringify({ params: processedParams, pageIndex: pagination.current, pageSize: pagination.pageSize })
    }
    const response = await fetch(url, fetchOptions)
    const result = await response.json()
    if (result.code === 200) {
      columns.value = result.data.columns || []
      tableData.value = result.data.dataSource || []
      pagination.total = result.data.recordCount || 0
      pagination.pageCount = Math.ceil(pagination.total / pagination.pageSize) || 1
    } else {
      columns.value = []
      tableData.value = []
    }
  } catch (error) {
    columns.value = []
    tableData.value = []
    } finally {
    loading.value = false
    // 查询完成后触发回调
    if (props.onSearch) {
      props.onSearch({
        formData: { ...formData },
        tableData: [...tableData.value],
        columns: [...columns.value],
        pagination: { ...pagination }
      })
    }
  }
}

function handleSearch() {
  pagination.current = 1
  fetchData()
}

// 触发自定义按钮回调
function triggerCustomButton(btn) {
  if (btn.disabled) return
  btn.onClick({
    formData: { ...formData },
    tableData: [...tableData.value]
  })
}

function goToPage(page) {
  if (page < 1 || page > pagination.pageCount) return
  pagination.current = page
  fetchData()
}

function handlePageSizeChange() {
  pagination.current = 1
  pagination.pageSize = Number(pagination.pageSize)
  fetchData()
}

function handleExportCurrent() {
  if (!tableData.value.length || !columns.value.length) {
    alert('没有数据可导出')
    return
  }
  if (props.onExportCurrent) {
    props.onExportCurrent({
      formData: { ...formData },
      tableData: [...tableData.value],
      columns: [...columns.value]
    })
  }
  const filename = `${props.reportId}_${new Date().toISOString().slice(0, 10)}`
  exportToExcel(columns.value, tableData.value, filename)
}

async function handleExportAll() {
  if (!columns.value.length) {
    alert('没有数据可导出')
    return
  }
  const origLoading = loading.value
  loading.value = true
  try {
    let url = props.apiUrl
    let fetchOptions = {}
    const queryParams = new URLSearchParams()
    props.formFields.forEach(field => {
      if (field.type === 'daterange') {
        const sv = formData[field.key + '_start']
        const ev = formData[field.key + '_end']
        if (sv) queryParams.append(field.key + '_start', sv)
        if (ev) queryParams.append(field.key + '_end', ev)
      } else if (field.type === 'checkbox') {
        const arr = formData[field.key]
        if (Array.isArray(arr) && arr.length > 0) queryParams.append(field.key, arr.join(','))
      } else {
        const val = formData[field.key]
        if (val !== '' && val !== null && val !== undefined) queryParams.append(field.key, String(val))
      }
    })
    queryParams.append('PageIndex', '1')
    queryParams.append('PageSize', '999999')
    if (props.method === 'GET') {
      url = `${props.apiUrl}?${queryParams.toString()}`
    } else {
      const bodyParams = {}
      queryParams.forEach((v, k) => { bodyParams[k] = v })
      fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyParams)
      }
    }
    const response = await fetch(url, fetchOptions)
    const result = await response.json()
    if (result.code === 200 && result.data.dataSource) {
      const cols = result.data.columns?.length ? result.data.columns : columns.value
      const allData = result.data.dataSource
      if (props.onExportAll) {
        props.onExportAll({
          formData: { ...formData },
          tableData: allData,
          columns: cols
        })
      }
      const filename = `${props.reportId}_all_${new Date().toISOString().slice(0, 10)}`
      exportToExcel(cols, allData, filename)
    } else {
      alert('导出失败：' + (result.message || '未知错误'))
    }
  } catch (error) {
    alert('导出失败')
  } finally {
    loading.value = origLoading
  }
}

onMounted(async () => {
  initFormData()
  await initDynamicOptions()
})
</script>

<style scoped>
.sample-report-table {
  font-family: Arial, sans-serif;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.main-container {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
}
/* 参数面板主体样式 */
.main-container { width: 100%; height: 100%; min-width: 0; min-height: 0; display: flex; }
.form-area { min-width: 0; box-sizing: border-box; background: #f5f5f5; padding: 16px; }
.form-fields { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
.form-fields-vertical { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; flex: 1; overflow-y: auto; }
.form-fields > div, .form-fields-vertical > div { display: flex; flex-direction: column; }
.form-fields label, .form-fields-vertical label { font-size: 14px; margin-bottom: 4px; color: var(--form-text-color, #333); }
.form-fields input, .form-fields select, .form-fields-vertical input, .form-fields-vertical select {
  padding: 6px 8px; border: 1px solid var(--form-border-color, #ccc); border-radius: 4px;
  font-size: 14px; min-width: 150px; background: var(--form-input-bg, #fff);
  color: var(--form-text-color, #333);
}
.form-fields-vertical input, .form-fields-vertical select { width: 100%; box-sizing: border-box; }
.daterange-wrapper { display: flex; align-items: center; gap: 4px; }
.daterange-wrapper-vertical { display: flex; flex-direction: column; gap: 4px; }
.daterange-separator { color: #666; font-size: 14px; }
.checkbox-group, .checkbox-group-vertical { display: flex; flex-wrap: wrap; gap: 8px; }
.radio-group, .radio-group-vertical { display: flex; flex-wrap: wrap; gap: 12px; }
.checkbox-label, .radio-label { display: flex; align-items: center; gap: 4px; font-weight: normal; cursor: pointer; }
.checkbox-label input[type="checkbox"], .radio-label input[type="radio"] { min-width: auto; width: auto; }
.form-actions { display: flex; justify-content: space-between; align-items: center; }
.form-actions-vertical { display: flex; flex-direction: column; gap: 8px; }
.action-group { display: flex; gap: 8px; }
.action-group-right { justify-content: flex-end; }
.btn-search, .btn-reset, .btn-export, .btn-custom {
  padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;
}
.btn-search { background: #1890ff; color: white; }
.btn-search:hover { background: #40a9ff; }
.btn-reset, .btn-export { background: #fff; border: 1px solid #d9d9d9; color: #333; }
.btn-reset:hover, .btn-export:hover:not(:disabled) { border-color: #1890ff; color: #1890ff; }
.btn-export:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-custom:hover:not(:disabled) { filter: brightness(1.1); }
.btn-custom:disabled { opacity: 0.5; cursor: not-allowed; }

.layout-top, .layout-bottom {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden visible; /* 纵向截断，横向溢出让子元素处理 */
}
.layout-top .form-area { flex-shrink: 0; margin-bottom: 16px; }
.layout-bottom .form-area { flex-shrink: 0; margin-top: 16px; }

/* 表格+分页外层容器：分页固定底部 */
.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
/* 左右布局时 wrapper 在 flex row 中占满剩余空间 */
.table-wrapper-flex {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* 表格滚动容器：横向+纵向滚动，background: #fff，四周边框 */
.table-scroll-x {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #fff;
  border: 1px solid #e8e8e8;
}
/* 表格：table-layout:fixed 确保列宽严格固定，separate 保证 sticky 边框不被 clip */
.data-table {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: max-content;
}
/* thead：position:sticky 固定在顶部（纵向滚动时），left:0（横向滚动时同步对齐） */
.data-table thead th {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 2;
  font-weight: 600;
  color: #333;
  text-align: left;
  padding: 6px 12px;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  border-left: 1px solid #e8e8e8;
  border-right: 1px solid #e8e8e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #fafafa;
  box-sizing: border-box;
}
.data-table td {
  padding: 6px 12px;
  text-align: left;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  border-left: 1px solid #e8e8e8;
  border-right: 1px solid #e8e8e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}
.data-table tbody tr:hover td { background: #f5f5f5; }
.loading-cell, .empty-cell { text-align: center; color: #999; padding: 20px !important; }
.pagination { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; padding: 12px 0; }
.pagination-info { font-size: 14px; color: #666; }
.pagination-controls { display: flex; gap: 8px; }
.page-btn { padding: 4px 12px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; cursor: pointer; font-size: 14px; }
.page-btn:hover:not(:disabled) { border-color: #1890ff; color: #1890ff; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-size-select select { padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 14px; }

/* 布局切换按钮组 */
.layout-toggle-group {
  display: flex;
  align-items: center;
  gap: 4px;
  --toggle-active-color: #1890ff;
  --toggle-inactive-color: #999;
}
.layout-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  padding: 3px;
  transition: background 0.15s, border-color 0.15s;
}
.layout-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.1);
}
.layout-toggle-btn.active {
  background: rgba(24, 144, 255, 0.1);
  border-color: rgba(24, 144, 255, 0.3);
}

/* 收缩/展开功能 */
.collapse-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 6px 12px;
  flex-shrink: 0;
  box-sizing: border-box;
}
.btn-collapse {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 13px;
  opacity: 0.7;
  padding: 4px 8px;
  border-radius: 4px;
}
.btn-collapse:hover { opacity: 1; background: rgba(0,0,0,0.06); }
.btn-collapse-pin {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.6;
  color: var(--form-text-color, #333);
}
.btn-collapse-pin:hover { opacity: 1; background: rgba(0,0,0,0.08); }
.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.form-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--form-text-color, #333);
}
.form-header-vertical {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.form-body-vertical {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  gap: 12px;
}
/* 左右布局收缩状态 */
.form-area-vertical {
  width: 250px;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  margin-right: 16px;
  flex-shrink: 0;
  overflow-y: auto;
  box-sizing: border-box;
  background: #f5f5f5;
  padding: 16px;
  position: relative;
  transition: width 0.25s ease, min-width 0.25s ease, padding 0.25s ease, margin 0.25s ease;
}
.form-area-vertical.form-area-collapsed {
  width: 52px !important;
  min-width: 52px !important;
  padding: 8px 4px;
  margin-right: 8px;
  overflow: hidden;
}
.form-area-right.form-area-collapsed {
  margin-right: 0;
  margin-left: 8px;
}
/* 收缩竖条（左右布局） */
.left-collapse-strip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 12px 0;
  height: 100%;
  box-sizing: border-box;
  flex: 1;
}
.left-collapse-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 6px 4px;
  border-radius: 4px;
  opacity: 0.8;
  writing-mode: horizontal-tb;
  width: 100%;
}
.left-collapse-btn:hover { opacity: 1; background: rgba(0,0,0,0.08); }
</style>
