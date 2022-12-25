import { Engine } from '../game/Engine'

export function App() {
  if (!Engine.instance) {
    new Engine().init()
  }

  return (
    <>
    
    </>
  )
}
