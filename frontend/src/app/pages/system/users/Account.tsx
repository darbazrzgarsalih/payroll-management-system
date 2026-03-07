import { useEffect, useState } from "react";
import api from "@/app/services/api";
import { PageHeader } from "@/app/components/PageHeader";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserCircle02Icon } from "@hugeicons/core-free-icons";

export default function Account() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile');
                setProfile(res.data.user);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="flex justify-center mt-20"><Spinner /></div>;
    if (error) return <div className="text-center text-red-500 mt-20">{error}</div>;
    if (!profile) return null;

    const actualAvatar = profile.avatar || profile.employee?.personalInfo?.avatar;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader title="My Account" description="View your system profile and employment details." />

            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Your system credentials and role</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border">
                        {actualAvatar ? (
                            <img
                                key={actualAvatar}
                                src={actualAvatar.startsWith('http') ? actualAvatar : `${(import.meta.env.VITE_BACKEND_URL?.replace('/api/v1', '') || 'http://localhost:8000').replace(/\/+$/, '')}/${actualAvatar.replace(/^\/+/, '')}`}
                                alt={profile.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <HugeiconsIcon icon={UserCircle02Icon} className="w-12 h-12 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{[profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ')}</h3>
                        <p className="text-muted-foreground">@{profile.username}</p>
                        <div className="mt-2 text-sm space-y-1">
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Role:</strong> <span className="uppercase">{profile.role.replace('_', ' ')}</span></p>
                            <p><strong>Status:</strong> {profile.status}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {profile.employee && (
                <Card>
                    <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                        <CardDescription>Your registered employee record</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground mb-1">Department</p>
                            <p className="font-medium">{profile.employee?.employmentInfo?.departmentID?.name || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Position</p>
                            <p className="font-medium">{profile.employee?.employmentInfo?.positionID?.title || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Manager</p>
                            <p className="font-medium">
                                {profile.employee?.employmentInfo?.managerID
                                    ? [profile.employee.employmentInfo.managerID.personalInfo.firstName, profile.employee.employmentInfo.managerID.personalInfo.middleName, profile.employee.employmentInfo.managerID.personalInfo.lastName].filter(Boolean).join(' ')
                                    : "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Hire Date</p>
                            <p className="font-medium">{profile.employee?.employmentInfo?.hireDate ? new Date(profile.employee.employmentInfo.hireDate).toLocaleDateString() : "N/A"}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
