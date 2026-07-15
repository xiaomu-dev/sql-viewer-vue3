import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import vue from 'rollup-plugin-vue';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import scss from 'rollup-plugin-scss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
	input: resolve(__dirname, 'src/index.js'),
	output: [
		{
			format: 'es',
			file: resolve(__dirname, 'dist/sql-viewer-vue3.es.js'),
			exports: 'named',
		},
		{
			format: 'umd',
			file: resolve(__dirname, 'dist/sql-viewer-vue3.umd.js'),
			name: 'SqlViewerVue3',
			globals: {
				vue: 'Vue',
				'element-plus': 'ElementPlus',
				'@element-plus/icons-vue': 'ElementPlusIconsVue',
			},
		},
	],
	external: ['vue', 'element-plus', '@element-plus/icons-vue'],
	plugins: [
		vue({
			css: true,
			preprocessStyles: true,
		}),
		scss(),
		nodeResolve({
			resolveOnly: ['codemirror', '@codemirror/autocomplete', '@codemirror/lang-sql', '@codemirror/state', '@codemirror/view', 'sql-formatter'],
		}),
		commonjs(),
	],
};
