import { useState } from 'react'
import reactLogo from './assets/react.svg'
import Logo from '/logo.png'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex items-center gap-4">
        <a href="https://vite.dev" target="_blank">
          <img src={Logo} className="w-12" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} alt="React logo" />
        </a>
      </div>
      <h1 className="text-amber-300">Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
