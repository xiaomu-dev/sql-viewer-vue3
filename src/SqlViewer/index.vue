<template>
	<div class="PanelArea">
		<el-splitter v-bind="currPanel.main" class="MainArea">
			<el-splitter-panel v-bind="currPanel.left">
				<div class="PanelArea LeftArea">
					<slot name="left">
						<el-tabs v-model="currTab" @tab-change="tabChange" tab-position="left">
							<el-tab-pane :label="v.label" :name="v.name" v-for="v in currTabs" />
						</el-tabs>

						<el-auto-resizer>
							<template #default="{ height, width }">
								<el-tree-v2 lazy :data="props.tree[currTab]" :props="props.treeProps[currTab]" :height="height" :item-size="36">
									<template #default="{ node, data }">
										<el-icon class="el-icon--left">
											<slot name="leftTreeIcon" :node="node" :data="data">
												<Document v-if="node.isLeaf" />
												<Folder v-else-if="!node.expanded" />
												<FolderOpened v-else />
											</slot>
										</el-icon>

										<slot name="leftTreeIcon" :node="node" :data="data">
											{{ node.label }}
										</slot>
									</template>
								</el-tree-v2>
							</template>
						</el-auto-resizer>
					</slot>
				</div>
			</el-splitter-panel>
			<el-splitter-panel v-bind="currPanel.right" class="SubArea">
				<el-splitter v-bind="currPanel.sub">
					<el-splitter-panel v-bind="currPanel.top">
						<div class="PanelArea TopArea">
							<slot name="top">
								<Editor v-model="currSql" :tips="props.tips" @run="v => emits('run', v)">
									<template #tool> <slot name="tool"></slot> </template>
								</Editor>
							</slot>
						</div>
					</el-splitter-panel>
					<el-splitter-panel v-bind="currPanel.bottom">
						<div class="PanelArea BottomArea">
							<slot name="bottom">
								<el-tabs type="border-card">
									<el-tab-pane label="信息">
										<slot name="info">
											<div class="Info">
												<el-icon size="22">
													<SuccessFilled v-if="infoType == 'success'" style="color: var(--el-color-success)" />
													<WarningFilled v-else-if="infoType == 'warning'" style="color: var(--el-color-warning)" />
													<CircleCloseFilled v-else-if="infoType == 'error'" style="color: var(--el-color-error)" />
													<InfoFilled v-else-if="infoType == 'info'" style="color: var(--el-color-info)" />
												</el-icon>
												{{ info }}
											</div>
										</slot>
									</el-tab-pane>
									<el-tab-pane label="结果">
										<slot name="table">
											<el-auto-resizer>
												<template #default="{ height, width }">
													<el-table-v2 v-if="result.length > 0" :columns="cols" :data="result" :width="width" :height="height" fixed border stripe />
												</template>
											</el-auto-resizer>
										</slot>
									</el-tab-pane>
								</el-tabs>
							</slot>
						</div>
					</el-splitter-panel>
				</el-splitter>
			</el-splitter-panel>
		</el-splitter>
	</div>
</template>

<script setup>
	import { ref, computed } from 'vue';
	import { SuccessFilled, WarningFilled, CircleCloseFilled, InfoFilled, Document, Folder, FolderOpened } from '@element-plus/icons-vue';
	import { deepMerge, defPanel, defTabs } from './help.js';

	// 收 传 ------------------------------------------------------------------------------------------
	const props = defineProps({
		// 面板配置 -------------------------------------
		panel: { type: Object, default: () => ({}) },

		// LeftArea -------------------------------------
		tab: { type: String, default: '' },
		tabs: { type: Array, default: () => null },
		tree: { type: Object, default: () => ({}) },
		treeProps: { type: Object, default: () => ({}) },

		// TopArea -------------------------------------
		sql: { type: String, default: '' },
		tips: { type: Array, default: () => [] },

		// BottomArea -------------------------------------
		info: { type: String, default: '' },
		infoType: { type: String, default: '' },
		result: { type: Array, default: () => [] },
		cols: { type: Array, default: () => [] },
	});
	const emits = defineEmits(['update:tab', 'tabChange', 'update:sql', 'run']);

	// 面板配置 ------------------------------------------------------------------------------------------
	const currPanel = computed(() => deepMerge(defPanel, props.panel));

	// LeftArea ------------------------------------------------------------------------------------------
	const currTabs = computed(() => props.tabs || defTabs);
	const currTab = computed({
		get: () => props.tab,
		set: val => emits('update:tab', val),
	});
	const tabChange = val => emits('tabChange', val);

	// TopArea ------------------------------------------------------------------------------------------
	import Editor from './Editor.vue';
	const currSql = computed({
		get: () => props.sql,
		set: val => emits('update:sql', val),
	});

	// BottomArea ---------------------------------------------------------------------------------------
</script>

<style lang="scss" scoped>
	.PanelArea {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.LeftArea {
		display: flex;

		:deep(.el-tabs--left) {
			width: auto;

			.el-tabs__content {
				height: 100%;
				display: none;
			}

			.el-tabs__item.is-left {
				writing-mode: vertical-lr;
				width: auto;
				height: auto;
				padding: 12px 8px;
			}

			.el-tabs__item.is-active {
				background: var(--el-fill-color-dark);
			}
		}

		:deep(.el-tree) {
			.el-tree-node__expand-icon {
				display: none;
			}
		}
	}

	// .TopArea { }

	.BottomArea {
		.Info {
			display: flex;
			align-items: center;
			gap: 10px;
		}
	}
</style>
