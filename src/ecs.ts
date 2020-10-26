type GuardType<T> = T extends (v: any) => v is infer R ? R : never
type Architype = { [key: string]: (v: any) => v is any }

const entitySymbol = Symbol('ecs-entity')
export type Component = unknown
export type Entity = {
  type: typeof entitySymbol
  id: number
  components: Component[]
}

export const instanceOf = <T extends new (...args: any) => any>(
  classType: T
) => (value: any): value is InstanceType<T> => value instanceof classType

type ArchitypeImpl = { entityId: number; data: { [key: string]: unknown } }

const entityMatches = (
  entity: Entity,
  architype: Architype,
  singletonEntity: Entity
): ArchitypeImpl | null => {
  const impl: ArchitypeImpl = { entityId: entity.id, data: {} }
  let hasOwnComponent = false
  for (const [key, guard] of Object.entries(architype)) {
    const ownComponent = entity.components.find(guard)
    const singletonComponent = singletonEntity.components.find(guard)
    if (ownComponent) {
      impl.data[key] = ownComponent
      hasOwnComponent = true
    } else if (singletonComponent) {
      impl.data[key] = singletonComponent
    } else return null
  }

  return hasOwnComponent ? impl : null
}

const entitiesMatching = (
  entities: readonly Entity[],
  architype: Architype,
  singletonEntity: Entity
): ArchitypeImpl[] => {
  const singletonImpl = entityMatches(
    singletonEntity,
    architype,
    singletonEntity
  )
  if (singletonImpl !== null) return [singletonImpl]

  return entities
    .map((entity) => entityMatches(entity, architype, singletonEntity))
    .filter((impl): impl is ArchitypeImpl => impl !== null)
}

type System = {
  architype: Architype
  iterator: any
  matching: ArchitypeImpl[]
}

export class ECSRuntime {
  private entities: readonly Entity[] = []
  private systems: System[] = []
  private multiSystems: System[] = []
  private _nextEntityId: number = 0
  private singletonEntity = this.createEntity()

  private nextEntityId() {
    return this._nextEntityId++
  }
  private createEntity(...components: Component[]): Entity {
    return {
      type: entitySymbol,
      id: this.nextEntityId(),
      components
    }
  }

  addEntity(...components: Component[]): Entity {
    const entity = this.createEntity(...components)
    this.entities = this.entities.concat(entity)
    for (const system of this.systems) {
      const impl = entityMatches(entity, system.architype, this.singletonEntity)
      if (impl === null || impl.entityId === this.singletonEntity.id) continue

      system.matching.push(impl)
      system.iterator(impl.data)
    }

    for (const multiSystem of this.multiSystems) {
      const newMatching = entitiesMatching(
        this.entities,
        multiSystem.architype,
        this.singletonEntity
      )
      if (!newMatching.some((match) => match.entityId === entity.id)) continue

      multiSystem.matching = newMatching
      multiSystem.iterator(multiSystem.matching.map((match) => match.data))
    }

    return entity
  }

  addSystem<A extends Architype>(
    architype: A,
    iterator: (props: { [key in keyof A]: GuardType<A[key]> }) => void
  ) {
    const system: System = {
      architype,
      iterator,
      matching: entitiesMatching(this.entities, architype, this.singletonEntity)
    }
    this.systems.push(system)
    system.matching.forEach((match) => system.iterator(match.data))
  }

  addMultiSystem<A extends Architype>(
    architype: A,
    iterator: (props: { [key in keyof A]: GuardType<A[key]> }[]) => void
  ) {
    const system: System = {
      architype,
      iterator,
      matching: entitiesMatching(this.entities, architype, this.singletonEntity)
    }
    this.multiSystems.push(system)
    system.iterator(system.matching.map((m) => m.data))
  }

  addComponentToEntity(entity: Entity, component: Component) {
    if (!this.entities.includes(entity) && entity !== this.singletonEntity)
      throw new Error('Entity not added to runtime')
    entity.components = entity.components.concat(component)

    for (const system of this.systems) {
      const impl = entityMatches(entity, system.architype, this.singletonEntity)
      if (impl === null) continue

      system.matching.push(impl)
      system.iterator(impl.data)
    }

    for (const multiSystem of this.multiSystems) {
      const newMatching = entitiesMatching(
        this.entities,
        multiSystem.architype,
        this.singletonEntity
      )
      if (
        entity.id !== this.singletonEntity.id &&
        !newMatching.some((match) => match.entityId === entity.id)
      )
        continue

      multiSystem.matching = newMatching
      multiSystem.iterator(multiSystem.matching.map((match) => match.data))
    }
  }

  removeEntity(entity: Entity) {
    if (!this.entities.includes(entity)) throw new Error('Entity not added')
    this.entities = this.entities.filter((e) => e !== entity)
    for (const system of this.systems) {
      if (system.matching.some((match) => match.entityId === entity.id)) {
        system.matching = entitiesMatching(
          this.entities,
          system.architype,
          this.singletonEntity
        )
      }
    }
  }
  /*
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


  private removeComponentFromSingletonEntity(component: Component) {
    const newEntity = { ...this.singletonEntity } as any
    delete newEntity[component.type]
    this.singletonEntity = newEntity
    Object.setPrototypeOf(this.singletonProxy, this.singletonEntity)
    this.checkForChanges(this.systems, this.entities)
    return this.singletonEntity
  }*/

  removeComponentFromEntity(entity: Entity, component: Component) {
    if (!this.entities.includes(entity) && entity !== this.singletonEntity)
      throw new Error('Entity not added')
    if (!entity.components.includes(component))
      throw new Error('Component not added to entity')

    entity.components = entity.components.filter((c) => c !== component)
    for (const system of this.systems) {
      if (system.matching.some((match) => match.entityId === entity.id)) {
        system.matching = entitiesMatching(
          this.entities,
          system.architype,
          this.singletonEntity
        )
      }
    }
  }

  addComponentToSingletonEntity(component: Component) {
    this.addComponentToEntity(this.singletonEntity, component)
  }

  fireEvent(event: Component) {
    this.addComponentToSingletonEntity(event)
    this.removeComponentFromEntity(this.singletonEntity, event)
  }
}

export const createRuntime = () => {
  return new ECSRuntime()
}
