import { TextItem } from "@/app/utils/ItemMappers"
import type { Position } from "./position.hooks"
import type { PositionRow } from "./position.column"


export function mapPositionsToRows(
    positions: Position[],
    page: number,
    limit: number
): PositionRow[] {
    return positions.map((pos, index) => ({
        id: pos._id || pos.id,
        enr: (page - 1) * limit + index + 1,
        title: TextItem(pos.title ?? "No title"),
        level: TextItem(pos.level ?? "No level"),
        department: TextItem(pos.department ?? "No department"),
        description: TextItem(pos.description ?? "No description"),
        status: TextItem(pos.status ?? "No status"),
        createdBy: pos.createdBy,
        updatedBy: pos.updatedBy
    }))
}