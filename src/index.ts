export type MountFn = (parent: Node, index?: number) => Node
type Children = MountFn[]

type ExcludePropNames<O, T> = {
  [P in keyof O]: O[P] extends T ? never : P
}[keyof O]
type ExcludeProp<O, T> = Pick<O, ExcludePropNames<O, T>>
type NoFunctions<T> = ExcludeProp<T, (...props: any[]) => any>

type ElementArgs<TagName extends keyof HTMLElementTagNameMap> =
  | [ElementProps<TagName>]
  | Exclude<ElementProps<TagName>['children'], undefined>

const isProps = <TagName extends keyof HTMLElementTagNameMap>(
  value: ElementArgs<TagName>
): value is [ElementProps<TagName>] =>
  value.length === 1 && typeof value[0] === 'object'

type ElementProps<TagName extends keyof HTMLElementTagNameMap> = {
  children?: Children
  dataset?: { [key: string]: string }
  style?: {
    [K in keyof CSSStyleDeclaration]?: string
  }
  onunmount?: (e: Event) => void
} & Partial<
  NoFunctions<
    Omit<
      HTMLElementTagNameMap[TagName],
      'children' | 'dataset' | 'style' | 'innerText' | 'textContent'
    >
  >
>

const createAndAppend = <TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName,
  parent: Node,
  index: number
) => {
  const el = parent.ownerDocument!.createElement(tagName)
  const nextSibling = parent.childNodes[index]
  if (nextSibling) {
    parent.insertBefore(el, nextSibling)
  } else {
    parent.appendChild(el)
  }
  return el
}

function createElement<TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName
) {
  return function element(...args: ElementArgs<TagName>): MountFn {
    return function render(parent, index = 0) {
      const props: ElementProps<TagName> = isProps(args)
        ? args[0]
        : ({ children: args } as unknown as ElementProps<TagName>)

      const { children = [], dataset = {}, style = {}, ...rest } = props

      const curr = parent.childNodes[index]
      if (curr) {
        if (curr.nodeName.toLowerCase() !== tagName) {
          parent.removeChild(curr)
          broadcast(curr, CustomEvent('unmount', parent))
        }
      }
      const el =
        curr && curr.nodeName.toLowerCase() === tagName
          ? (curr as HTMLElementTagNameMap[TagName])
          : createAndAppend(tagName, parent, index)

      Object.entries(dataset).forEach(([key, value]) => {
        el.dataset[key] = value
      })
      Object.entries(style).forEach(([key, value]) => {
        el.style[key as any] = value ?? ''
      })

      if ('onunmount' in el && (el as any).onunmount !== rest.onunmount)
        el.removeEventListener('unmount', (el as any).onunmount)
      if (rest.onunmount !== (el as any).onunmount)
        el.addEventListener('unmount', rest.onunmount as any)

      Object.entries(rest).forEach(([name, value]) => {
        //@ts-ignore
        if (el[name] !== value) {
          //@ts-ignore
          el[name] = value
        }
      })
      append(children, el)

      return el
    }
  }
}

