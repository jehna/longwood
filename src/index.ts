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

const createElement = <TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName
) => (...args: ElementArgs<TagName>): MountFn => (parent, index = 0) => {
  const props: ElementProps<TagName> = isProps(args)
    ? args[0]
    : (({ children: args } as unknown) as ElementProps<TagName>)

  const { children = [], dataset = {}, style = {}, ...rest } = props

  const curr = parent.childNodes[index]
  if (curr) {
    if (curr.nodeName.toLowerCase() !== tagName) {
      parent.removeChild(curr)
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

export const html = createElement('html')
export const base = createElement('base')
export const head = createElement('head')
export const link = createElement('link')
export const meta = createElement('meta')
export const script = createElement('script')
export const style = createElement('style')
export const title = createElement('title')
export const body = createElement('body')
export const address = createElement('address')
export const article = createElement('article')
export const aside = createElement('aside')
export const footer = createElement('footer')
export const header = createElement('header')
export const hgroup = createElement('hgroup')
export const main = createElement('main')
export const nav = createElement('nav')
export const section = createElement('section')
export const blockquote = createElement('blockquote')
export const cite = createElement('cite')
export const dd = createElement('dd')
export const dt = createElement('dt')
export const dl = createElement('dl')
export const div = createElement('div')
export const figcaption = createElement('figcaption')
export const figure = createElement('figure')
export const hr = createElement('hr')
export const li = createElement('li')
export const ol = createElement('ol')
export const p = createElement('p')
export const pre = createElement('pre')
export const ul = createElement('ul')
export const a = createElement('a')
export const abbr = createElement('abbr')
export const b = createElement('b')
export const bdi = createElement('bdi')
export const bdo = createElement('bdo')
export const br = createElement('br')
export const code = createElement('code')
export const data = createElement('data')
export const time = createElement('time')
export const dfn = createElement('dfn')
export const em = createElement('em')
export const i = createElement('i')
export const kbd = createElement('kbd')
export const mark = createElement('mark')
export const q = createElement('q')
export const ruby = createElement('ruby')
export const rp = createElement('rp')
export const rt = createElement('rt')
export const s = createElement('s')
export const del = createElement('del')
export const ins = createElement('ins')
export const samp = createElement('samp')
export const small = createElement('small')
export const span = createElement('span')
export const strong = createElement('strong')
export const sub = createElement('sub')
export const sup = createElement('sup')
export const u = createElement('u')
export const wbr = createElement('wbr')
export const area = createElement('area')
export const map = createElement('map')
export const audio = createElement('audio')
export const source = createElement('source')
export const img = createElement('img')
export const track = createElement('track')
export const video = createElement('video')
export const embed = createElement('embed')
export const iframe = createElement('iframe')
export const object = createElement('object')
export const param = createElement('param')
export const picture = createElement('picture')
export const canvas = createElement('canvas')
export const noscript = createElement('noscript')
export const caption = createElement('caption')
export const col = createElement('col')
export const colgroup = createElement('colgroup')
export const table = createElement('table')
export const tbody = createElement('tbody')
export const tr = createElement('tr')
export const td = createElement('td')
export const tfoot = createElement('tfoot')
export const th = createElement('th')
export const thead = createElement('thead')
export const button = createElement('button')
export const datalist = createElement('datalist')
export const option = createElement('option')
export const fieldset = createElement('fieldset')
export const label = createElement('label')
export const form = createElement('form')
export const input = createElement('input')
export const legend = createElement('legend')
export const meter = createElement('meter')
export const optgroup = createElement('optgroup')
export const select = createElement('select')
export const output = createElement('output')
export const progress = createElement('progress')
export const textarea = createElement('textarea')
export const details = createElement('details')
export const dialog = createElement('dialog')
export const menu = createElement('menu')
export const summary = createElement('summary')
export const slot = createElement('slot')
export const template = createElement('template')
export const applet = createElement('applet')
export const basefont = createElement('basefont')
export const dir = createElement('dir')
export const font = createElement('font')
export const frame = createElement('frame')
export const frameset = createElement('frameset')
export const marquee = createElement('marquee')

export const fragment = ({
  children = []
}: Pick<ElementProps<never>, 'children'> = {}): MountFn => (parent) => {
  const el = parent.ownerDocument!.createDocumentFragment()
  parent.appendChild(el)
  append(children, el)
  return el
}

const isTextNode = (node: Node): node is Text =>
  'data' in node && !('tagName' in node)

export const text = (text: string): MountFn => (parent, index = 0) => {
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
    parent.removeChild(parent.childNodes.item(children.length))
  }
}
