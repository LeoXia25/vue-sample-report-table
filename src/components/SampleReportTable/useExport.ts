/**
 * 导出工具 - 原生方式生成 Excel 文件
 * 不依赖任何第三方库
 */

import type { TableColumn } from './types'

/**
 * 将数据转换为 Excel XML 格式
 * @param columns 列配置
 * @param data 数据
 * @returns Excel XML 字符串
 */
function convertToExcelXML(columns: TableColumn[], data: Record<string, any>[]): string {
  const COLUMNS = columns.map((col, i) => ({
    ...col,
    width: typeof col.width === 'number' ? col.width : parseInt(String(col.width || '100'), 10)
  }))

  // 列宽定义
  const colWidths = COLUMNS.map((col, i) => {
    const w = col.width > 0 ? col.width : 100
    return `<Column ss:Index="${i + 1}" ss:Width="${w}"/>`
  }).join('\n  ')

  // 表头行
  const headerCells = COLUMNS.map(col => {
    return `  <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(col.label || '')}</Data></Cell>`
  }).join('\n')

  // 数据行
  const dataRows = data.map(row => {
    const cells = COLUMNS.map(col => {
      const value = row[col.key] ?? ''
      const type = typeof value === 'number' ? 'Number' : 'String'
      return `  <Cell><Data ss:Type="${type}">${escapeXml(String(value))}</Data></Cell>`
    }).join('\n')
    return `<Row>\n${cells}\n</Row>`
  }).join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    '<Styles>',
    '  <Style ss:ID="Header">',
    '    <Font ss:Bold="1"/>',
    '    <Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/>',
    '  </Style>',
    '</Styles>',
    '<Worksheet ss:Name="Report">',
    '<Table>',
    '  ' + colWidths,
    '<Row>',
    headerCells,
    '</Row>',
    dataRows,
    '</Table>',
    '</Worksheet>',
    '</Workbook>'
  ].join('\n')
}

/**
 * XML 特殊字符转义
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * 生成 Excel 文件并触发下载
 * @param columns 列配置
 * @param data 数据
 * @param filename 文件名（不含扩展名）
 */
export function exportToExcel(
  columns: TableColumn[],
  data: Record<string, any>[],
  filename: string
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  const xmlContent = convertToExcelXML(columns, data)

  // 创建 Blob（Excel XML 格式实际上是 HTML/XML，可用 application/vnd.ms-excel 或后缀 .xls 打开）
  const blob = new Blob([xmlContent], {
    type: 'application/vnd.ms-excel;charset=utf-8'
  })

  // 生成下载链接
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.xls`
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 导出全部数据（需要传入全部数据）
 * @param columns 列配置
 * @param data 全部数据
 * @param filename 文件名
 */
export function exportAll(
  columns: TableColumn[],
  data: Record<string, any>[],
  filename: string
): void {
  exportToExcel(columns, data, filename)
}

/**
 * 导出当前页数据
 * @param columns 列配置
 * @param data 当前页数据
 * @param filename 文件名
 */
export function exportCurrentPage(
  columns: TableColumn[],
  data: Record<string, any>[],
  filename: string
): void {
  exportToExcel(columns, data, filename)
}
