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

/**胜负计数器 */
class Counter {
	static k = 0;
	n = 0;
	// k = Counter.k++;
}

/**
 * 生成数组
 * @template T
 * @param {number} length 长度
 * @param {() => T} fn 产生值的函数
 */
function initArray(length, fn) {
	return Array(length).fill(null).map(fn);
}

class Judger {
	/**
	 * 初始化一个胜负判别器
	 * @param {number} size 棋盘尺寸
	 */
	constructor(size) {
		this.size = size;
		/**@type {Counter[][][]} */
		const board = initArray(size, () => initArray(size, () => []));
		const counters = initArray(size + 2, () => new Counter());
		const [counterLeft, counterRight, ...counterCols] = counters;
		for (let i = 0; i < size; ++i) {
			const counterRow = new Counter();
			counters.push(counterRow);
			for (let j = 0; j < size; ++j) {
				board[i][j].push(counterRow, counterCols[j]);
			}
			board[i][i].push(counterLeft);
			board[i][size - i - 1].push(counterRight);
		}
		this.board = board;
		this.counters = counters;
	}
	/**棋盘尺寸 */
	size;
	/**棋盘映射 */
	board;
	/**所有计数器 */
	counters;
	/**判断胜负 */
	judge() {
		for (const counter of this.counters) {
			switch (counter.n) {
				case this.size: return 1;
				case -this.size: return -1;
			}
		}
		return 0;
	}
	/**
	 * 落子
	 * @param {number} x
	 * @param {number} y
	 * @param {-1 | 1} chess 棋手
	 */
	put(x, y, chess) {
		this.board[x][y].forEach(counter => counter.n += chess);
	}
}

/**
 * 获取一个棋局的闭包对象
 * @param {number} size 棋盘尺寸
 */
function getGame(size) {
	/**@type {(-1 | 0 | 1)[][]} */
	const board = initArray(size, () => initArray(size, () => 0));
	const judger = new Judger(size);
	let playerNow = 1;
	return {
		/**
		 * 落子
		 * @param {number} x
		 * @param {number} y
		 * @returns {null | -1 | 0 | 1} 是否成功
		 */
		put(x, y) {
			if (board[x][y]) return null;
			board[x][y] = playerNow;
			judger.put(x, y, playerNow);
			playerNow = -playerNow;
			return judger.judge();
		},
		/**
		 * 获取当前棋盘
		 * @returns {readonly (readonly (-1 | 0 | 1)[])[]}
		 */
		getBoard() {
			return board;
		},
	};
}
