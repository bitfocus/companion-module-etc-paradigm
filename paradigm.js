
class Paradigm {
	constructor(host) {
		this.host = host
		// this.port = 502
		this.connection = undefined
		// this.controller = {
		// 	info: {},
		// 	panels: [],
		// 	buses: [],
		// }
		// this.buildBuses()
	}

	async init() {
		this.connection = await connect(this.host)
	}

    async connect() {
        const url = `http://${this.host}/get/system`

        let response
        try {
            response = await fetch(url, options)
            if (response.status === 200) {
                const result = await response.json();
                console.log('result:',result);
              } else {
                throw new Error("Something went wrong on API server!");
              }
        } catch (error) {
            console.log(error);
        }
    }

    async getMacros() {
        if (this.connection === undefined) {
            return false
        }

        const url = `http://${this.host}/get/macros`

        let response
        try {
            response = await fetch(url, options)
        } catch (error) {
            console.log(error);
        }
    }

    /**
	 * This is a workaround for a fetch request because Node 18 has a bug and can't
	 * process the headers correctly.
	 * @param  {url} url               The URL to request
	 * @param  {JSON Object} body      The POST Body
	 * @return {string}      The response as a string
	 */
	// makeRequest(url, options = {}) {
	// 	return new Promise((resolve, reject) => {
	// 		const postData = querystring.stringify(body)

	// 		// const options = {
	// 		// 	method,
	// 		// 	headers: {
	// 		// 		'Content-Type': 'application/javascript',
	// 		// 		'Content-Length': Buffer.byteLength(postData)
	// 		// 	},
	// 		// 	insecureHTTPParser: true
	// 		// }

	// 		const req = http.request(url, options, (res) => {
	// 			let data = ''
	// 			res.on('data', (chunk) => {
	// 				data += chunk
	// 			})
	// 			res.on('end', () => {
	// 				resolve(data)
	// 			})
	// 		})

	// 		req.on('error', (error) => {
	// 			reject(error)
	// 		})

	// 		req.write(postData)
	// 		req.end()
	// 	})
	// }

	close() {
		if (this.connection) {
			this.connection.close()
			this.connection = undefined
		}
	}
}


module.exports = Paradigm