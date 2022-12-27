import { createApp } from 'vue'

export function renderComponent({ el, component, appContext }) {
    let app = createApp(component)
    Object.assign(app._context, appContext)
    app.mount(el)

    return () => {
        app?.unmount()
        app = undefined
    }
}