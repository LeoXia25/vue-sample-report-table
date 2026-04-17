<script setup>
	import { ref } from 'vue'
	import SampleReportTable from '../components/SampleReportTable/index.vue'

	// 配置表单字段（与真实接口参数对应）
	// type: input | select | date | daterange | checkbox | radio
	const formFields = [
		{
			key: 'startTime',
			label: '开始时间',
			type: 'date',
			defaultValue: '2025-03-17'
		},
		{
			key: 'endTime',
			label: '结束时间',
			type: 'date',
			defaultValue: '2026-05-17'
		},
		{
			key: 'hospitalCode',
			label: '医疗机构',
			type: 'select',
			multiple: false,          // 启用多选
			defaultValue: [1170],// 多选默认值必须是数组
			dynamicOptions: {
				optionsUrl: '/api/Sys_Hospital/GetHospitals',
				optionsMethod: 'GET',
				optionsParams: {},
				optionsSuccessCode: 0,
				optionsCodeKey: 'Code',
				optionsDataKey: 'Data',
				optionsLabelKey: 'HospitalName',
				optionsValueKey: 'HospitalCode'
			}
		},
		{
			key: 'queryStr',
			label: '查询条件',
			type: 'input',
			placeholder: '请输入查询条件',
			defaultValue: ''
		}
	]

	// 真实接口地址（开发环境走 Vite 代理，生产环境需配置真实域名）
	const apiUrl = ref('/api/QcEvaluate/queryBloodInfo')
	const method = ref('GET')

	// 布局配置: top / bottom / left / right
	const layout = ref('left')

	// 参数面板样式配置
	const formAreaStyle = ref({
		background: '#f5f5f5'
	})

	// 按钮回调
	function onSearch(payload) {
		console.log('【查询】formData:', payload.formData)
		console.log('【查询】tableData:', payload.tableData)
		console.log('【查询】columns:', payload.columns)
		console.log('【查询】pagination:', payload.pagination)
	}

	function onExportCurrent(payload) {
		console.log('【导出当前页】formData:', payload.formData)
		console.log('【导出当前页】tableData:', payload.tableData)
		console.log('【导出当前页】columns:', payload.columns)
	}

	function onExportAll(payload) {
		console.log('【导出全部】formData:', payload.formData)
		console.log('【导出全部】tableData:', payload.tableData)
		console.log('【导出全部】columns:', payload.columns)
	}

	// 自定义按钮配置
	const customButtons = [
		{
			text: '自定义A',
			style: 'background: #52c41a; color: #fff;',
			onClick: (payload) => {
				console.log('【自定义按钮A】formData:', payload.formData)
				console.log('【自定义按钮A】tableData:', payload.tableData)
			}
		},
		{
			text: '自定义B',
			style: 'background: #fa8c16; color: #fff;',
			disabled: false,
			onClick: (payload) => {
				console.log('【自定义按钮B】formData:', payload.formData)
			}
		}
	]
</script>

<template>
	<div class="report-demo">
		<div class="main-info">
			<SampleReportTable
				:report-id="'blood-info-report'"
				:form-fields="formFields"
				:api-url="apiUrl"
				:method="method"
				:layout="layout"
				:form-area-style="formAreaStyle"
				:pagination="{
					enabled: true,
					pageSize: 10,
					pageSizes: [10, 20, 50]
				}"
				search-text="查询"
				reset-text="重置"
				@update:layout="layout = $event"
				:on-search="onSearch"
				:on-export-current="onExportCurrent"
				:on-export-all="onExportAll"
				:custom-buttons="customButtons"
			/>
		</div>
	</div>
</template>

<style scoped>
	.main-info {
		border: 5px solid #d9d9d9;
		border-radius: 4px;
		padding: 10px;
		height: 100vh;
		overflow: hidden;
		box-sizing: border-box;
	}

	.report-demo {
		height: 100%;
	}
</style>
