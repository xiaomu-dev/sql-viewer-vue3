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
			external: ['vue', 'element-plus', '@element-plus/icons-vue'],
			output: {
				exports: 'named',
				globals: {
					vue: 'Vue',
					'element-plus': 'ElementPlus',
					'@element-plus/icons-vue': 'ElementPlusIconsVue',
				},
				preserveModules: false,
			},
		},
	},
});
