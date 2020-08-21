import { JSDOM } from 'jsdom'
import { div, ul, li, text, key, AsyncValue } from './index'

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

describe('Initial AsyncValue', () => {
  const mockValue = <T>(initialValue: T, nextValue?: T): AsyncValue<T> => {
    let once = false
    return {
      _getCurrent: () => initialValue,
      [Symbol.asyncIterator]: () => ({
        next: () => {
          once = !once
          return once && nextValue
            ? Promise.resolve({ value: nextValue })
            : Promise.resolve({ value: undefined, done: true })
        }
      })
    }
  }

  it('should accept AsyncValue as text', () => {
    const render = div({ children: [text(mockValue('Hello world!'))] })
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div>Hello world!</div>')
  })

  it('should accept AsyncValue as prop', () => {
    const render = div({ className: mockValue('classname1') })
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div class="classname1"></div>')
  })

  it('should render incoming value from iterator', async () => {
    const render = div({ className: mockValue('classname1', 'classname2') })
    const element = createRenderTarget()
    await render(element)
    expect(element.innerHTML).toEqual('<div class="classname2"></div>')
  })

  it('should render elements from asynciterable array', () => {
    const render = div({ children: [mockValue([key('test', ul())])] })
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div><ul></ul></div>')
  })
})
