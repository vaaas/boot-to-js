'use strict'
const exec = eval.bind(self)
window.onload = async function() {
	const response = await fetch([app_dir, 'lib', 'main.js'].join('/'))
	if (response.status >= 200 && response.status < 300)
		exec(await response.text())
	else
		throw (await response.text())
}
