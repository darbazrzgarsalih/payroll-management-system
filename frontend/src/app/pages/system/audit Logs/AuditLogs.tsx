import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuditLogColumns } from "./auditlog.column"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterAddFreeIcons, Refresh01Icon } from "@hugeicons/core-free-icons"
import { useAuditLogs, useAuditLog } from "./auditlog.hooks"
import type { AuditLogRow } from "./auditlog.column"
import { Spinner } from "@/components/ui/spinner"
import { Pagination } from "@/app/components/Pagination"
import { useState, useEffect, useRef } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  TERMINATE: "bg-red-100 text-red-700",
  RUN_PAYROLL: "bg-orange-100 text-orange-700",
  CHECK_IN: "bg-teal-100 text-teal-700",
  CHECK_OUT: "bg-teal-100 text-teal-700",
}

const ENTITY_OPTIONS = ["Employee", "Attendance", "Payroll", "Salary", "Leave", "Department", "Position"]
const ACTION_OPTIONS = ["CREATE", "UPDATE", "DELETE", "TERMINATE", "RUN_PAYROLL", "CHECK_IN", "CHECK_OUT"]

function QuickViewDrawer({ id, open, onClose }: { id: string | null; open: boolean; onClose: () => void }) {
  const { auditLog, loading } = useAuditLog(open ? id : null)

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-US', {
      timeZone: 'Asia/Baghdad',
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })

  const renderValue = (val: any) => {
    if (!val) return <span className="text-muted-foreground italic text-sm">—</span>
    try {
      const parsed = typeof val === 'string' ? JSON.parse(val) : val
      return (
        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48 whitespace-pre-wrap break-all">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )
    } catch {
      return <span className="text-sm">{String(val)}</span>
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[420px] sm:w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Audit Log Details</SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex justify-center items-center h-40">
            <Spinner className="h-5 w-5" />
          </div>
        )}

        {auditLog && !loading && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">User</p>
                <p className="font-medium">{auditLog.user}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Action</p>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${actionColors[auditLog.action] || 'bg-gray-100 text-gray-700'}`}>
                  {auditLog.action}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Entity</p>
                <p className="font-medium">{auditLog.entity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Entity ID</p>
                <p className="text-xs font-mono text-muted-foreground break-all">{auditLog.entityID || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                <p className="font-medium">{auditLog.ipAddress}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                <p className="font-medium">{formatDate(auditLog.createdAt)}</p>
              </div>
            </div>

            <hr />

            <div>
              <p className="text-xs text-muted-foreground mb-2">Old Value</p>
              {renderValue(auditLog.oldValue)}
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">New Value</p>
              {renderValue(auditLog.newValue)}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function AuditLogs() {
  const {
    auditLogs,
    loading,
    error,
    refetch,
    page,
    total,
    limit,
    setPage,
    filters,
    setFilters
  } = useAuditLogs()

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState({ action: '', entity: '', from: '', to: '' })
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search }))
    }, 500)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [search])

  const applyFilters = () => {
    setFilters(prev => ({ ...prev, ...tempFilters }))
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    const empty = { action: '', entity: '', from: '', to: '' }
    setTempFilters(empty)
    setFilters(prev => ({ ...prev, ...empty }))
    setFiltersOpen(false)
  }

  const hasActiveFilters = filters.action || filters.entity || filters.from || filters.to

  const tableData: AuditLogRow[] = auditLogs.map((audit, index) => ({
    id: audit.id,
    enr: (page - 1) * limit + index + 1,
    user: audit.user,
    action: audit.action,
    entity: audit.entity,
    createdAt: audit.createdAt,
    entityID: audit.entityID,
    OldValue: audit.oldValue,
    newValue: audit.newValue,
    ipAddress: audit.ipAddress,
    onView: (id: string) => { 
      setSelectedId(id)
      setDrawerOpen(true)
    }
  }))

  const handleRowClick = (row: AuditLogRow) => {
    if (row.id) {
      setSelectedId(row.id)
      setDrawerOpen(true)
    }
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
        <PageHeader
          title="Audit Logs"
          description={`${total} ${total === 1 ? "auditlog" : "auditlogs"}`}
        />
      </div>

      <div className="flex w-full justify-end">
        <Button className="flex items-center gap-2 m-2" onClick={refetch} variant={'outline'}>
          Refresh
          <HugeiconsIcon icon={Refresh01Icon} />
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by action, entity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />

        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant={'outline'} className="relative">
              <HugeiconsIcon icon={FilterAddFreeIcons} />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 space-y-4" align="end">
            <p className="font-semibold text-sm">Filter Audit Logs</p>

            <div className="space-y-2">
              <Label className="text-xs">Action</Label>
              <Select
                value={tempFilters.action}
                onValueChange={(val) => setTempFilters(prev => ({ ...prev, action: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Entity</Label>
              <Select
                value={tempFilters.entity}
                onValueChange={(val) => setTempFilters(prev => ({ ...prev, entity: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_OPTIONS.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={tempFilters.from}
                onChange={(e) => setTempFilters(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={tempFilters.to}
                onChange={(e) => setTempFilters(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={applyFilters}>Apply</Button>
              <Button className="flex-1" variant={'outline'} onClick={clearFilters}>Clear</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {loading ? (
        <div className="flex text-muted-foreground gap-4 justify-center items-center h-40">
          <Spinner className="h-5 w-5" />
        </div>
      ) : (
        <DataTable
          columns={AuditLogColumns}
          data={tableData}
          onRowClick={handleRowClick}
          emptyMessage="Once there are audit logs to show, you can view them here"
        />
      )}

      <Pagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
      />

      <QuickViewDrawer
        id={selectedId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}

export default AuditLogs