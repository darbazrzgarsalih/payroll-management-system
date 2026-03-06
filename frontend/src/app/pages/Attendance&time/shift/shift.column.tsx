

import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Edit04Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type ShiftRow = {
  _id?: string;
  enr: number;
  name: string;
  code?: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  gracePeriodMinutes: number;
  overtimeThresholdMinutes: number;
  status: string;
};

export const ShiftColumns = ({
  onEdit,
  onDeactivate
}: {
  onEdit: (shift: ShiftRow) => void;
  onDeactivate: (id: string) => void;
}): DataTableColumn<ShiftRow>[] => [
  { header: "ENR", accessor: "enr" },
  { header: "NAME", accessor: "name" },
  { header: "CODE", accessor: "code" },
  { header: "START", accessor: "startTime" },
  { header: "END", accessor: "endTime" },
  { header: "BREAK (MIN)", accessor: "breakMinutes" },
  { header: "GRACE (MIN)", accessor: "gracePeriodMinutes" },
  { header: "OT THRESHOLD", accessor: "overtimeThresholdMinutes" },
  { header: "STATUS", accessor: "status" },
  {
    header: "ACTIONS",
    accessor: "_id",
    className: "text-right",
    cell: (shift) => (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          title="edit"
          onClick={() => onEdit(shift)}
          disabled={shift.status !== "active"}
        >
          <HugeiconsIcon icon={Edit04Icon} />
        </Button>
        <Button
          variant="destructive"
          title="deactivate"
          onClick={() => shift._id && onDeactivate(shift._id)}
          disabled={shift.status !== "active"}
        >
          <HugeiconsIcon icon={Logout01Icon} />
        </Button>
      </div>
    )
  }
];