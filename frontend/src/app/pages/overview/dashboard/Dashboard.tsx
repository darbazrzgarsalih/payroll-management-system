import { PageHeader } from "@/app/components/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    TrendingUp, TrendingDown, Users, Activity, DollarSign,
    UserPlus, PlayCircle, CheckCircle, Clock, AlertCircle,
    CalendarCheck, BadgeDollarSign, UserCheck, UserX, Timer
} from "lucide-react"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useEffect, useState } from "react"
import api from "@/app/services/api"
import { useNavigate } from "react-router-dom"
import { LoadingPage } from "@/app/components/LoadingPage"
import { CheckInOut } from "../../Attendance&time/attendance/CheckInOut"
import type { Attendance } from "../../Attendance&time/attendance/attendance.hooks"


type AdminStats = { totalUsers: number; totalEmployees: number; activeEmployees: number; payrollsThisMonth: number; totalNetPay: number }
type HRStats = { presentToday: number; halfDayToday: number; absentToday: number }
type PayrollStats = { pendingPayrolls: number; totalNetPay: number }
type EmployeeStats = { checkedIn: boolean; todayStatus: string; lastPayslips: number; todayRecord: Attendance | null }
type ChartData = { weeklyAttendance: any[]; todayPie: any[]; payrollTrend: any[]; departmentHeadcount: any[] }

const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#f97316', '#3b82f6']
const tooltipStyle = { backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', fontSize: '12px' }


function useDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [role, setRole] = useState<string>('')
    const [charts, setCharts] = useState<ChartData>({ weeklyAttendance: [], todayPie: [], payrollTrend: [], departmentHeadcount: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAll = async () => {
        setLoading(true)
        try {
            const statsRes = await api.get('/dashboard/stats')
            const data = statsRes.data.stats
            setStats(data)

            let inferredRole = 'employee'
            if ('totalEmployees' in data) inferredRole = 'admin'
            else if ('presentToday' in data) inferredRole = 'hr_manager'
            else if ('pendingPayrolls' in data) inferredRole = 'payroll_manager'
            setRole(inferredRole)

            const isAdmin = inferredRole === 'admin'
            const isHR = inferredRole === 'hr_manager'
            const isPayroll = inferredRole === 'payroll_manager'

            const [weeklyRes, todayRes, payrollRes, deptRes] = await Promise.all([
                (isAdmin || isHR) ? api.get('/dashboard/charts/weekly-attendance') : Promise.resolve(null),
                (isAdmin || isHR) ? api.get('/dashboard/charts/today-attendance') : Promise.resolve(null),
                (isAdmin || isPayroll) ? api.get('/dashboard/charts/payroll-trend') : Promise.resolve(null),
                isAdmin ? api.get('/dashboard/charts/department-headcount') : Promise.resolve(null),
            ])

            setCharts({
                weeklyAttendance: weeklyRes?.data?.data || [],
                todayPie: todayRes?.data?.data || [],
                payrollTrend: payrollRes?.data?.data || [],
                departmentHeadcount: deptRes?.data?.data || [],
            })
        } catch (error: any) {

            console.error("Dashboard error:", error?.response?.data || error?.message || error)
            setError("Could not load dashboard")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAll()
    }, [])

    return { stats, role, charts, loading, error, refetch: fetchAll }
}


function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color }: {
    title: string; value: string | number; subtitle?: string; icon: any
    trend?: 'up' | 'down' | 'neutral'; trendValue?: string; color: string
}) {
    return (
        <Card className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-10 ${color}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`p-2 rounded-lg opacity-80 ${color}`}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center gap-1 mt-1">
                    {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                    {trend === 'down' && <TrendingDown className="h-3 w-3 text-rose-500" />}
                    {trendValue && <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-muted-foreground'}`}>{trendValue}</span>}
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
            </CardContent>
        </Card>
    )
}

function AlertItem({ icon: Icon, title, description, type }: { icon: any; title: string; description: string; type: 'warning' | 'info' | 'error' }) {
    const colors = { warning: 'text-amber-500 bg-amber-50 dark:bg-amber-950', info: 'text-blue-500 bg-blue-50 dark:bg-blue-950', error: 'text-red-500 bg-red-50 dark:bg-red-950' }
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-muted hover:bg-muted/30 transition-colors">
            <div className={`p-1.5 rounded-md mt-0.5 ${colors[type]}`}><Icon className="h-3.5 w-3.5" /></div>
            <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
        </div>
    )
}


function AdminDashboard({ data, charts }: { data: AdminStats; charts: ChartData }) {
    const navigate = useNavigate()
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Employees" value={data.totalEmployees} subtitle="across all departments" icon={Users} trend="up" color="bg-blue-500" />
                <StatCard title="Active Employees" value={data.activeEmployees} subtitle={`of ${data.totalEmployees} total`} icon={UserCheck} color="bg-emerald-500" />
                <StatCard title="Payrolls Approved" value={data.payrollsThisMonth} subtitle="this month" icon={BadgeDollarSign} trend="up" color="bg-violet-500" />
                <StatCard title="Total Net Pay" value={`$${data.totalNetPay.toLocaleString()}`} subtitle="all time" icon={DollarSign} trend="up" color="bg-orange-500" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Attendance This Week</CardTitle>
                        <CardDescription>Daily breakdown — present, late, absent</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={charts.weeklyAttendance} barSize={10}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                    <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} name="Present" />
                                    <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Late" />
                                    <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Today's Attendance</CardTitle>
                        <CardDescription>Live snapshot</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={charts.todayPie} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {charts.todayPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                    </Pie>
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Payroll Cost — Last 6 Months</CardTitle>
                        <CardDescription>Approved & paid payrolls only</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={charts.payrollTrend}>
                                    <defs>
                                        <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, 'Net Pay']} contentStyle={tooltipStyle} />
                                    <Area type="monotone" dataKey="netPay" stroke="#8b5cf6" strokeWidth={2} fill="url(#payrollGrad)" name="Net Pay" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">By Department</CardTitle>
                        <CardDescription>Active employees</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={charts.departmentHeadcount} layout="vertical" barSize={10}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={70} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Employees" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
                <CardContent className="flex gap-2 flex-wrap">
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/app/employees')}><UserPlus className="h-4 w-4" /> Add Employee</Button>
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/app/payroll')}><PlayCircle className="h-4 w-4" /> Run Payroll</Button>
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/app/attendance')}><CalendarCheck className="h-4 w-4" /> View Attendance</Button>
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/app/audit-logs')}><Activity className="h-4 w-4" /> Audit Logs</Button>
                </CardContent>
            </Card>
        </div>
    )
}

