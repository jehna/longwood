import { JSDOM } from 'jsdom'
import { div, ul, li, text, custom } from './index'

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

describe('element rerendering', () => {
  it('should allow re-rendering elements', () => {
    const render = div(ul(li(text('Hello')), li(text('World'))))
    const element = createRenderTarget()
    render(element)
    render(element)
    expect(element.innerHTML).toEqual(
      '<div><ul><li>Hello</li><li>World</li></ul></div>'
    )
  })

  it('should allow re-rendering text elements with different value', () => {
    const element = createRenderTarget()
    div(text('Hello'))(element)
    div(text('World'))(element)
    expect(element.innerHTML).toEqual('<div>World</div>')
  })

  it('should not remove and re-add the element if the element stays the same', () => {
    const render = div({ id: 'should-not-change' })
    const element = createRenderTarget()
    render(element)
    const childElement = element.querySelector('#should-not-change')
    childElement!.className = 'Should not touch this'
    render(element)
    expect(element.innerHTML).toEqual(
      '<div id="should-not-change" class="Should not touch this"></div>'
    )
  })
  it('should allow to reorder child elements on rerender', () => {
    const render1 = div(div(), ul())
    const render2 = div(ul(), div())
    const element = createRenderTarget()
    render1(element)
    render2(element)
    expect(element.innerHTML).toEqual('<div><ul></ul><div></div></div>')
  })

  it('should allow to reorder child elements with smaller number of elements', () => {
    const render1 = div(div(), ul(), div())
    const render2 = div(ul(), div())
    const element = createRenderTarget()
    render1(element)
    render2(element)
    expect(element.innerHTML).toEqual('<div><ul></ul><div></div></div>')
  })

  it('should allow to reorder child elements with larger number of elements', () => {
    const render1 = div(ul(), div())
    const render2 = div(div(), ul(), div())
    const element = createRenderTarget()
    render1(element)
    render2(element)
    expect(element.innerHTML).toEqual(
      '<div><div></div><ul></ul><div></div></div>'
    )
  })

  it('should allow to remove all children', () => {
    const render1 = div(ul(), ul(), ul())
    const render2 = div()
    const element = createRenderTarget()
    render1(element)
    render2(element)
    expect(element.innerHTML).toEqual('<div></div>')
  })

  it('should allow to modify nested children', () => {
    const render1 = div(
      div(ul(li(text('Hello')))),
      div(text('Be gone')),
      ul(li(text('World')))
    )
    const render2 = div(ul(li(text('Hello'))), ul(li(text('World'))))
    const element = createRenderTarget()
    render1(element)
    render2(element)
    expect(element.innerHTML).toEqual(
      '<div><ul><li>Hello</li></ul><ul><li>World</li></ul></div>'
    )
  })
})

describe('Custom elements', () => {
  it('supports custom elements', () => {
    const myElement = custom('my-element')
    const render = myElement()
    const element = createRenderTarget()
    render(element)
    expect(element.innerHTML).toEqual('<my-element></my-element>')
  })

  it('supports swapping custom elements with regular elements', () => {
    const myElement = custom('my-element')
    const render1 = div(div(), myElement(div()), div(myElement()))
    const render2 = div(div(myElement()), myElement(div()))
    const element = createRenderTarget()
    render1(element)
    render2(element)
    expect(element.innerHTML).toEqual(
      '<div><div><my-element></my-element></div><my-element><div></div></my-element></div>'
    )
  })
})
