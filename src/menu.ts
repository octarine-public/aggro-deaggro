import { ImageData, Menu } from "github.com/octarine-public/wrapper/index"

export class MenuManager {
	public readonly State: Menu.Toggle
	public readonly AggroKey: Menu.KeyBind
	public readonly DeaggroKey: Menu.KeyBind
	public readonly AutoTowerState: Menu.Toggle
	public readonly MoveToMousePosition: Menu.Toggle

	private readonly iconNode = ImageData.Icons.magic_resist

	private readonly utility = Menu.AddEntry("Utility")
	private readonly baseNode = this.utility.AddNode("Aggro/deaggro", this.iconNode)

	constructor() {
		this.State = this.baseNode.AddToggle("State", true)
		this.AggroKey = this.baseNode.AddKeybind("Aggro Key")
		this.DeaggroKey = this.baseNode.AddKeybind("Deaggro Key")
		this.AutoTowerState = this.baseNode.AddToggle("Auto tower deaggro", true)
		this.MoveToMousePosition = this.baseNode.AddToggle(
			"Move to mouse position",
			true,
			"Move to mouse position after aggro/deaggro"
		)
	}
}
