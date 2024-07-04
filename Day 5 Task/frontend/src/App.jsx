import { useState } from 'react'
import './App.css'
import FileUpload from './FileUpload/FileUpload';
import CanvasTable from './CanvasTable/CanvasTable';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <FileUpload /> */}
      <CanvasTable/>
    </>
  )
}

export default App
