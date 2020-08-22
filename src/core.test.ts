import { JSDOM } from 'jsdom'
import { div, ul, li, text, key, ChangeableValue } from './index'

const createRenderTarget = () =>
  new JSDOM('<div id="app" />').window.document.getElementById('app')!

describe('element creation', () => {
  it('should create a simple element wihtout any props', () => {
    const render = div()
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div></div>')
  })

  it('should create nested components', () => {
    const render = ul({ children: [li(), li()] })
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<ul><li></li><li></li></ul>')
  })

  it('should create components with a text node', () => {
    const render = div({ children: [text('Hello world')] })
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div>Hello world</div>')
  })

  it('should set attributes as text', () => {
    const render = div({ className: 'hello-world' })
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div class="hello-world"></div>')
  })

  it('should set styles as text', () => {
    const render = div({ style: { color: 'red', backgroundColor: 'black' } })
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual(
      '<div style="color: red; background-color: black;"></div>'
    )
  })
})

describe('Initial ChangeableValue', () => {
  const simpleMockState = <T>(
    value: T
  ): ChangeableValue<T> & { setValue(val: T): void } => {
    const listeners: ((newValue: T) => void)[] = []
    return {
      valueOf: () => value,
      onChange: (l) => {
        listeners.push(l)
        return () => {}
      },
      setValue: (newValue: T) => {
        value = newValue
        listeners.forEach((l) => l(newValue))
      }
    }
  }

  it('should accept AsyncValue as text', () => {
    const render = div({ children: [text(simpleMockState('Hello world!'))] })
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div>Hello world!</div>')
  })

  it('should accept AsyncValue as prop', () => {
    const render = div({ className: simpleMockState('classname1') })
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div class="classname1"></div>')
  })

  it('should render incoming value from iterator', async () => {
    const className = simpleMockState('classname1')
    const render = div({ className })
    const element = createRenderTarget()
    render(element)
    className.setValue('classname2')
    expect(element.innerHTML).toEqual('<div class="classname2"></div>')
  })

  it('should render elements from asynciterable array', () => {
    const render = div({ children: [simpleMockState([key('test', ul())])] })
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div><ul></ul></div>')
  })
})
