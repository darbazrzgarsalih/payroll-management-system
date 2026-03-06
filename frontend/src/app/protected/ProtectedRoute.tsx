import { AuthContext } from "@/context/AuthContext"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useContext } from "react"
import { Navigate } from "react-router-dom"


function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { loading, user } = useContext(AuthContext)
    if(loading) {
        return <HugeiconsIcon icon={Loading03Icon} />
    }
    if(user == null) {
        return <Navigate to={'/login'} />
    }
  return children
}

export default ProtectedRoute