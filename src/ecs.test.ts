import { createRuntime, instanceOf } from './ecs'

describe('Entity component system', () => {
  it('should create a runtime', () => {
    const runtime = createRuntime()
    expect(runtime).not.toBeNull()
  })

  it('should allow runtime to add entities', () => {
    const runtime = createRuntime()
    const component = { type: 'my-component' }
    runtime.addEntity(component)
  })

  it('allows adding systems', () => {
    const runtime = createRuntime()
    class MyComponent {}
    const component = new MyComponent()
    const spy = jest.fn()
    runtime.addSystem(
      { myComponent: instanceOf(MyComponent) },
      ({ myComponent }) => {
        expect(myComponent).toEqual(component)
        spy()
      }
    )
    runtime.addEntity(component)
    expect(spy).toBeCalled()
  })

  it('allows adding systems with multiple listeners', () => {
    const runtime = createRuntime()
    class MyComponent1 {}
    class MyComponent2 {}
    const component1 = new MyComponent1()
    const component2 = new MyComponent2()
    const spy = jest.fn()
    runtime.addSystem(
      {
        myComponent1: instanceOf(MyComponent1),
        myComponent2: instanceOf(MyComponent2)
      },
      ({ myComponent1, myComponent2 }) => {
        expect(myComponent1).toEqual(component1)
        expect(myComponent2).toEqual(component2)
        spy()
      }
    )
    runtime.addEntity(component1, component2)
    expect(spy).toBeCalled()
  })

  it('should match partial matches if entity has more components', () => {
    const runtime = createRuntime()
    class MyComponent1 {}
    class MyComponent2 {}
    const component1 = new MyComponent1()
    const component2 = new MyComponent2()
    const spy = jest.fn()
    runtime.addSystem({ comp: instanceOf(MyComponent1) }, spy)
    runtime.addEntity(component1, component2)
    expect(spy).toBeCalled()
  })

  it('should not match partial matches if entity has less components', () => {
    const runtime = createRuntime()
    class MyComponent1 {}
    class MyComponent2 {}
    const component1 = new MyComponent1()
    const spy = jest.fn()
    runtime.addSystem(
      {
        myComponent1: instanceOf(MyComponent1),
        myComponent2: instanceOf(MyComponent2)
      },
      spy
    )
    runtime.addEntity(component1)
    expect(spy).not.toBeCalled()
  })

  it('should match if user adds more components to entity', () => {
    const runtime = createRuntime()
    class MyComponent1 {}
    class MyComponent2 {}
    const component1 = new MyComponent1()
    const component2 = new MyComponent2()
    const spy = jest.fn()
    runtime.addSystem(
      { c1: instanceOf(MyComponent1), c2: instanceOf(MyComponent2) },
      spy
    )
    const entity = runtime.addEntity(component1)
    expect(spy).not.toBeCalled()
    runtime.addComponentToEntity(entity, component2)
    expect(spy).toBeCalled()
  })

  it('should support removing entities', () => {
    const runtime = createRuntime()
    class MyComponent1 {}
    const component1 = new MyComponent1()
    const spy = jest.fn()
    const entity = runtime.addEntity(component1)
    runtime.removeEntity(entity)
    runtime.addSystem({ c: instanceOf(MyComponent1) }, spy)
    expect(spy).not.toBeCalled()
  })

  it('should support singleton entities', () => {
    const runtime = createRuntime()
    class MyComponent {}
    class MySingletonComponent {}
    const component = new MyComponent()
    const singletonComponent = new MySingletonComponent()
    const spy = jest.fn()
    runtime.addEntity(component)
    runtime.addComponentToSingletonEntity(singletonComponent)
    runtime.addSystem(
      { c: instanceOf(MyComponent), s: instanceOf(MySingletonComponent) },
      spy
    )
    expect(spy).toBeCalled()
  })

  it('should support removing components from entities', () => {
    const runtime = createRuntime()
    class MyComponent {}
    const component = new MyComponent()
    const spy = jest.fn()
    const entity = runtime.addEntity(component)
    runtime.removeComponentFromEntity(entity, component)
    runtime.addSystem({ c: instanceOf(MyComponent) }, spy)
    expect(spy).not.toBeCalled()
  })

  it('should only run once for the singletons if the selector only matches the singleton', () => {
    const runtime = createRuntime()
    class MyComponent {}
    class MySingletonComponent {}
    const component = new MyComponent()
    const singletonComponent = new MySingletonComponent()
    const spy = jest.fn()
    runtime.addComponentToSingletonEntity(singletonComponent)
    runtime.addEntity(component)
    runtime.addEntity(component)
    runtime.addSystem({ c: instanceOf(MySingletonComponent) }, spy)
    expect(spy).toBeCalledTimes(1)
  })

  it('should check for mutlisystems', () => {
    const runtime = createRuntime()
    class MyComponent {}
    const component = new MyComponent()
    const spy = jest.fn()
    runtime.addEntity(component)
    runtime.addEntity(component)
    runtime.addMultiSystem({ c: instanceOf(MyComponent) }, (entities) => {
      expect(entities).toHaveLength(2)
      for (const entity of entities) {
        expect(entity.c).toEqual(component)
      }
      spy()
    })
    expect(spy).toBeCalled()
  })

  it('should fire multisystems when component is added', () => {
    const runtime = createRuntime()
    class MyComponent {}
    const component = new MyComponent()
    const spy = jest.fn()
    runtime.addMultiSystem({ c: instanceOf(MyComponent) }, spy)
    expect(spy).toBeCalledWith([])
    runtime.addEntity(component)
    expect(spy).toBeCalledWith([{ c: component }])
  })

  it('should allow firing events', () => {
    const runtime = createRuntime()
    class MyEvent {}
    const spy = jest.fn()
    runtime.addSystem({ e: instanceOf(MyEvent) }, spy)
    runtime.fireEvent(new MyEvent())
    expect(spy).toBeCalled()
  })

  it('should allow side effects from events', () => {
    const runtime = createRuntime()
    class MyEvent {}
    const spy = jest.fn()
    runtime.addSystem({ e: instanceOf(MyEvent) }, () => {
      runtime.addEntity()
      spy()
    })
    runtime.fireEvent(new MyEvent())
    expect(spy).toBeCalledTimes(1)
  })
})
