function TextEditor(pathname) {
	const me = extend(E('section', [['class', 'text-editor']]), TextEditor.prototype)
	me.pathname = pathname
	get_text_file(pathname).then(x => me.data_loaded(x))

	me.cursor = EditorCursor()
	me.appendChild(me.cursor)

	return me
}

TextEditor.prototype.data_loaded = function (data) {
	let cline = E('div')
	for (let i = 0; i < data.length; i++) {
		const c = data[i]
		if (c === '\n') {
			this.appendChild(cline)
			cline = E('div')
		}
		else cline.appendChild(E('span', null, [[c]]))
	}
	if (cline.childNodes.length > 0)
		this.appendChild(cline)
}

function EditorCursor() {
	const me = extend(E('div', [['class', 'cursor']], [['_']]), EditorCursor.prototype)
	me.row = 0
	me.col = 0
	return me
}

add_stylesheet(`
.text-editor {
	position: relative;
	font-family: Monospace;
}
.text-editor .cursor {
	color: #f05;
	z-index: 9999;
	position: absolute;
	left: 0;
	top: 0;
}
`.trim())
