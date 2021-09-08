async function reject_bad_status(x) {
	 if (x.status >= 400)
		 throw new Error(await x.text())
	 else return x
}

self.get = url => fetch(url).then(reject_bad_status)
self.post = (url, body) => fetch(url, { method: 'POST', body }).then(reject_bad_status)
self.put = (url, body) => fetch(url, { method: 'PUT', body }).then(reject_bad_status)
self.fetch_text = x => x.text()

self.qs = (x, d=document) => d.querySelector(x)
self.qss = (x, d=document) => d.querySelectorAll(x)

self.remote = (f, then=fetch_text, wait=false) => (...xs) =>
	post('/', `(${wait ? "await " : ""}${f.toString()})(${xs.map(JSON.stringify).join(',')})`)
	.then(then)

self.write_file = (pathname, data) => put(pathname, data)

self.get_text_file = x => get(x).then(fetch_text)

self.path_join = (...xs) => xs.join('/')

self.buffers = {}
self.active_buffer = null

self.first = x => x[0]
self.second = x => x[1]
self.last = x => x[x.length-1]

async function open_file(pathname) {
	await require('text-editor')
	add_buffer(pathname, await TextEditor(pathname))
	switch_to_buffer(pathname)
}

function add_buffer(name, buffer) {
	buffers[name] = buffer
	main_elem.appendChild(buffer)
}

function switch_to_buffer(x) {
	const buffer = buffers[x]
	if (buffer === undefined)
		throw 'no such buffer: ' + x
	if (self.active_buffer)
		self.active_buffer.classList.remove('active')
	self.active_buffer = buffer
	self.active_buffer.classList.add('active')
}

self.required = {}
async function require(x) {
	if (x in required) return
	exec(await get_text_file(path_join(app_dir, 'lib', x + '.js')))
	required[x] = true
}

function E(tagname, attrs=null, children=null) {
	const elem = document.createElement(tagname)
	if (attrs)
		for (const x of attrs)
			switch (x[0]) {
				case 'class':
					elem.className = x[1]
					break
				default:
					elem[x[0]] = x[1]
					break
			}
	if (children)
		for (const x of children)
			elem.appendChild(x instanceof Node ? x : document.createTextNode(''+x))
	return elem
}

function extend(target, ...xs) {
	for (const x of xs)
		for (const y of Object.entries(x))
			target[y[0]] = y[1]
	return target
}

function on_key_down(e) { this.active_buffer.on_key_down(e) }

async function main() {
	qs('body').appendChild(E('main'))
	self.main_elem = qs('main')
	try { exec(await get_text_file(path_join(home_dir, '.jsrc'))) }
	catch (e) { console.error(e) }
	open_file(path_join(home_dir, '.bashrc'))
	window.onkeydown = on_key_down
	add_stylesheet(`
		main > section { display: none; }
		main > section.active { display: initial; }
	`)
}

function add_stylesheet(x) {
	document.head.appendChild(E('style', null, [[x]]))
}

main()
