import {
	Entity,
	EventsSDK,
	Hero,
	Input,
	LocalPlayer,
	Unit
} from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "./menu"

new (class CAggroDeaggro {
	private readonly units: Unit[] = []
	private readonly menu = new MenuManager()

	constructor() {
		this.menu.AggroKey.OnPressed(() => this.pressedAggro())
		this.menu.DeaggroKey.OnPressed(() => this.pressedDeaggro())

		EventsSDK.on("AttackStarted", this.AttackStarted.bind(this))
		EventsSDK.on("EntityCreated", this.EntityCreated.bind(this))
		EventsSDK.on("EntityDestroyed", this.EntityDestroyed.bind(this))
	}

	protected AttackStarted(unit: Unit, _castPoint: number, _names: string[]) {
		if (!this.menu.State.value || !this.menu.AutoTowerState.value) {
			return
		}
		const hero = this.getLocalHero()
		if (hero === undefined) {
			return
		}
		if (!unit.IsTower || !unit.IsEnemy() || !unit.IsAlive) {
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

		if (this.menu.MoveToMousePosition.value) {
			hero.AttackMove(Input.CursorOnWorld)
		}
	}

	protected EntityCreated(entity: Entity) {
		if (!(entity instanceof Unit)) {
			return
		}
		if (entity.IsCreep || entity.IsHero || entity.IsSpiritBear) {
			this.units.push(entity)
		}
	}

	protected EntityDestroyed(entity: Entity) {
		if (!(entity instanceof Unit)) {
			return
		}
		if (entity.IsCreep || entity.IsHero || entity.IsSpiritBear) {
			this.units.remove(entity)
		}
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
		if (hero === undefined || !hero.IsAlive) {
			return
		}
		if (hero.IsInvulnerable || hero.IsChargeOfDarkness) {
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
