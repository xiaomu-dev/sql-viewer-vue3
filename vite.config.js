import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
	plugins: [vue(), cssInjectedByJsPlugin()],
	build: {
		cssCodeSplit: false,
		lib: {
			formats: ['es', 'umd'],
			entry: resolve(__dirname, 'src/index.js'),
			name: 'SqlViewerVue3',
			fileName: format => `sql-viewer-vue3.${format}.js`,
		},
		rollupOptions: {
			// 只外置用户需要提供的三个包，其余全部打进 bundle
			external: [
				'vue',
				'element-plus',
				'@element-plus/icons-vue',
			],
			output: {
				exports: 'named',
				globals: {
					vue: 'Vue',
					'element-plus': 'ElementPlus',
					'@element-plus/icons-vue': 'ElementPlusIconsVue',
				},
				preserveModules: false,
				inlineDynamicImports: true,
			},
		},
	},
	resolve: {
		mainFields: ['module', 'main'],
		// 确保所有依赖都能被正确解析并内联
		dedupe: [
			'@codemirror/state',
			'@codemirror/view',
			'@codemirror/autocomplete',
			'@codemirror/lang-sql',
			'@codemirror/theme-one-dark',
			'codemirror',
			'sql-formatter',
		],
	},
});
