onload = () => {
	changePage.init();
	changePage('start');
}

/**
 * ### 切换当前页面为 `pageName`
 *
 * 需要通过 {@link changePage.init} 初始化
 * @param {string} pageName 要切换到的页面名称
 */
function changePage(pageName) {
	for (const page of changePage.list) {
		page.style.display = page.dataset.pageName === pageName ? 'block' : '';
	}
}
/**@type {NodeListOf<HTMLDivElement>} */
changePage.list = [];
changePage.init = function () {
	this.list = document.getElementsByName('page');
}
