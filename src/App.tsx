import { Route, Routes } from "react-router-dom"


import { SignupForm } from "./pages/form/signup-form"
import { VagasPage } from "./pages/vagas/vagas-page"

export function App() {
  return (
      <Routes>  
        <Route path="/" element={<SignupForm   />} />
        <Route path="/vagas" element={<VagasPage />} />
      </Routes>
  ) 
}

export default App
