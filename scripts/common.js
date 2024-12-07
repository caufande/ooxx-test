onload = () => {
	changePage.init();
	changePage('start');
}

/**
 * 切换当前页面为 `pageName`
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

/**获取棋子枚举对象 */
function getChesses() {
	const v = '　';
	return inputofir.checked
		? { [-1]: '叉', 0: v, 1: '圈' }
		: { [-1]: '圈', 0: v, 1: '叉' };
}

/**
 * 移除一个元素的所有子元素
 * @param {Node} node 元素
 */
function clearChildren(node) {
	let child;
	while (child = node.childNodes[0]) {
		node.removeChild(child);
	}
}

/**开始游戏 */
async function gameStart() {
	changePage('play');
	clearChildren(playdiv);
	const chesses = getChesses();
	const size = parseInt(document.getElementsByName('input-size')[0].value);
	const { table, winPromise } = getGameTable(size, chesses);
	const text = genElement('h3', playdiv);
	playdiv.appendChild(table);
	const result = await winPromise;
	text.innerHTML = `游戏结束！${chesses[result]}赢得了游戏<br /><a href="javascript:changePage('start');">点我回到标题</a>`;
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
		 * @returns {(-1 | 0 | 1)[][]}
		 */
		getBoard() {
			return board;
		},
	};
}

/**
 * 同步棋盘
 * @param {(-1 | 0 | 1)[][]} board
 * @param {HTMLButtonElement[][]} eles
 * @param {Record<-1 | 0 | 1, string>} chesses 棋子
 */
function syncBoard(board, eles, chesses) {
	const size = board.length;
	for (let i = 0; i < size; ++i) {
		for (let j = 0; j < size; ++j) {
			eles[i][j].innerText = chesses[board[i][j]];
		}
	}
}

/**
 * 生成一个 HTML 元素
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag 标签
 * @param {null | HTMLElement} [dad=null] 父节点
 * @returns {HTMLElementTagNameMap[K]}
 */
function genElement(tag, dad = null) {
	const node = document.createElement(tag);
	if (dad) dad.appendChild(node);
	return node;
}

/**
 * 生成游戏表格元素
 * @param {number} size 棋盘大小
 * @param {Record<-1 | 0 | 1, string>} chesses 棋子
 */
function getGameTable(size, chesses) {
	const game = getGame(size);
	/**@type {HTMLButtonElement[][]} */
	const eles = initArray(size, () => []);
	/**@type {(-1 | 1) => void} */
	let res;
	let end = false;
	/**@type {Promise<-1 | 1>} */
	const winPromise = new Promise(r => res = r).then(r => {
		end = true;
		return r;
	});
	const table = genElement('table');
	for (let i = 0; i < size; ++i) {
		const tr = genElement('tr', table);
		for (let j = 0; j < size; ++j) {
			const button = eles[i][j] = genElement('button', genElement('td', tr));
			const pos = [i, j]
			button.onclick = () => {
				if (end) return;
				const result = game.put(...pos);
				syncBoard(game.getBoard(), eles, chesses);
				if (!result) return;
				res(result);
			}
			button.className = 'game-button';
		}
	}
	syncBoard(game.getBoard(), eles, chesses);
	return { table, winPromise }
}
