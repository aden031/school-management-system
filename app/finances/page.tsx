"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeeDataTable } from "@/components/data-tables/fee-data-table"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function ManagementPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState("faculty")

  useEffect(() => {
    if (
      tabParam &&
      ["faculty", "department", "classes", "student", "courses", "users", "examtype", "exam", "fee"].includes(tabParam)
    ) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Systemka  Maamulka Dugsiga</h1>
            <p className="text-muted-foreground">
            Maamul waaxyaha Xarumaha, fasallada, ardayda, koorsooyinka, iyo isticmaalayaasha systemka.
            </p>
        </div>

        <Tabs defaultValue="fee" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="fee" className="w-full">Fee</TabsTrigger>
            </TabsList>


          <TabsContent value="fee">
            <FeeDataTable />
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  )
}
