<template>
	<div class="SqlViewer">
		<div class="SqlViewer__tool">
			<slot name="tool">
				<el-button :icon="VideoPlay" type="primary" size="small" plain @click="clickRun"> 执行 </el-button>
				<el-button :icon="Tickets" type="primary" size="small" plain @click="clickFormat"> 美化 </el-button>
				<el-button :icon="Document" type="primary" size="small" plain @click="clickMinify"> 压缩 </el-button>
			</slot>
		</div>

		<div ref="EditorRef" class="SqlViewer__editor"></div>
	</div>
</template>

<script setup>
	// 依赖
	import { ref, watch, computed, onMounted, onUnmounted } from 'vue';

	// CodeMirror
	import { basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import { EditorView } from '@codemirror/view';
	import { sql } from '@codemirror/lang-sql';

	// Element Plus 图标
	import { VideoPlay, Tickets, Document } from '@element-plus/icons-vue';

	// 收 传 ------------------------------------------------------------------------------------
	const props = defineProps({
		modelValue: { type: String, default: '' },
		tips: { type: Array, default: () => [] },
	});
	const emits = defineEmits(['update:modelValue', 'run']);

	// 双向绑定 ------------------------------------------------------------------------------------
	watch(
		() => props.modelValue,
		val => view && val !== view.state.doc.toString() && updateEditor(val),
		{ immediate: false }
	);
	const updateVal = v => {
		if (v.docChanged) {
			const val = v.state.doc.toString();
			if (val !== props.modelValue) emits('update:modelValue', val);
		}
	};

	// 主题 ------------------------------------------------------------------------------------
	const theme_scroll = EditorView.theme({
		'&': { height: '100%' },
		'.cm-scroller': { overflow: 'auto' },
	});
	const theme_ep = EditorView.theme({
		'.cm-gutters': { background: 'var(--el-fill-color-light)', borderColor: 'var(--el-border-color-dark)' },
		'.cm-activeLineGutter': { background: 'var(--el-border-color-dark)', color: 'var(--el-text-color-primary) !important', fontWeight: 'bold' },
		'.cm-gutterElement': { color: 'var(--el-text-color-secondary)' },
	});

	// 自定义提示 ------------------------------------------------------------------------------------
	const currTips = computed(() => props.tips.map(table => ({ label: table, type: 'variable', apply: table, boost: -99 })));
	const customTip = context => {
		let word = context.matchBefore(/\w+/); // 确保匹配至少一个字符
		// 非显式触发且无匹配单词时不返回结果
		if (!word && !context.explicit) return null;
		const prefix = word?.text.toLowerCase() || '';
		// 进行前缀匹配
		const match = currTips.value.filter(item => item.label.toLowerCase().startsWith(prefix));
		// 没有匹配项时不显示补全菜单
		if (match.length === 0) return null;
		return {
			from: word?.from || context.pos, // 补全开始位置
			options: match, // 只返回前缀匹配的选项
		};
	};

	// 编辑器实例 创建 销毁 监听更新 更新编辑器 ------------------------------------------------------------------------------------
	let view = null;
	const EditorRef = ref(null);
	const createEditor = () => {
		destroyEditor();
		if (!EditorRef.value) return;

		const state = EditorState.create({
			doc: props.modelValue,
			extensions: [basicSetup, sql(), sql().language.data.of({ autocomplete: customTip }), theme_scroll, theme_ep, EditorView.updateListener.of(v => updateVal(v))],
		});

		view = new EditorView({ state, parent: EditorRef.value });
	};
	const destroyEditor = () => view && (view.destroy(), (view = null));
	const updateEditor = v => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v } });

	// 执行 -------------------------------------------------------------------------------------------
	const clickRun = () => {
		if (!view) return;
		const sql = minify(view.state.doc.toString());
		emits('run', sql);
	};

	// 美化 -------------------------------------------------------------------------------------------
	import { format } from 'sql-formatter';
	const clickFormat = () => {
		if (!view) return;
		try {
			const val = view.state.doc.toString();
			if (!val.trim()) return;
			const sql = format(val, { language: 'sql', indent: '  ', uppercase: true });
			updateEditor(sql);
		} catch (error) {
			console.error('SQL格式化失败:', error);
		}
	};

	// 压缩 -------------------------------------------------------------------------------------------
	const minify = sql => {
		try {
			let mv1 = sql;
			if (!mv1.trim()) return '';

			// 1: 移除注释
			let mv2 = mv1.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '');

			// 2: 处理字符串常量
			const mv3 = [];
			let mv4 = mv2.replace(/'([^']*)'/g, (match, content) => {
				const mv5 = `__STRING_PLACEHOLDER_${mv3.length}__`;
				mv3.push(content);
				return `'${mv5}'`;
			});

			// 3: 移除换行符 多空格=>单空格 空格优化 必要空格 移除多余空格 括号空格 分号空格 首尾去空格
			let mv6 = mv4
				.replace(/\n+/g, ' ')
				.replace(/\s+/g, ' ')
				.replace(/\s*([(){}[\],;])\s*/g, '$1')
				.replace(/([+\-*/=<>])/g, ' $1 ')
				.replace(/\s+/g, ' ')
				.replace(/(\()\s+/g, '$1')
				.replace(/\s+(\))/g, '$1')
				.replace(/(\[)\s+/g, '$1')
				.replace(/\s+(\])/g, '$1')
				.replace(/;\s*/g, '; ')
				.trim();

			// 4: 恢复字符串常量
			mv6 = mv6.replace(/__STRING_PLACEHOLDER_(\d+)__/g, (match, index) => {
				return mv3[parseInt(index)] || '';
			});

			// 5: 移除空格 确保字符串闭合 保留空字符串
			mv6 = mv6.replace(/;$/, ';').replace(/''/g, "''");

			return mv6;
		} catch (error) {
			console.error('SQL压缩失败:', error);
		}
	};
	const clickMinify = () => {
		if (!view) return;
		const sql = minify(view.state.doc.toString());
		updateEditor(sql);
	};

	// 周期 ------------------------------------------------------------------------------------
	onMounted(() => createEditor());
	onUnmounted(() => destroyEditor());
	// 暴露 ------------------------------------------------------------------------------------
	defineExpose({
		getEditorView: () => view,
		getEditorState: () => view?.state,
		run: clickRun,
		format: clickFormat,
		minify: clickMinify,
	});
</script>

<style lang="scss" scoped>
	.SqlViewer {
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--el-border-color);
		border-radius: var(--el-border-radius-base);

		&__tool {
			width: 100%;
			padding: 8px 16px;
			box-sizing: border-box;
			background: var(--el-fill-color-light);
			border-bottom: 1px solid var(--el-border-color);
			display: flex;
			gap: 8px;
			align-items: center;
		}

		&__editor {
			flex: 1;
			overflow: hidden;
		}
	}
</style>
