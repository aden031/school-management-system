"use client"

import { useAuth } from "@/components/auth/auth-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
// import { useRouter } from "next/router"
// import { useEffect } from "react"

export default function Home() {
  const { user } = useAuth()
  // const router = useRouter()
  // useEffect(()=>{
  //     if(user?.role=="parent"){
  //       router.push('/parent')
  //     }
  // },[])


  return (
    <DashboardLayout>
      <DashboardOverview user={user} />
    </DashboardLayout>
  )
}
