const ButtonsMap = {
	rect: {
		panel: 'stroke',
		name: '矩形工具'
	},
	ellipse: {
		panel: 'stroke',
		name: '椭圆工具'
	},
	brush: {
		panel: 'stroke',
		name: '画笔工具'
	},
	arrow: {
		panel: 'stroke',
		name: '箭头工具'
	},
	mosaic: {
		panel: 'mosaic',
		name: '马赛克工具'
	},
	font: {
		panel: 'font',
		name: '文字工具'
	},
	rubber: {
		name: '橡皮擦'
	},
	undo: {
		name: '撤销操作'
	},
	resume: {
		name: '恢复操作'
	},
	save: {
		name: '保存'
	},
	cancel: {
		name: '取消'
	},
	ok: {
		name: '确定'
	}
}


//可用颜色
const ColorList = ['#ff2600', '#ffeb00', '#61ed00', '#00b4ff', '#a100ff', '#000000', '#545454', '#a8a8a8', '#ffffff']

//可选择字号，Chrome不支持小于12号的字体
const FontSize = [12, 14, 16, 18, 20, 22]

//画笔大小
const StrokeWidth = [2, 4, 6]


/**
 * 获取buttons模版
 * @param  {Array}  buttons [可用按钮]
 * @return {String} 
 */
const getButtons = (buttons = []) => {
	let html = []
	const useButton = btn => {
		return buttons && !!~buttons.indexOf(btn)
	}
	for (let key in ButtonsMap) {
		if (useButton(key)) {
			let btn = ButtonsMap[key]
			html.push(`<div class="canvas-tools-btn js-btn" data-panel="${btn.panel || ''}" data-value="${key}" data-action="" title="${btn.name}">
			<a class="btn-toggle"><i class="canvas-tools-icon__${key}"></i></a>
			</div>`)
		}
	}
	return html.join('')
}


/**
 * 获取颜色面板
 * @param  {String} color [当前选中色]
 * @return {String}
 */
const getColorPanel = (color = '#ff2600') => {
	let html = ''
	html += '<div class="colors">'
	// html += `<span class="color-selected"><i class="js-color-selected" style="background:${color}"></i></span>`
	html += '<div class="color-list">'

	let items = []
	for (let i = 0; i < 9; i++) {
		let item = `<li class="js-color" style="background:${ColorList[i]}; border-color: ${color === ColorList[i] ? '#fff':'#2a2e32'}" data-value="${ColorList[i]}"></li>`
			items.push(item)
	}

	html += `<ul>${items.join('')}</ul>`

	html += '</div>'
	html += '</div>'

	return html
}


/**
 * 获取画笔大小面板
 * @param  {Number} stroke [当前画笔大小]
 * @return {String}  
 */
const getStrokePanel = (stroke = 2) => {
	let html = '<div class="strokes">'
	for (let i = 0, len = StrokeWidth.length; i < len; i++) {
		let size = StrokeWidth[i]
		let classes = ['stroke', 'js-stroke-width']
		size === stroke && classes.push('active')
		html += `<a class="${classes.join(' ')}" data-value="${size}"><i style="width:${size + 1}px;height:${size + 1}px;"></i></a>`
	}
	html += '</div>'
	return html
}


/**
 * 获取字号选择器
 * @param  {Number} fontSize [默认字号]
 * @return {String} 
 */
const getFontPanel = (fontSize = 12) => {
	let html = '<div class="strokes"><span>字号</span><select class="font-select js-font-size">'
	for (let i = 0, len = FontSize.length; i < len; i++) {
		let size = FontSize[i]
		let selected = !!(size === fontSize) ? 'selected' : ''
		html += `<option value="${size}" ${selected}>${size}</option>`
	}
	html += '</select>'
	html += '</div>'
	return html
}


/**
 * 获取模糊度模版
 * @param  {Number} ambiguite [默认模糊度 0 - 1]
 * @return {String}  
 */
const getAmbiguity = (ambiguite = .5) => `<label class="ambiguite-range"><span>画笔模糊度</span><input type="range" min="0" step="0.01" max="1" value="${ambiguite}" class="js-mosaic-ambiguity"></label>`

export default {
	getButtons,
	getColorPanel,
	getStrokePanel,
	getFontPanel,
	getAmbiguity,
}