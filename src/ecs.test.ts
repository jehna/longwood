import { Component, createRuntime, createEntity } from './ecs'

describe('Entity component system', () => {
  it('should create a runtime', () => {
    const runtime = createRuntime()
    expect(runtime).not.toBeNull()
  })

  it('should allow runtime to add entities', () => {
    const runtime = createRuntime()
    const component: Component = { type: 'my-component' }
    runtime.addEntity(createEntity(component))
  })

  it('allows adding systems', () => {
    const runtime = createRuntime()
    const component = { type: 'myComponent' } as const
    const spy = jest.fn()
    runtime.addSystem<typeof component>([component.type], ({ myComponent }) => {
      expect(myComponent).toEqual(component)
      spy()
    })
    runtime.addEntity(createEntity(component))
    expect(spy).toBeCalled()
  })

  it('allows adding systems with multiple listeners', () => {
    const runtime = createRuntime()
    const component1 = { type: 'myComponent1' } as const
    const component2 = { type: 'myComponent2' } as const
    const spy = jest.fn()
    runtime.addSystem(
      [component1.type, component2.type],
      ({ myComponent1, myComponent2 }) => {
        expect(myComponent1).toEqual(component1)
        expect(myComponent2).toEqual(component2)
        spy()
      }
    )
    runtime.addEntity(createEntity(component1, component2))
    expect(spy).toBeCalled()
  })

  it('should match partial matches if entity has more components', () => {
    const runtime = createRuntime()
    const component1 = { type: 'myComponent1' } as const
    const component2 = { type: 'myComponent2' } as const
    const spy = jest.fn()
    runtime.addSystem([component1.type], spy)
    runtime.addEntity(createEntity(component1, component2))
    expect(spy).toBeCalled()
  })

  it('should not match partial matches if entity has less components', () => {
    const runtime = createRuntime()
    const component1 = { type: 'myComponent1' } as const
    const component2 = { type: 'myComponent2' } as const
    const spy = jest.fn()
    runtime.addSystem([component1.type, component2.type], spy)
    runtime.addEntity(createEntity(component1))
    expect(spy).not.toBeCalled()
  })

  it('should match if user adds more components to entity', () => {
    const runtime = createRuntime()
    const component1 = { type: 'myComponent1' } as const
    const component2 = { type: 'myComponent2' } as const
    const spy = jest.fn()
    runtime.addSystem([component1.type, component2.type], spy)
    const entity = createEntity(component1)
    runtime.addEntity(entity)
    expect(spy).not.toBeCalled()
    runtime.addComponentToEntity(entity, component2)
    expect(spy).toBeCalled()
  })

  it('should support removing entities', () => {
    const runtime = createRuntime()
    const component1 = { type: 'myComponent1' } as const
    const spy = jest.fn()
    const entity = createEntity(component1)
    runtime.addEntity(entity)
    runtime.removeEntity(entity)
    runtime.addSystem([component1.type], spy)
    expect(spy).not.toBeCalled()
  })

  it('should support singleton entities', () => {
    const runtime = createRuntime()
    const component1 = { type: 'myComponent1' } as const
    const singletonComponent1 = { type: 'myComponent2' } as const
    const spy = jest.fn()
    const entity = createEntity(component1)
    const singletonEntity = runtime.getSingletonEntity()
    runtime.addEntity(entity)
    runtime.addComponentToEntity(singletonEntity, singletonComponent1)
    runtime.addSystem([component1.type, singletonComponent1.type], spy)
    expect(spy).toBeCalled()
  })

  it('should support removing components from entities', () => {
    const runtime = createRuntime()
    const component1 = { type: 'myComponent1' } as const
    const spy = jest.fn()
    const entity = createEntity(component1)
    runtime.addEntity(entity)
    runtime.removeComponentFromEntity(entity, component1)
    runtime.addSystem([component1.type], spy)
    expect(spy).not.toBeCalled()
  })

  it('should only run once for the singletons if the selector only matches the singleton', () => {
    const runtime = createRuntime()
    const component1 = { type: 'myComponent1' } as const
    const singletonComponent1 = { type: 'myComponent2' } as const
    const spy = jest.fn()
    const entity1 = createEntity(component1)
    const entity2 = createEntity(component1)
    runtime.addComponentToEntity(
      runtime.getSingletonEntity(),
      singletonComponent1
    )
    runtime.addEntity(entity1)
    runtime.addEntity(entity2)
    runtime.addSystem([singletonComponent1.type], spy)
    expect(spy).toBeCalledTimes(1)
  })

  it('should check for mutlisystems', () => {
    const runtime = createRuntime()
    const component1 = { type: 'myComponent1' } as const
    const spy = jest.fn()
    const entity1 = createEntity(component1)
    const entity2 = createEntity(component1)
    runtime.addEntity(entity1)
    runtime.addEntity(entity2)
    runtime.addMultiSystem([component1.type], (entities) => {
      expect(entities).toHaveLength(2)
      for (const entity of entities) {
        expect(entity.myComponent1).toEqual(component1)
      }
      spy()
    })
    expect(spy).toBeCalled()
  })

  it('should allow firing events', () => {
    const runtime = createRuntime()
    const eventName = 'myEvent'
    const spy = jest.fn()
    runtime.addSystem([eventName], spy)
    runtime.fireEvent(eventName)
    expect(spy).toBeCalled()
  })

  it('should allow side effects from events', () => {
    const runtime = createRuntime()
    const eventName = 'myEvent'
    const spy = jest.fn()
    runtime.addSystem([eventName], () => {
      runtime.addEntity(createEntity())
      spy()
    })
    runtime.fireEvent(eventName)
    expect(spy).toBeCalledTimes(1)
  })
})
