import SqlViewer from './SqlViewer/index.vue';

SqlViewer.install = app => {
	app.component('SqlViewer', SqlViewer);
};

export default SqlViewer;
export { SqlViewer };
