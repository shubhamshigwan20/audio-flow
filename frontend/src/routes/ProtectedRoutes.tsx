import { Outlet } from "react-router-dom"
import Header from "@/components/common/header/Header"
import Footer from "@/components/common/footer/Footer"
import Loader from "@/components/common/loader/Loader"

const ProtectedRoutes = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Loader />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-5xl px-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ProtectedRoutes
