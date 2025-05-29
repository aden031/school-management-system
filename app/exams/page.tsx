"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { ExamTypeDataTable } from "@/components/data-tables/exam-type-data-table"
import { ExamDataTable } from "@/components/data-tables/exam-data-table"

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Systemka  Maamulka Dugsiga</h1>
            <p className="text-muted-foreground">
            Maamul waaxyaha Xarumaha, fasallada, ardayda, koorsooyinka, iyo isticmaalayaasha systemka.
            </p>
        </div>
        <Tabs defaultValue="exam" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-2">
            <TabsTrigger value="exam">Imtixaanaadka</TabsTrigger>
            <TabsTrigger value="examtype">Exam Type</TabsTrigger>

          </TabsList>


          <TabsContent value="exam">
            <ExamDataTable />
          </TabsContent>
          <TabsContent value="examtype">
            <ExamTypeDataTable />
          </TabsContent>


        </Tabs>
     </div>
    </DashboardLayout>
  )
}
