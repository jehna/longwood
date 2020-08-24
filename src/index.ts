type UnsubsctiveFn = () => void

export interface ChangeableValue<T> {
  valueOf(): T
  onChange(callback: (newValue: T) => void): UnsubsctiveFn
}

const isAsyncvalue = <T>(v: any): v is ChangeableValue<T> =>
  v instanceof Object && 'valueOf' in v && 'onChange' in v

type MountFn = (parent: Node, current?: Node, nextSibling?: Node) => Node
export type KeyedElement = {
  key: string | number | ChangeableValue<string> | ChangeableValue<number>
  mount: MountFn
}
export type SubscribeableElements = ChangeableValue<KeyedElement[]>
type Children = (MountFn | SubscribeableElements)[]

type PropifyMap<T extends { [k: string]: any }> = {
  [K in keyof T]: T[K] | ChangeableValue<T[K]>
}

type ExcludePropNames<O, T> = {
  [P in keyof O]: O[P] extends T ? never : P
}[keyof O]
type ExcludeProp<O, T> = Pick<O, ExcludePropNames<O, T>>
type NoFunctions<T> = ExcludeProp<T, (...props: any[]) => any>

type ElementArgs<TagName extends keyof HTMLElementTagNameMap> = Exclude<
  [ElementProps<TagName>] | ElementProps<TagName>['children'],
  undefined
>

const isProps = <TagName extends keyof HTMLElementTagNameMap>(
  value: ElementArgs<TagName>
): value is [ElementProps<TagName>] =>
  value.length === 1 && typeof value[0] === 'object' && !isAsyncvalue(value[0])

type ElementProps<TagName extends keyof HTMLElementTagNameMap> = {
  children?: Children
  dataset?: { [key: string]: string | ChangeableValue<string> }
  style?: {
    [K in keyof CSSStyleDeclaration]?: ChangeableValue<string> | string
  }
} & Partial<
  PropifyMap<
    NoFunctions<
      Omit<HTMLElementTagNameMap[TagName], 'children' | 'dataset' | 'style'>
    >
  >
>

const createAndAppend = <TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName,
  parent: Node,
  nextSibling?: Node
) => {
  const el = parent.ownerDocument!.createElement(tagName)
  if (nextSibling) {
    parent.insertBefore(el, nextSibling)
  } else {
    parent.appendChild(el)
  }
  return el
}

const createElement = <TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName
) => (...args: ElementArgs<TagName>): MountFn => (
  parent,
  curr,
  nextSibling
) => {
  const props: ElementProps<TagName> = isProps(args)
    ? args[0]
    : ({ children: args } as ElementProps<TagName>)

  const { children = [], dataset = {}, style = {}, ...rest } = props

  if (curr) {
    if (curr.nodeName.toLowerCase() !== tagName) {
      parent.removeChild(curr)
    } else if (parent.nextSibling !== nextSibling) {
      if (nextSibling) parent.insertBefore(curr, nextSibling)
      else parent.appendChild(curr)
    }
  }

  const el =
    curr && curr.nodeName.toLowerCase() === tagName
      ? (curr as HTMLElementTagNameMap[TagName])
      : createAndAppend(tagName, parent, nextSibling)

  Object.entries(dataset).forEach(([key, value]) =>
    subOrSet(value, (v) => (el.dataset[key] = v))
  )
  Object.entries(style).forEach(([key, value]) =>
    subOrSet(value!, (v) => (el.style[key as any] = v as any))
  )

  Object.entries(rest).forEach(([name, value]) => {
    subOrSet(value, (v) => {
      //@ts-expect-error
      el[name] = v
    })
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

export const key = (
  key: string | number | ChangeableValue<string> | ChangeableValue<number>,
  element: MountFn
): KeyedElement => ({
  key,
  mount: element
})

const subOrSet = async <T>(
  value: T | ChangeableValue<T>,
  setter: (val: T) => void
) => {
  if (isAsyncvalue(value)) {
    setter(value.valueOf())
    value.onChange(setter)
  } else {
    setter(value)
  }
}

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

export const text = (text: string | ChangeableValue<string>): MountFn => (
  parent,
  prev
) => {
  if (prev) {
    if (isTextNode(prev)) {
      if (typeof text === 'string') {
        prev.data = text
      }
      return prev
    } else {
      parent.removeChild(prev)
    }
  }
  const initialText = typeof text === 'string' ? text : text.valueOf() ?? ''
  const el = parent.ownerDocument!.createTextNode(initialText)
  parent.appendChild(el)
  if (isAsyncvalue(text)) {
    subOrSet(text, (newData) => (el.data = newData ?? ''))
  }
  return el
}

const append = (children: Children, parent: Node) => {
  children
    .map(
      (child, i) =>
        [child, parent.childNodes[i], parent.childNodes[i + 1]] as const
    )
    .forEach(([child, curr, nextSibling]) =>
      isAsyncvalue(child)
        ? subscribeChild(child, parent)
        : child(parent, curr, nextSibling)
    )
}

const keyV = (
  key: string | number | ChangeableValue<string> | ChangeableValue<number>
) => {
  if (isAsyncvalue(key)) {
    return key.valueOf()
  } else {
    return key
  }
}

const subscribeChild = (children: SubscribeableElements, parent: Node) => {
  let last: (KeyedElement & { element: Node })[] = []

  const listener = (curr: KeyedElement[]) => {
    // Remove unfound
    last
      .filter(
        ({ key }) => !curr.some(({ key: kkey }) => keyV(key) === keyV(kkey))
      )
      .forEach(({ element }) => {
        parent.removeChild(element)
      })

    last = curr.map(({ key, mount }, i) => {
      const prev = last.find((p) => p.key === key)
      if (prev) {
        const next = curr[i + 1] && last.find((p) => p.key === curr[i + 1]?.key)
        const element = mount(parent, prev.element, next?.element)
        return { key, mount, element }
      } else {
        const element = mount(parent)
        return { key, mount, element }
      }
    })
  }

  subOrSet(children, listener)
}
