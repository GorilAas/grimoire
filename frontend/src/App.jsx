import { Routes, Route } from 'react-router-dom'
import Status from './components/pages/Status'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home — em construção</div>} />
      <Route path="/status" element={<Status />} />
    </Routes>
  )
}