import { Route, Routes } from "react-router-dom"


import { SignupPage } from "./pages/form/singup-page"

export function App() {
  return (
      <Routes>  
        <Route path="/" element={<SignupPage />} />
      </Routes>
  ) 
}

export default App
