type System = {
  guards: any[]
  callback: (...args: unknown[]) => void
}

type Component = unknown
type Entity = Component[]

class ECSRuntime {
  private entities: Entity[] = []
  private systems: System[] = []

  addEntity(entity: Entity) {
    this.entities.push(entity)
    this.checkForChanges(this.systems, [entity])
  }

  addComponentToEntity(entity: Entity, component: Component) {
    if (!this.entities.includes(entity)) throw new Error('Entity not added')
    entity.push(component)
    this.checkForChanges(this.systems, [entity])
  }

  private checkForChanges(systems: System[], entities: Entity[]) {
    for (const entity of entities) {
      checkSystem: for (const system of systems) {
        const matchingSystems = []
        for (const componentClass of system.guards) {
          const componentInstance = entity.find(
            (component) => component instanceof componentClass
          )
          if (componentInstance === undefined) continue checkSystem
          matchingSystems.push(componentInstance)
        }
        system.callback(...matchingSystems)
      }
    }
  }

  addSystem<T1 extends new (...args: any) => any>(
    guards: [T1],
    callback: (instance1: InstanceType<T1>) => void
  ): void
  addSystem<
    T1 extends new (...args: any) => any,
    T2 extends new (...args: any) => any
  >(
    guards: [T1, T2],
    callback: (instance1: InstanceType<T1>, instance2: InstanceType<T2>) => void
  ): void
  addSystem<
    T1 extends new (...args: any) => any,
    T2 extends new (...args: any) => any,
    T3 extends new (...args: any) => any
  >(
    guards: [T1, T2, T3],
    callback: (
      instance1: InstanceType<T1>,
      instance2: InstanceType<T2>,
      instance3: InstanceType<T3>
    ) => void
  ): void
  addSystem<
    T1 extends new (...args: any) => any,
    T2 extends new (...args: any) => any,
    T3 extends new (...args: any) => any,
    T4 extends new (...args: any) => any
  >(
    guards: [T1, T2, T3, T4],
    callback: (
      instance1: InstanceType<T1>,
      instance2: InstanceType<T2>,
      instance3: InstanceType<T3>,
      instance4: InstanceType<T4>
    ) => void
  ): void
  addSystem<
    T1 extends new (...args: any) => any,
    T2 extends new (...args: any) => any,
    T3 extends new (...args: any) => any,
    T4 extends new (...args: any) => any,
    T5 extends new (...args: any) => any
  >(
    guards: [T1, T2, T3, T4, T5],
    callback: (
      instance1: InstanceType<T1>,
      instance2: InstanceType<T2>,
      instance3: InstanceType<T3>,
      instance4: InstanceType<T4>,
      instance5: InstanceType<T5>
    ) => void
  ): void
  addSystem<
    T1 extends new (...args: any) => any,
    T2 extends new (...args: any) => any,
    T3 extends new (...args: any) => any,
    T4 extends new (...args: any) => any,
    T5 extends new (...args: any) => any,
    T6 extends new (...args: any) => any
  >(
    guards: [T1, T2, T3, T4, T5, T6],
    callback: (
      instance1: InstanceType<T1>,
      instance2: InstanceType<T2>,
      instance3: InstanceType<T3>,
      instance4: InstanceType<T4>,
      instance5: InstanceType<T5>,
      instance6: InstanceType<T6>
    ) => void
  ): void
  addSystem(guards, callback) {
    this.systems.push({ guards, callback })
  }
}

export const createRuntime = () => {
  return new ECSRuntime()
}
