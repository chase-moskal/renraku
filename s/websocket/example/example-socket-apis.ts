
import {renrakuApi, renrakuService} from "../../service-and-api.js"
import {RenrakuConnectionControls, RenrakuRemote} from "../../types.js"

export const clientsideApi = renrakuApi({
	clientService: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			async getClientTime() {
				return Date.now()
			},
		})),
})

export const makeServersideApi = (
		controls: RenrakuConnectionControls,
		clientside: RenrakuRemote<typeof clientsideApi>
	) => (
	renrakuApi({
		serverService: renrakuService()
			.policy(async() => {})
			.expose(() => ({
				async getServerTime() {
					return Date.now()
				},
				async promptToAskBack() {
					return clientside.clientService.getClientTime()
				},
			})),
	})
)
