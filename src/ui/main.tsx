import React from 'react'
import ReactDOM from 'react-dom/client'
import { Engine } from '../game/Engine';
import { App } from './App'

export function loadUI() {
  new Engine().init();

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}