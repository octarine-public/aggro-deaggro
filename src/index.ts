import {
	Entity,
	EventsSDK,
	Hero,
	Input,
	LocalPlayer,
	Sleeper,
	Tower,
	Unit
} from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "./menu"

const bootstrap = new (class CAggroDeaggro {
	private readonly units: Unit[] = []
	private readonly sleeper = new Sleeper()
	private readonly menu = new MenuManager(this.sleeper)

	constructor() {
		this.menu.AggroKey.OnPressed(() => this.pressedAggro())
		this.menu.DeaggroKey.OnPressed(() => this.pressedDeaggro())
	}

	public AttackStarted(unit: Unit) {
		if (!this.menu.State.value || !this.menu.AutoTowerState.value) {
			return
		}
		const hero = this.getLocalHero()
		if (hero === undefined) {
			return
		}
		if (!(unit instanceof Tower) || !unit.IsEnemy() || !unit.IsAlive) {
			return
		}
		if (hero !== unit.Target || !unit.CanAttack(hero)) {
			return
		}
		const target = this.units
			.filter(x => !x.IsEnemy() && hero.CanAttack(x, true, true, 1200))
			.orderBy(x => hero.GetAngle(x))[0]

		if (target === undefined || hero.Distance(unit) < target.Distance(unit)) {
			return
		}

		hero.AttackTarget(target)
		hero.AttackMove(Input.CursorOnWorld)
	}

	public EntityCreated(entity: Entity) {
		if (!(entity instanceof Unit)) {
			return
		}
		if (entity.IsCreep || entity.IsHero || entity.IsSpiritBear) {
			this.units.push(entity)
		}
	}

	public EntityDestroyed(entity: Entity) {
		if (!(entity instanceof Unit)) {
			return
		}
		if (entity.IsCreep || entity.IsHero || entity.IsSpiritBear) {
			this.units.remove(entity)
		}
	}

	public GameChanged() {
		this.sleeper.FullReset()
	}

	private pressedAggro() {
		if (!this.menu.State.value) {
			return
		}
		const hero = this.getLocalHero()
		if (hero === undefined) {
			return
		}
		const target = this.units
			.filter(
				x =>
					x.IsEnemy() &&
					(x.IsHero || x.IsSpiritBear) &&
					hero.CanAttack(x, true, true, 2 ** 32)
			)
			.orderBy(x => hero.GetAngle(x))[0]

		if (target !== undefined) {
			this.attack(hero, target)
		}
	}

	private pressedDeaggro() {
		if (!this.menu.State.value) {
			return
		}
		if (!this.menu.State.value) {
			return
		}
		const hero = this.getLocalHero()
		if (hero === undefined || hero.IsInvulnerable) {
			return
		}

		const target = this.units
			.filter(x => !x.IsEnemy() && x.IsCreep && hero.CanAttack(x))
			.orderBy(x => hero.GetAngle(x))[0]

		if (target !== undefined) {
			this.attack(hero, target)
		}
	}

	private getLocalHero(): Nullable<Hero> {
		const hero = LocalPlayer?.Hero
		if (hero === undefined || !hero.IsAlive || hero.IsCharge) {
			return
		}
		if (hero.IsInvulnerable || hero.IsCharge) {
			return
		}
		return hero
	}

	private attack(hero: Hero, target: Unit) {
		hero.AttackTarget(target)
		if (this.menu.MoveToMousePosition.value) {
			hero.MoveTo(Input.CursorOnWorld)
		}
		hero.OrderStop()
	}
})()

EventsSDK.on("GameEnded", () => bootstrap.GameChanged())

EventsSDK.on("GameStarted", () => bootstrap.GameChanged())

EventsSDK.on("AttackStarted", unit => bootstrap.AttackStarted(unit))

EventsSDK.on("EntityCreated", entity => bootstrap.EntityCreated(entity))

EventsSDK.on("EntityDestroyed", entity => bootstrap.EntityDestroyed(entity))
