import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RewardColumns, type RewardRow } from "./reward.column"
import { useEditRewards, useRewards } from "./reward.hooks"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { Pagination } from "@/app/components/Pagination"
import { CreateReward, EditReward, BulkCreateReward } from "./reward.form"
import { LoadingPage } from "@/app/components/LoadingPage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function Rewards() {
  const {
    rewards,
    loading,
    error,
    refetch,
    page,
    total,
    limit,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    voidReward,
    actionLoading
  } = useRewards()
  const edit = useEditRewards({ refetch })

  const tableData: RewardRow[] = rewards.map((reward, index) => ({
    id: reward.id,
    enr: (page - 1) * limit + index + 1,
    employeeName: reward.employeeName,
    payrollName: reward.payrollName,
    type: reward.type,
    amount: reward.amount,
    reason: reward.reason,
    paymentDate: reward.paymentDate ? new Date(reward.paymentDate).toLocaleDateString() : "Not provided",
    status: reward.status
  }))

  if (loading && rewards.length === 0) {
    return (
      <LoadingPage />
    )
  }
  if (error) {
    return (
      <div className="flex w-full justify-center items-center">
        <p>{error}</p>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Rewards"
          description={total === 0
            ? "No rewards add your first reward by clicking new button"
            : `${total} ${total === 1 ? "reward" : "rewards"}`}
        />
        <div className="flex gap-2">
          <CreateReward />
          <BulkCreateReward />
        </div>
      </div>

      <div className="flex w-full justify-end">
        <Button className="flex items-center gap-2 m-2" onClick={refetch} variant={'outline'}>
          Refresh
          <HugeiconsIcon icon={Refresh01Icon} />
        </Button>
      </div>

      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Search by name, reason or type..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <Select value={status} onValueChange={(val) => { setPage(1); setStatus(val); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="voided">Voided</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <EditReward
        open={edit.open}
        form={edit.form}
        loading={edit.loading}
        error={edit.error}
        onChange={edit.handleChange}
        onSubmit={edit.submitEdit}
        onClose={edit.closeEdit}
      />

      <DataTable
        columns={RewardColumns({
          onEdit: edit.openEdit,
          onVoid: voidReward,
          actionLoading: actionLoading
        })}
        data={tableData}
        emptyMessage={loading ? "Loading..." : "Once there are rewards to show you can view them here"}
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

export default Rewards
