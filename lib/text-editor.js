function TextEditor(pathname) {
	const me = extend(E('section', [['class', 'text-editor']]), TextEditor.prototype)
	me.pathname = pathname
	get_text_file(pathname).then(x => me.data_loaded(x))
	me.cursor = { col: null, row: null }
	me.cursor_element = null
	return me
}

TextEditor.prototype.data_loaded = function (data) {
	let cline = E('div')
	for (let i = 0; i < data.length; i++) {
		const c = data[i]
		if (c === '\n') {
			cline.appendChild(final_span())
			this.appendChild(cline)
			cline = E('div')
		}
		else cline.appendChild(E('span', null, [[c]]))
	}
	if (cline.childNodes.length > 0)
		this.appendChild(cline)
	this.cursor_element = this.childNodes[0].childNodes[0]
	this.cursor_element.classList.add('cursor')
	this.cursor.row = 0
	this.cursor.col = 0
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

TextEditor.prototype.char_at_point = function() { return this.cursor_element }

TextEditor.prototype.insert_char = function (x) {
	const elem = this.char_at_point()
	elem.parentNode.insertBefore(E('span', null, [x]), elem)
	this.cursor.col++
}

TextEditor.prototype.delete_char_backward = function(x) {
	const elem = this.char_at_point().previousSibling
	let pl
	if (elem) {
		elem.remove()
		this.cursor.col--
	} else if (pl = this.current_line().previousSibling) {
		const len = pl.childNodes.length - 1
		this.merge_two_lines(pl, this.current_line())
		this.cursor.row -= 1
		this.cursor.col = len
	}
}

TextEditor.prototype.merge_two_lines = function (a, b) {
	last(a.childNodes).remove()
	for (const x of Array.from(b.childNodes))
		a.appendChild(x)
	b.remove()
}

TextEditor.prototype.delete_char_forward = function(x) {
	const elem = this.char_at_point().nextSibling
	if (elem) elem.remove()
}

TextEditor.prototype.place_cursor = function(row, col) {
	this.set_char_at(this.childNodes[row].childNodes[col])
	this.cursor.row = row
	this.cursor.col = col
}

TextEditor.prototype.get_line = function(row) { return this.childNodes[row] }

TextEditor.prototype.current_line = function() { return this.get_line(this.cursor.row) }

TextEditor.prototype.next_char = function() {
	let x = this.cursor_element.nextSibling
	if (x) {
		this.set_char_at(x)
		this.cursor.col += 1
		return
	}
	this.next_line()
}

TextEditor.prototype.next_line = function() {
	let x = this.cursor_element.parentElement.nextSibling
	if (x) {
		this.set_char_at(first(x.childNodes))
		this.cursor.col = 0
		this.cursor.row += 1
	}
}

TextEditor.prototype.prev_char = function() {
	const x = this.cursor_element.previousSibling
	if (x) {
		this.set_char_at(x)
		this.cursor.col -= 1
		return
	} else if (this.current_line().previousSibling) {
		this.set_char_at(last(this.current_line().previousSibling.childNodes))
		this.cursor.col = this.current_line().previousSibling.childNodes.length - 1
		this.cursor.row -= 1
	}
}

TextEditor.prototype.prev_line = function() {
	const x = this.cursor_element.parentElement.previousSibling
	if (x) {
		this.set_char_at(first(x.childNodes))
		this.cursor.col = 0
		this.cursor.row -= 1
	}
}

TextEditor.prototype.new_line_at_point = function() {
	const line = this.current_line()
	line.parentElement.insertBefore(
		reduce(
			(x, div) => {
				x.remove()
				div.appendChild(x)
				return div
			},
			E('div'),
			Array.from(slice(
				find_index(is(this.char_at_point()), line.childNodes),
				line.childNodes.length,
				line.childNodes))),
		line.nextSibling)
	line.appendChild(final_span())
	this.cursor.row += 1
}

TextEditor.prototype.on_key_down = function(e) {
	console.log(e)
	if (e.key === 'Dead') return true
	switch (e.keyCode) {
		case 8:
			this.delete_char_backward()
			break
		case 13:
			this.new_line_at_point()
			break
		case 35:
			this.end_of_line()
			break
		case 36:
			this.start_of_line()
			break
		case 46:
			this.delete_char_forward()
			break
		case 37:
			this.prev_char()
			break
		case 38:
			this.prev_line()
			break
		case 39:
			this.next_char()
			break
		case 40:
			this.next_line()
			break
		case 16:
		case 17:
		case 18:
		case 91:
		case 112:
		case 113:
		case 114:
		case 115:
		case 116:
		case 117:
		case 118:
		case 119:
		case 120:
		case 121:
		case 122:
		case 123:
			return true
		default:
			this.insert_char(e.key)
			break
	}
	return false
}

TextEditor.prototype.end_of_line = function() {
	const cl = this.current_line()
	this.cursor.col = cl.childNodes.length - 1
	this.set_char_at(last(cl.childNodes))
}

TextEditor.prototype.start_of_line = function() {
	const cl = this.current_line()
	this.cursor.col = 0
	this.set_char_at(first(cl.childNodes))
}


function final_span() { return E('span', [['class', 'final']]) }

add_stylesheet(`
.text-editor {
	position: relative;
	font-family: Monospace;
	white-space: pre-line;
}

.text-editor .cursor {
	background: #f05;
	color: #fff;
}

.text-editor .final::before { content: '\\00a0'; }
`.trim())
