function TextEditor(pathname) {
	const me = extend(E('section', [['class', 'text-editor']]), TextEditor.prototype)
	me.pathname = pathname
	get_text_file(pathname).then(x => me.data_loaded(x))
	me.cursor = { col: 0, row: 0 }
	me.cursor_element = null
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
	this.cursor_element = this.childNodes[0].childNodes[0]
}

TextEditor.prototype.keymap = {}

TextEditor.prototype.char_at = function(row, col) {
	return this.childNodes[row].childNodes[col]
}

TextEditor.prototype.set_char_at = function(elem) {
	this.cursor_element.classList.remove('cursor')
	elem.classList.add('cursor')
	this.cursor_element = elem
}

TextEditor.prototype.char_at_point = function() {
	return this.char_at(this.cursor.row, this.cursor.col)
}

TextEditor.prototype.insert = function (text) {
	console.log(text)
	let i = 0
	let elem = this.char_at_point()
	while(i < text.length) {
		elem.parentNode.insertBefore(E('span', null, [[text[i]]]), elem)
		i++
		elem = elem.nextSibling
		this.next_char()
	}
}

TextEditor.prototype.place_cursor = function(row, col) {
	this.set_char_at(this.childNodes[row].childNodes[col])
	this.cursor.row = row
	this.cursor.col = col
}

TextEditor.prototype.get_line = function(row) {
	return this.childNodes[row]
}

TextEditor.prototype.current_line = function() {
	return this.get_line(this.cursor.row)
}

TextEditor.prototype.next_char = function() {
	let x = this.cursor_element.nextSibling
	if (x) {
		this.set_char_at(x)
		this.cursor.col += 1
		return
	}
	x = this.cursor_element.parentElement.nextSibling
	if (x) {
		this.set_char_at(x.childNodes[0])
		this.cursor.col = 0
		this.cursor.row += 1
	}
}

TextEditor.prototype.on_key_down = function(e) {
	console.log(e.keyCode)
	switch (e.keyCode) {
		default:
			this.insert(e.key)
			break
	}
}

add_stylesheet(`
.text-editor {
	position: relative;
	font-family: Monospace;
	white-space: pre;
}

.text-editor .cursor {
	background: #f05;
	color: #fff;
}
`.trim())

function self_insert(e) { insert(e.key) }
function insert(x) { active_buffer.insert(x) }
