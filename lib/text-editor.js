function TextEditor(pathname) {
	const me = E('section', [['class', 'text-editor']])
	me.pathname = pathname
	get_text_file(pathname).then(x => me.data_loaded(x))
	return extend(me, TextEditor.prototype)
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

add_stylesheet(`
.text-editor {
	font-family: Monospace;
}
`.trim())
