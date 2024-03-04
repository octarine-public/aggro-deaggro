import {
	ImageData,
	Menu,
	NotificationsSDK,
	ResetSettingsUpdated,
	Sleeper
} from "github.com/octarine-public/wrapper/index"

export class MenuManager {
	public readonly State: Menu.Toggle
	public readonly AggroKey: Menu.KeyBind
	public readonly DeaggroKey: Menu.KeyBind
	public readonly AutoTowerState: Menu.Toggle
	public readonly MoveToMousePosition: Menu.Toggle

	private readonly iconNode = ImageData.Paths.Icons.magic_resist

	private readonly utility = Menu.AddEntry("Utility")
	private readonly baseNode = this.utility.AddNode("Aggro/deaggro", this.iconNode)

	constructor(private readonly sleeper: Sleeper) {
		this.State = this.baseNode.AddToggle("State", true)

		this.AggroKey = this.baseNode.AddKeybind("Aggro Key")
		this.DeaggroKey = this.baseNode.AddKeybind("Deaggro Key")
		this.AutoTowerState = this.baseNode.AddToggle("Auto tower deaggro", true)
		this.MoveToMousePosition = this.baseNode.AddToggle(
			"Move to mouse position",
			true,
			"Move to mouse position after aggro/deaggro"
		)

		this.baseNode
			.AddButton("Reset settings", "Reset settings to default")
			.OnValue(() => this.ResetSettings())
	}

	public ResetSettings() {
		if (!this.sleeper.Sleeping("ResetSettings")) {
			this.State.value = this.State.defaultValue
			this.AggroKey.assignedKey = -1
			this.DeaggroKey.assignedKey = -1

			this.AggroKey.assignedKeyStr = "None"
			this.DeaggroKey.assignedKeyStr = "None"

			this.AggroKey.Update()
			this.DeaggroKey.Update()

			this.AutoTowerState.value = this.AutoTowerState.defaultValue
			this.MoveToMousePosition.value = this.MoveToMousePosition.defaultValue

			this.baseNode.Update()
			this.sleeper.Sleep(2 * 1000, "ResetSettings")
			NotificationsSDK.Push(new ResetSettingsUpdated())
		}
	}
}
