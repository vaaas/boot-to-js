const http = require('http')
const fs = require('fs')
const path = require('path')
const child_process = require('child_process')

const HOME = x => path.join(process.env.HOME, x)

let http_server = null
let http_port = 1337
let http_host = '0.0.0.0'

function main() {
	try { eval(fs.readFileSync(HOME('.jsrc')).toString()) }
	catch(e) { console.error(e) }
	http_server = http.createServer(on_http_request)
	http_server.listen(http_port, http_host)
}

function on_http_request(request, socket) {
	request.url = parse_url(request)
	route(request).catch(error_response).then(serve(socket))
}

const parse_url = req => decodeURIComponent(req.url)

function route(req) {
	switch (req.method) {
		case 'GET':
			switch (req.url) {
				case '/': return serve_frontpage()
				default: return serve_file(req.url)
			}
		case 'POST':
			switch (req.url) {
				case '/': return eval_command(req)
				default: return Promise.resolve(not_found())
			}
		case 'PUT':
			return write_file(req)
	}
}

const write_file = req => new Promise((yes, no) => {
	const stream = fs.createWriteStream(req.url)
	stream.on('error', no)
	req.on('end', () => yes({
		status: 200,
		headers: { 'Content-Type': 'text/plain' },
		data: 'OK',
	}))
	req.pipe(stream)
})

const serve_file = async (pathname) => ({
	status: 200,
	headers: { 'Content-Type': 'text/html' },
	data: await fs.promises.readFile(pathname),
})

async function serve_frontpage() {
	const data = '<!DOCTYPE html>' + serialise_html(
		['html', null, [
			['head', null, [
				['meta', [['charset', 'utf-8']]],
				['title', null, 'Boot to JS'],
				['script', null, 'console.log("YO HO HO")'],
			]
		]]])
	return {
		status: 200,
		headers: { 'Content-Type': 'text/html' },
		data,
	}
}

function error_response(e) {
	console.log(e)
	return {
		status: 500,
		headers: { 'Content-Type': 'text/plain' },
		data: e.message,
	}
}

const not_found = {
	status: 404,
	headers: { 'Content-Type': 'text/plain' },
	data: 'File not found',
}

const read_post_data = req => new Promise(yes => {
	const xs = []
	req.on('data', x => xs.push(x))
	req.on('end', x => yes(Buffer.concat(xs)))
})

const eval_command = req => read_post_data(req).then(x => ({
	status: 200,
	headers: { 'Content-Type': 'application/octet-stream' },
	data: eval(x.toString()),
}))

const serve = socket => response => {
	socket.writeHead(response.status, response.headers)
	socket.end(response.data)
}

function serialise_html(node) {
	const tokens = ['<', node[0]]
	if (node[1])
		tokens.push(' ', serialise_html_attributes(node[1]))
	if (node[2]) {
		tokens.push('>')
		for (const x of node[2])
			if (Array.isArray(x))
				tokens.push(serialise_html(x))
			else
				tokens.push(''+x)
		tokens.push('</', node[0], '>')
	} else tokens.push('/>')
	return tokens.join('')
}

function serialise_html_attributes(attrs) {
	const tokens = []
	for (const [k, v] of attrs)
		tokens.push(k + '=' + v)
	return tokens.join(' ')
}

main()