export const a = createElement('a')
export const abbr = createElement('abbr')
export const address = createElement('address')
export const area = createElement('area')
export const article = createElement('article')
export const aside = createElement('aside')
export const audio = createElement('audio')
export const b = createElement('b')
export const base = createElement('base')
export const bdi = createElement('bdi')
export const bdo = createElement('bdo')
export const blockquote = createElement('blockquote')
export const body = createElement('body')
export const br = createElement('br')
export const button = createElement('button')
export const canvas = createElement('canvas')
export const caption = createElement('caption')
export const cite = createElement('cite')
export const code = createElement('code')
export const col = createElement('col')
export const colgroup = createElement('colgroup')
export const data = createElement('data')
export const datalist = createElement('datalist')
export const dd = createElement('dd')
export const del = createElement('del')
export const details = createElement('details')
export const dfn = createElement('dfn')
export const dialog = createElement('dialog')
export const dir = createElement('dir')
export const div = createElement('div')
export const dl = createElement('dl')
export const dt = createElement('dt')
export const em = createElement('em')
export const embed = createElement('embed')
export const fieldset = createElement('fieldset')
export const figcaption = createElement('figcaption')
export const figure = createElement('figure')
export const font = createElement('font')
export const footer = createElement('footer')
export const form = createElement('form')
export const frame = createElement('frame')
export const frameset = createElement('frameset')
export const h1 = createElement('h1')
export const h2 = createElement('h2')
export const h3 = createElement('h3')
export const h4 = createElement('h4')
export const h5 = createElement('h5')
export const h6 = createElement('h6')
export const head = createElement('head')
export const header = createElement('header')
export const hgroup = createElement('hgroup')
export const hr = createElement('hr')
export const html = createElement('html')
export const i = createElement('i')
export const iframe = createElement('iframe')
export const img = createElement('img')
export const input = createElement('input')
export const ins = createElement('ins')
export const kbd = createElement('kbd')
export const label = createElement('label')
export const legend = createElement('legend')
export const li = createElement('li')
export const link = createElement('link')
export const main = createElement('main')
export const map = createElement('map')
export const mark = createElement('mark')
export const marquee = createElement('marquee')
export const menu = createElement('menu')
export const meta = createElement('meta')
export const meter = createElement('meter')
export const nav = createElement('nav')
export const noscript = createElement('noscript')
export const object = createElement('object')
export const ol = createElement('ol')
export const optgroup = createElement('optgroup')
export const option = createElement('option')
export const output = createElement('output')
export const p = createElement('p')
export const param = createElement('param')
export const picture = createElement('picture')
export const pre = createElement('pre')
export const progress = createElement('progress')
export const q = createElement('q')
export const rp = createElement('rp')
export const rt = createElement('rt')
export const ruby = createElement('ruby')
export const s = createElement('s')
export const samp = createElement('samp')
export const script = createElement('script')
export const section = createElement('section')
export const select = createElement('select')
export const slot = createElement('slot')
export const small = createElement('small')
export const source = createElement('source')
export const span = createElement('span')
export const strong = createElement('strong')
export const style = createElement('style')
export const sub = createElement('sub')
export const summary = createElement('summary')
export const sup = createElement('sup')
export const table = createElement('table')
export const tbody = createElement('tbody')
export const td = createElement('td')
export const template = createElement('template')
export const textarea = createElement('textarea')
export const tfoot = createElement('tfoot')
export const th = createElement('th')
export const thead = createElement('thead')
export const time = createElement('time')
export const title = createElement('title')
export const tr = createElement('tr')
export const track = createElement('track')
export const u = createElement('u')
export const ul = createElement('ul')
export const video = createElement('video')
export const wbr = createElement('wbr')
export const custom = (elementName: string) =>
  createElement(elementName as keyof HTMLElementTagNameMap)

const isTextNode = (node: Node): node is Text =>
  'data' in node && !('tagName' in node)

export const text =
  (text: string): MountFn =>
  (parent, index = 0) => {
    const curr = parent.childNodes[index]
    if (curr && isTextNode(curr)) {
      curr.data = text
      return curr
    } else {
      const el = parent.ownerDocument!.createTextNode(text)
      parent.appendChild(el)
      return el
    }
  }

const append = (children: Children, parent: Node) => {
  children.forEach((child, index) => child(parent, index))
  while (parent.childNodes.length > children.length) {
    const curr = parent.childNodes.item(children.length)
    parent.removeChild(curr)
    broadcast(curr, CustomEvent('unmount', parent))
  }
}

function CustomEvent(event: string, el: Node) {
  const params = { bubbles: false, cancelable: false, detail: null }
  var evt = el.ownerDocument!.createEvent('CustomEvent')
  evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
  return evt
}

function broadcast(element: Node, event: CustomEvent) {
  element.childNodes.forEach((child) => broadcast(child, event))
  element.dispatchEvent(event)
}
