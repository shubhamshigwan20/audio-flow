import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "../views/home/Home"
import ProtectedRoutes from "./ProtectedRoutes"

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default AppRoutes
