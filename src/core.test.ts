import { JSDOM } from 'jsdom'
import { div, ul, li, text, key, ChangeableValue, span, input } from './index'

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
    const render = ul(li(), li())
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<ul><li></li><li></li></ul>')
  })

  it('should create components with a text node', () => {
    const render = div(text('Hello world'))
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

  it('should allow passing children as arguments', () => {
    const render = div(ul(li(text('Hello')), li(text('World'))))
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual(
      '<div><ul><li>Hello</li><li>World</li></ul></div>'
    )
  })
})

describe('ChangeableValue', () => {
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
    const render = div(text(simpleMockState('Hello world!')))
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

  it('should render elements from ChangeableValue array', () => {
    const render = div(simpleMockState([key('test', ul())]))
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div><ul></ul></div>')
  })

  it('should handle text changes from ChangeableValue', () => {
    const state = simpleMockState('foo')
    const render = div(text(state))
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div>foo</div>')
    state.setValue('bar')
    expect(element.innerHTML).toEqual('<div>bar</div>')
  })

  it('should update elements inside from ChangeableValue array', () => {
    const first = [key('test', div(text('hello there')))]
    const second = [key('test', div(text('hello world')))]
    const state = simpleMockState(first)
    const render = div(state)
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div><div>hello there</div></div>')
    state.setValue(second)
    expect(element.innerHTML).toEqual('<div><div>hello world</div></div>')
  })

  it('should allow changing children', () => {
    const first = [key('test', div(text('hello there')))]
    const second = [key('test', span(text('hello world')))]
    const state = simpleMockState(first)
    const render = div(state)
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div><div>hello there</div></div>')
    state.setValue(second)
    expect(element.innerHTML).toEqual('<div><span>hello world</span></div>')
  })

  it('should allow changing amount of children', () => {
    const first = [
      key('test1', li(div(text('Will change')), span(text(`This won't`))))
    ]
    const second = [
      key('test1', li(span(text('Did change')), span(text(`This won't`))))
    ]
    const state = simpleMockState(first)
    const render = div(state)
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual(
      "<div><li><div>Will change</div><span>This won't</span></li></div>"
    )
    state.setValue(second)
    expect(element.innerHTML).toEqual(
      "<div><li><span>Did change</span><span>This won't</span></li></div>"
    )
  })

  it('should allow changing key orders', () => {
    const first = [key('test1', div(text('A'))), key('test2', div(text(`B`)))]
    const second = [key('test2', div(text('B'))), key('test1', div(text(`A`)))]
    const state = simpleMockState(first)
    const render = div(state)
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<div><div>A</div><div>B</div></div>')
    state.setValue(second)
    expect(element.innerHTML).toEqual('<div><div>B</div><div>A</div></div>')
  })
})
