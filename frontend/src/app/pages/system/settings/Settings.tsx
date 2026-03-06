import React, { useState, useEffect } from 'react';
import { useSettings, type SettingsData } from './settings.hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Upload, Building2, MapPin, Globe, Mail, Phone, Save } from 'lucide-react';

const Settings = () => {
    const { settings, loading, error, updateSettings, updateLoading } = useSettings();
    const [formData, setFormData] = useState<Partial<SettingsData>>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (settings) {
            setFormData(settings);
            if (settings.companyLogo) {
                if (settings.companyLogo.startsWith('http')) {
                    setLogoPreview(settings.companyLogo);
                } else {
                    const baseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').replace('/api/v1', '').replace(/\/+$/, '');
                    // Strip 'backend/' and leading slashes for consistent relative paths
                    const cleanPath = settings.companyLogo.replace(/^backend\//, '').replace(/^\/+/, '');
                    setLogoPreview(`${baseUrl}/${cleanPath}`);
                }
            }
        }
    }, [settings]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        await updateSettings(formData, logoFile || undefined);
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Spinner className="h-8 w-8" /></div>;

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure your company branding and identity for the whole platform.</p>
                </div>
                <Button onClick={handleSubmit} disabled={updateLoading} className="w-full md:w-auto gap-2 h-11 px-6 shadow-lg transition-all hover:scale-[1.02]">
                    {updateLoading ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg mb-6 text-sm font-medium">
                    {error}
                </div>
            )}

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
                    <TabsTrigger value="general" className="gap-2"><Building2 className="h-4 w-4" />General</TabsTrigger>
                    <TabsTrigger value="address" className="gap-2"><MapPin className="h-4 w-4" />Address</TabsTrigger>
                    <TabsTrigger value="contact" className="gap-2"><Globe className="h-4 w-4" />Contact</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Company Identity</CardTitle>
                            <CardDescription>How your company appears on reports, payslips and the dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="space-y-3 w-full md:w-1/3">
                                    <Label>Company Logo</Label>
                                    <div className="relative group border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors aspect-square">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="max-h-32 object-contain" />
                                        ) : (
                                            <div className="flex flex-col items-center text-muted-foreground">
                                                <Upload className="h-8 w-8 mb-2" />
                                                <span className="text-xs">No logo uploaded</span>
                                            </div>
                                        )}
                                        <Input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleLogoChange}
                                            accept="image/*"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white pointer-events-none">
                                            <span className="text-sm font-medium">Click to upload</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-center">Recommended: Square SVG or PNG (Max 5MB)</p>
                                </div>

                                <div className="flex-1 space-y-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="companyName">Legal Company Name</Label>
                                        <Input
                                            id="companyName"
                                            name="companyName"
                                            value={formData.companyName || ''}
                                            onChange={handleTextChange}
                                            placeholder="e.g. Acme Corporation Ltd."
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="companyTitle">System Subtitle</Label>
                                        <Input
                                            id="companyTitle"
                                            name="companyTitle"
                                            value={formData.companyTitle || ''}
                                            onChange={handleTextChange}
                                            placeholder="e.g. Payroll Management System"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="address" className="space-y-6">
                    <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Registered Address</CardTitle>
                            <CardDescription>This address will be displayed on all official company documents.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="companyAddress.street">Street Address</Label>
                                <Input
                                    id="companyAddress.street"
                                    name="companyAddress.street"
                                    value={formData.companyAddress?.street || ''}
                                    onChange={handleTextChange}
                                    placeholder="123 Business St."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="companyAddress.city">City</Label>
                                    <Input
                                        id="companyAddress.city"
                                        name="companyAddress.city"
                                        value={formData.companyAddress?.city || ''}
                                        onChange={handleTextChange}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="companyAddress.state">State / Province</Label>
                                    <Input
                                        id="companyAddress.state"
                                        name="companyAddress.state"
                                        value={formData.companyAddress?.state || ''}
                                        onChange={handleTextChange}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="companyAddress.zipCode">Zip / Post Code</Label>
                                    <Input
                                        id="companyAddress.zipCode"
                                        name="companyAddress.zipCode"
                                        value={formData.companyAddress?.zipCode || ''}
                                        onChange={handleTextChange}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="companyAddress.country">Country</Label>
                                    <Input
                                        id="companyAddress.country"
                                        name="companyAddress.country"
                                        value={formData.companyAddress?.country || ''}
                                        onChange={handleTextChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-6">
                    <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Communication</CardTitle>
                            <CardDescription>General contact details for official inquiries.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="companyContact.email" className="flex items-center gap-2"><Mail className="h-3 w-3" />Email</Label>
                                <Input
                                    id="companyContact.email"
                                    name="companyContact.email"
                                    value={formData.companyContact?.email || ''}
                                    onChange={handleTextChange}
                                    placeholder="hr@company.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="companyContact.phone" className="flex items-center gap-2"><Phone className="h-3 w-3" />Phone</Label>
                                <Input
                                    id="companyContact.phone"
                                    name="companyContact.phone"
                                    value={formData.companyContact?.phone || ''}
                                    onChange={handleTextChange}
                                    placeholder="+44 20 1234 5678"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="companyContact.website" className="flex items-center gap-2"><Globe className="h-3 w-3" />Website</Label>
                                <Input
                                    id="companyContact.website"
                                    name="companyContact.website"
                                    value={formData.companyContact?.website || ''}
                                    onChange={handleTextChange}
                                    placeholder="https://www.company.com"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;
