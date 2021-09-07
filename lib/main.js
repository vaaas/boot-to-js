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

async function open_file(pathname) {
	await require('text-editor')
	buffers[pathname] = await TextEditor(pathname)
	main_elem.appendChild(buffers[pathname])
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
	console.log(target, xs)
	for (const x of xs)
		for (const y of Object.entries(x))
			target[y[0]] = y[1]
	return target
}

async function main() {
	qs('body').appendChild(E('main'))
	self.main_elem = qs('main')
	try { exec(await get_text_file(path_join(home_dir, '.jsrc'))) }
	catch (e) { console.error(e) }
	open_file(path_join(home_dir, '.bashrc'))
}

function add_stylesheet(x) {
	document.head.appendChild(E('style', null, [[x]]))
}

main()
