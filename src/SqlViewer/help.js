/**
 * 深层合并
 * @param {Object} target
 * @param {Object} source
 * @returns {Object} 以source补充覆盖target
 */
export const deepMerge = (target, source) => {
	const merged = { ...target };
	for (const key in source) {
		if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object') {
			merged[key] = deepMerge(target[key], source[key]);
		} else {
			merged[key] = source[key] !== undefined ? source[key] : target[key];
		}
	}
	return merged;
};

// 默认面板配置
export const defPanel = {
	main: { layout: 'horizontal', lazy: false },
	left: { min: '200', size: '300' },
	right: { min: '30%' },
	sub: { layout: 'vertical', lazy: false },
	top: { min: '30%' },
	bottom: { min: '30%' },
};

// 默认标签页配置
export const defTabs = [
	{ label: '表', name: 'table' },
	{ label: '视图', name: 'view' },
	{ label: '函数', name: 'function' },
];