function HRDashboard({ data, charts }: { data: HRStats; charts: ChartData }) {
    const total = (data.presentToday + data.halfDayToday + data.absentToday) || 1
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Present Today" value={data.presentToday} subtitle={`${Math.round((data.presentToday / total) * 100)}% of workforce`} icon={UserCheck} trend="up" color="bg-emerald-500" />
                <StatCard title="Half Day" value={data.halfDayToday} subtitle="partial attendance" icon={Timer} color="bg-amber-500" />
                <StatCard title="Absent Today" value={data.absentToday} subtitle={`${Math.round((data.absentToday / total) * 100)}% of workforce`} icon={UserX} trend="down" color="bg-red-500" />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Weekly Attendance Trend</CardTitle>
                        <CardDescription>Last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={charts.weeklyAttendance} barSize={12}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                    <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} name="Present" />
                                    <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Late" />
                                    <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Today Breakdown</CardTitle></CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={charts.todayPie} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {charts.todayPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                    </Pie>
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle className="text-base">Alerts</CardTitle><CardDescription>Things that need your attention</CardDescription></CardHeader>
                <CardContent className="space-y-2">
                    <AlertItem icon={AlertCircle} title="Missing attendance records" description="Some employees have no check-in recorded today" type="warning" />
                    <AlertItem icon={Clock} title="Pending leave requests" description="Awaiting your approval" type="info" />
                    <AlertItem icon={AlertCircle} title="Unapproved overtime" description="Overtime records from last week still pending" type="error" />
                </CardContent>
            </Card>
        </div>
    )
}

function PayrollDashboard({ data, charts }: { data: PayrollStats; charts: ChartData }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <StatCard title="Pending Payrolls" value={data.pendingPayrolls} subtitle="awaiting approval" icon={Clock} trend="down" trendValue="needs action" color="bg-amber-500" />
                <StatCard title="Total Net Pay" value={`$${data.totalNetPay.toLocaleString()}`} subtitle="all payroll items" icon={DollarSign} trend="up" color="bg-violet-500" />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Payroll Cost — Last 6 Months</CardTitle>
                    <CardDescription>Approved & paid payrolls only</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={charts.payrollTrend}>
                                <defs>
                                    <linearGradient id="payrollGrad2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, 'Net Pay']} contentStyle={tooltipStyle} />
                                <Area type="monotone" dataKey="netPay" stroke="#8b5cf6" strokeWidth={2} fill="url(#payrollGrad2)" name="Net Pay" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
                <CardContent className="flex gap-2 flex-wrap">
                    <Button variant="outline" className="gap-2"><PlayCircle className="h-4 w-4" /> Run Payroll</Button>
                    <Button variant="outline" className="gap-2"><CheckCircle className="h-4 w-4" /> Approve Pending</Button>
                    <Button variant="outline" className="gap-2"><BadgeDollarSign className="h-4 w-4" /> View Payslips</Button>
                </CardContent>
            </Card>
        </div>
    )
}

function EmployeeDashboard({ data, onAction }: { data: EmployeeStats; onAction: () => void }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                    <CheckInOut onSuccess={onAction} initialRecord={data.todayRecord} />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <StatCard title="Today's Status" value={data.todayStatus.replace('_', ' ').toUpperCase()} subtitle={data.checkedIn ? "You're checked in" : "Not checked in yet"} icon={data.checkedIn ? CheckCircle : Clock} trend={data.checkedIn ? 'up' : 'down'} color={data.checkedIn ? 'bg-emerald-500' : 'bg-amber-500'} />
                        <StatCard title="Last Payslip" value={`$${data.lastPayslips.toLocaleString()}`} subtitle="net pay" icon={DollarSign} color="bg-violet-500" />
                    </div>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Alerts</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {!data.checkedIn && <AlertItem icon={Clock} title="You haven't checked in today" description="Don't forget to mark your attendance" type="warning" />}
                            <AlertItem icon={BadgeDollarSign} title="Your latest payslip is ready" description="View your net pay for this month" type="info" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}


export default function Dashboard() {
    const { stats, role, charts, loading, error, refetch } = useDashboard()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100)
        return () => clearTimeout(timer)
    }, [])

    if (loading || !mounted) return (
        <LoadingPage />
    )

    if (error) return (
        <div className="flex justify-center items-center h-screen text-muted-foreground">
            <p>{error}</p>
        </div>
    )

    return (
        <div className="space-y-6">
            <PageHeader title="Dashboard" description="Overview of system activity" />
            {role === 'admin' && <AdminDashboard data={stats} charts={charts} />}
            {role === 'hr_manager' && <HRDashboard data={stats} charts={charts} />}
            {role === 'payroll_manager' && <PayrollDashboard data={stats} charts={charts} />}
            {role === 'employee' && <EmployeeDashboard data={stats} onAction={refetch} />}
        </div>
    )
}