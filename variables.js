/**
 * Define one variable per object in the configured watch list.
 *
 *   pst   Houselight 3 -OFF @ Primary Space 1  →  $(paradigm:preset_houselight_3_off_primary_space_1_state)
 *   macro Macro 1                              →  $(paradigm:macro_macro_1_state)
 *   chan  Dimmer 2 @ Primary Space 1           →  $(paradigm:channel_dimmer_2_primary_space_1_level)
 */
module.exports = function (self) {
	const definitions = []
	for (const entry of self.watchEntries) {
		const noun =
			entry.type === 'channel' || entry.type === 'group' ? 'level' : 'state'
		const typeLabel = entry.type.charAt(0).toUpperCase() + entry.type.slice(1)
		definitions.push({
			variableId: entry.variableId,
			name: `${typeLabel} "${entry.label}" ${noun}`,
		})
	}
	self.setVariableDefinitions(definitions)
}
