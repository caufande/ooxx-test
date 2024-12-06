onload = () => {
	changePage.init();
	changePage('start');
}

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
