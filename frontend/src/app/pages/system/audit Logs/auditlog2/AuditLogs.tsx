import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { AuditLogColumns } from "./auditlog.column"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { useAuditLogs } from "./auditlog.hooks"
import type { AuditLogRow } from "./auditlog.column"
import { Spinner } from "@/components/ui/spinner"
import { Pagination } from "@/app/components/Pagination"
function AuditLogs() {

  const {
    auditLogs,
    loading,
    error,
    refetch,
    page,
    total,
    limit,
    setPage }
    = useAuditLogs()

  const tableData: AuditLogRow[] = auditLogs.map((audit, index) => ({
    enr: (page -1) * limit + index + 1,
    user: audit.user,
    action: audit.action,
    entity: audit.entity,
    createdAt: audit.createdAt,
    entityID: audit.entityID,
    OldValue: audit.OldValue,
    newValue: audit.newValue,
    ipAddress: audit.ipAddress
  }))

  if (loading) {
    return (
      <div className="flex text-muted-foreground gap-4 justify-center items-center h-screen">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex w-full justify-center items-end">
        <p>{error}</p>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Audit Logs"
          description={`${total} ${total === 1 ? "auditlog" : "auditlogs"}`} />
      </div>

      <div className="flex w-full justify-end">
        <Button className="flex items-center gap-2 m-2" onClick={refetch} variant={'outline'}>
          Refresh
          <HugeiconsIcon icon={Refresh01Icon} />
        </Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search..." />
        <Button variant={'outline'}>Filters</Button>
      </div>

      <DataTable
        columns={AuditLogColumns}
        data={tableData}
        emptyMessage="Once there are audit logs to show, you can view them here"
      />

      <div>
        <Pagination 
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        />
      </div>
    </div>
  )
}

export default AuditLogs