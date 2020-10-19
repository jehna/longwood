type System = {
  guards: ComponentType[]
  callback: (entity: Entity) => void
}

type MultiSystem = {
  guards: ComponentType[]
  callback: (entity: Entity[]) => void
}

const entitySymbol = Symbol('ecs-entity')
type ComponentType = string | symbol
export type Component = { type: ComponentType; [key: string]: any }
export type Entity = { type: typeof entitySymbol }

export const createEntity = (...components: Component[]) =>
  components.reduce<Entity>(
    (entity, component) => ({ ...entity, [component.type]: component }),
    { type: entitySymbol }
  )

export class ECSRuntime {
  private entities: readonly Entity[] = []
  private systems: readonly System[] = []
  private multiSystems: readonly MultiSystem[] = []
  private singletonEntity = createEntity()
  private singletonProxy = Object.setPrototypeOf({}, this.singletonEntity)

  addEntity(entity: Entity) {
    this.entities = this.entities.concat(
      Object.setPrototypeOf(entity, this.singletonProxy)
    )
    this.checkForChanges(this.systems, [entity])
  }

  addComponentToEntity(entity: Entity, component: Component) {
    if (entity === this.singletonEntity)
      return this.addComponentToSingletonEntity(component)
    if (!this.entities.includes(entity)) throw new Error('Entity not added')
    const newEntity = Object.setPrototypeOf(
      { ...entity, [component.type]: component },
      this.singletonProxy
    )
    this.entities = this.entities.filter((e) => e !== entity).concat(newEntity)
    this.checkForChanges(this.systems, [newEntity])
    return newEntity
  }

  private addComponentToSingletonEntity(component: Component) {
    this.singletonEntity = {
      ...this.singletonEntity,
      [component.type]: component
    }
    Object.setPrototypeOf(this.singletonProxy, this.singletonEntity)
    this.checkForChanges(
      this.systems,
      this.entities.concat(this.singletonEntity)
    )
    return this.singletonEntity
  }

  removeComponentFromEntity(entity: Entity, component: Component) {
    if (entity === this.singletonEntity)
      return this.removeComponentFromSingletonEntity(component)
    if (!this.entities.includes(entity)) throw new Error('Entity not added')
    const newEntity = { ...entity } as any
    delete newEntity[component.type]
    this.entities = this.entities.filter((e) => e !== entity).concat(newEntity)
    this.checkForChanges(this.systems, [newEntity])
    return newEntity
  }

  private removeComponentFromSingletonEntity(component: Component) {
    const newEntity = { ...this.singletonEntity } as any
    delete newEntity[component.type]
    this.singletonEntity = newEntity
    Object.setPrototypeOf(this.singletonProxy, this.singletonEntity)
    this.checkForChanges(this.systems, this.entities)
    return this.singletonEntity
  }

  removeEntity(entity: Entity) {
    if (!this.entities.includes(entity)) throw new Error('Entity not added')
    this.entities = this.entities.filter((e) => e !== entity)
    this.checkForChanges([], [])
  }

  getSingletonEntity() {
    return this.singletonEntity
  }

  private checkForChanges(
    systems: readonly System[],
    entities: readonly Entity[]
  ) {
    for (const system of systems) {
      checkEntity: for (const entity of entities) {
        let hasOwnProperty = false
        for (const guard of system.guards) {
          if (!(guard in entity)) continue checkEntity
          if (Object.prototype.hasOwnProperty.call(entity, guard))
            hasOwnProperty = true
        }
        if (!hasOwnProperty) continue
        system.callback(entity)
      }
    }
    for (const system of this.multiSystems) {
      const entities = this.entities
        .concat(this.singletonEntity)
        .filter((entity) => {
          let hasOwnProperty = false
          for (const guard of system.guards) {
            if (!(guard in entity)) return false
            if (Object.prototype.hasOwnProperty.call(entity, guard))
              hasOwnProperty = true
          }
          return hasOwnProperty
        })
      system.callback(entities)
    }
  }

  addSystem<T1 extends Component>(
    guards: [T1['type']],
    callback: (instance1: Entity & Record<T1['type'], T1>) => void
  ): void
  addSystem<T1 extends Component, T2 extends Component>(
    guards: [T1['type'], T2['type']],
    callback: (
      instance1: Entity & Record<T1['type'], T1> & Record<T2['type'], T2>
    ) => void
  ): void
  addSystem<T1 extends Component, T2 extends Component, T3 extends Component>(
    guards: [T1['type'], T2['type'], T3['type']],
    callback: (
      instance1: Entity &
        Record<T1['type'], T1> &
        Record<T2['type'], T2> &
        Record<T3['type'], T3>
    ) => void
  ): void
  addSystem(guards: System['guards'], callback: System['callback']) {
    const system = { guards, callback }
    this.systems = this.systems.concat(system)
    this.checkForChanges([system], this.entities.concat(this.singletonEntity))
  }

  addMultiSystem<T1 extends Component>(
    guards: [T1['type']],
    callback: (instance1: (Entity & Record<T1['type'], T1>)[]) => void
  ): void
  addMultiSystem<T1 extends Component, T2 extends Component>(
    guards: [T1['type'], T2['type']],
    callback: (
      instance1: (Entity & Record<T1['type'], T1> & Record<T2['type'], T2>)[]
    ) => void
  ): void
  addMultiSystem<
    T1 extends Component,
    T2 extends Component,
    T3 extends Component
  >(
    guards: [T1['type'], T2['type'], T3['type']],
    callback: (
      instance1: (Entity &
        Record<T1['type'], T1> &
        Record<T2['type'], T2> &
        Record<T3['type'], T3>)[]
    ) => void
  ): void
  addMultiSystem(
    guards: MultiSystem['guards'],
    callback: MultiSystem['callback']
  ) {
    const system = { guards, callback }
    this.multiSystems = this.multiSystems.concat(system)
    this.checkForChanges([], [])
  }

  fireEvent(event: ComponentType) {
    const component = { type: event }
    this.addComponentToEntity(this.getSingletonEntity(), component)
    this.removeComponentFromEntity(this.getSingletonEntity(), component)
  }
}

export const createRuntime = () => {
  return new ECSRuntime()
}
