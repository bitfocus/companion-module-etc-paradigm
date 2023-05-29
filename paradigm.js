
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
        this.features = ['system', 'macros', 'presets', 'sequences', 'channels', 'walls', 'overrides', 'spaces']
        this.featuresList = ['macros', 'presets', 'sequences', 'channels', 'walls', 'overrides']
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
            throw error
        }
    }

    async connect() {
        // get system info
        try {
            
            const allFeatures = this.features.map(feature => this.getInfo(feature))
            await Promise.all(allFeatures)
            // order all the items
            this.featuresList.forEach(each => {
                this[each].sort((a, b) => a.id - b.id)
            })
            console.log(this)
            return this

        // this.connection =
        } catch(error) {
            console.log(error);
            return undefined
        }
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