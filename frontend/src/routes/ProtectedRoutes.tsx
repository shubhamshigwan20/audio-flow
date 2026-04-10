import { Outlet } from "react-router-dom"
import Header from "@/components/common/header/Header"
import Footer from "@/components/common/footer/Footer"
import Loader from "@/components/common/loader/Loader"

const ProtectedRoutes = () => {
  return (
    <div className="flex min-h-screen flex-col border-1">
      <Header />
      <Loader />
      <main className="flex-1 px-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default ProtectedRoutes
