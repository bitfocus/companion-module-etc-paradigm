
class Paradigm {
	constructor(host) {
		this.host = host
		// this.port = 502
		this.connection = undefined
		this.system = {}
		this.macros = []
		this.walls = []
        this.spaces = []
        this.overrides = []
        this.channels = []
        this.sequences = []
        this.url = `http://${this.host}/get/`
		// this.buildBuses()
	}

    async getInfo(info) {
        const url = this.url + info
        const options = {}
        let response

        try {
            response = await fetch(url, options)
            if (response.status === 200) {
                const result = await response.text();
                const filtered = result.replace(/,(?=[\]}])/g, '')
                this[info] = JSON.parse(filtered)
              } else {
                throw new Error("Something went wrong on API server!");
              }
        } catch (error) {
            console.log(error);
        }
    }

    async connect() {
        // get system info
        try {
            await this.getInfo('system')
            await this.getInfo('walls')
            await this.getInfo('macros')
            await this.getInfo('spaces')
            await this.getInfo('overrides')
            await this.getInfo('channels')
            await this.getInfo('sequences')

        // this.connection =
        } catch(error) {
            console.log(error);
        }
        
        console.log(this)
        return this
    }

	async init() {
		this.connection = await this.connect(this.host)
	}

	close() {
		if (this.connection) {
			this.connection.close()
			this.connection = undefined
		}
	}
}


module.exports = Paradigm