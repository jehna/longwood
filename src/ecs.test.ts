import { createRuntime } from './ecs'

describe('Entity component system', () => {
  it('should create a runtime', () => {
    const runtime = createRuntime()
    expect(runtime).not.toBeNull()
  })

  it('should allow runtime to add entities', () => {
    const runtime = createRuntime()
    class MyComponent {}
    const component = new MyComponent()
    runtime.addEntity([component])
  })

  it('allows adding systems', () => {
    const runtime = createRuntime()
    class MyComponent {}
    const component = new MyComponent()
    const spy = jest.fn()
    runtime.addSystem([MyComponent], (e) => {
      expect(e).toBeInstanceOf(MyComponent)
      expect(e).toEqual(component)
      spy()
    })
    runtime.addEntity([component])
    expect(spy).toBeCalled()
  })

  it('allows adding systems with multiple listeners', () => {
    const runtime = createRuntime()
    class MyComponent1 {}
    class MyComponent2 {}
    const component1 = new MyComponent1()
    const component2 = new MyComponent2()
    const spy = jest.fn()
    runtime.addSystem([MyComponent1, MyComponent2], (e1, e2) => {
      expect(e1).toBeInstanceOf(MyComponent1)
      expect(e2).toBeInstanceOf(MyComponent2)
      spy()
    })
    runtime.addEntity([component1, component2])
    expect(spy).toBeCalled()
  })

  it('should match partial matches if entity has more components', () => {
    const runtime = createRuntime()
    class MyComponent1 {}
    class MyComponent2 {}
    const component1 = new MyComponent1()
    const component2 = new MyComponent2()
    const spy = jest.fn()
    runtime.addSystem([MyComponent1], spy)
    runtime.addEntity([component1, component2])
    expect(spy).toBeCalled()
  })

  it('should not match partial matches if entity has less components', () => {
    const runtime = createRuntime()
    class MyComponent1 {}
    class MyComponent2 {}
    const component1 = new MyComponent1()
    const spy = jest.fn()
    runtime.addSystem([MyComponent1, MyComponent2], spy)
    runtime.addEntity([component1])
    expect(spy).not.toBeCalled()
  })

  it('should match if user adds more components to entity', () => {
    const runtime = createRuntime()
    class MyComponent1 {}
    class MyComponent2 {}
    const component1 = new MyComponent1()
    const component2 = new MyComponent2()
    const spy = jest.fn()
    runtime.addSystem([MyComponent1, MyComponent2], spy)
    const entity = [component1]
    runtime.addEntity(entity)
    expect(spy).not.toBeCalled()
    runtime.addComponentToEntity(entity, component2)
    expect(spy).toBeCalled()
  })
})
