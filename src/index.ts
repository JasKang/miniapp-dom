import jComponent from 'j-component'
import { getId } from './utils'

export type ComponentId = jComponent.ComponentId<
  Record<string, any>,
  Record<string, null>,
  Record<string, (...args: any[]) => any>
>

export type RootComponent = jComponent.RootComponent<
  Record<string, any>,
  Record<string, null>,
  Record<string, (...args: any[]) => any>
> & {
  triggerPageLifeTime(lifetime: 'show' | 'hide' | 'resize'): void
  readonly instance: WechatMiniprogram.Component.Instance<
    Record<string, any>,
    Record<string, null>,
    Record<string, (...args: any[]) => any>,
    Record<string, any>
  >
}

const componentOptionsMap = new Map<string, any>()
let lastOptionsId = ''
const currentPages: any[] = []

const MockBehavior: WechatMiniprogram.Behavior.Constructor = definition => jComponent.behavior(definition)

// @ts-ignore
global.Behavior = MockBehavior

// @ts-ignore
global.getCurrentPages = () => currentPages

// @ts-ignore
global.App = (options: any) => {
  return options
}

// @ts-ignore
global.Component = (options: any) => {
  const optionsId = getId()
  componentOptionsMap.set(optionsId, options)
  lastOptionsId = optionsId
  return optionsId
}

// @ts-ignore
global.Page = (opts: any) => {
  const { behaviors, options, ...others } = opts

  const routeBehavior = MockBehavior({
    properties: {
      __url__: String,
    },
    lifetimes: {
      created(this: any) {
        this.route = this.data.__url__ || '/pages/index'
      },
      attached() {
        currentPages.push(this)
      },
    },
  })

  // @ts-ignore
  return global.Component({
    behaviors: [routeBehavior, ...behaviors],
    options,
    methods: {
      ...others,
    },
  })
}

export type RegisterOptions = {
  id?: string
  path?: string
  tagName?: string
  template?: string
  usingComponents?: Record<string, string>
}

export function register(optionsId: string, { id, path, tagName, template, usingComponents }: RegisterOptions = {}) {
  const sourceOptions = componentOptionsMap.get(optionsId)

  const definition = {
    ...sourceOptions,
    id: id || getId(),
    path,
    tagName,
    template: template || '<slot/>',
    usingComponents,
  }
  const componentId = jComponent.register(definition) as ComponentId
  return componentId
}

export type RenderOptions = RegisterOptions & {
  props?: Record<string, any>
  url?: string
  parent?: Node
}

export function render(optionsId: string, options: RenderOptions = {}) {
  const { props, url, parent, ...others } = options
  const el = parent || document.createElement('div')
  const componentId = register(optionsId, others)
  const root = jComponent.create(componentId, {
    __url__: url,
    ...props,
  }) as RootComponent
  root.attach(el)
  if (root.instance.route) {
    root.instance.onLoad(options.props)
  }
  return root
}

/**
 * 让线程等待一段时间再执行
 */
export function sleep(time = 0) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
