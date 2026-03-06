import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCheckInOut, type Attendance } from "./attendance.hooks"
import { Clock, LogIn, LogOut, CheckCircle, AlertCircle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface CheckInOutProps {
    onSuccess?: () => void
    initialRecord?: Attendance | null
}

export function CheckInOut({ onSuccess, initialRecord }: CheckInOutProps) {
    const { checkIn, checkOut, loading, todayRecord } = useCheckInOut(onSuccess, initialRecord)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [remarks, setRemarks] = useState("")

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        })
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })
    }

    const handleAction = async () => {
        if (!todayRecord) {
            await checkIn(remarks)
            setRemarks("")
        } else if (!todayRecord.timeOut) {
            await checkOut(remarks)
            setRemarks("")
        }
    }

    const isCheckedOut = !!todayRecord?.timeOut

    return (
        <Card className="w-full max-w-md border-primary/20 shadow-lg bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Punch Card
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center space-y-1">
                    <div className="text-4xl font-bold tracking-tight text-primary">
                        {formatTime(currentTime)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {formatDate(currentTime)}
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card/50 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Status</span>
                        {!todayRecord ? (
                            <span className="flex items-center gap-1.5 text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Not Checked In
                            </span>
                        ) : isCheckedOut ? (
                            <span className="flex items-center gap-1.5 text-blue-600 font-semibold bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Completed
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Checked In
                            </span>
                        )}
                    </div>

                    {todayRecord && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">In Time</p>
                                <p className="text-sm font-semibold">
                                    {new Date(todayRecord.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {isCheckedOut && (
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Out Time</p>
                                    <p className="text-sm font-semibold">
                                        {new Date(todayRecord.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!isCheckedOut && (
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="remarks" className="text-xs font-semibold text-muted-foreground">Remarks (Optional)</Label>
                            <Input
                                id="remarks"
                                placeholder="Note for today..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-9"
                            />
                        </div>

                        <Button
                            className="w-full h-14 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md group"
                            disabled={loading}
                            onClick={handleAction}
                            variant={!todayRecord ? "default" : "secondary"}
                        >
                            {loading ? (
                                <Spinner className="mr-2 h-5 w-5" />
                            ) : !todayRecord ? (
                                <>
                                    <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Check In
                                </>
                            ) : (
                                <>
                                    <LogOut className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Check Out
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {isCheckedOut && (
                    <div className="text-center text-xs text-muted-foreground bg-muted/50 py-3 rounded-lg border border-dashed italic">
                        Shift complete. Have a great day!
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
