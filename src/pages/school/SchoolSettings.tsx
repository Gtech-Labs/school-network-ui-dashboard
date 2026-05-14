import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSchoolId } from '@/hooks/schools/school.hook';
import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { useUploadMutation } from '@/hooks/use-upload-mutation';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
    Image as ImageIcon, 
    Upload, 
    School, 
    Globe, 
    Mail, 
    Phone, 
    MapPin, 
    BookOpen, 
    GraduationCap,
    Loader2,
    Info
} from 'lucide-react';

export default function SchoolSettings() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const schoolId = useSchoolId(user?.sub);
    const [activeTab, setActiveTab] = useState('general');

    const { data: school, isLoading: isSchoolLoading } = useApiQuery<any>(
        ['school', schoolId], 
        `/schools/${schoolId}`, 
        { enabled: !!schoolId }
    );

    const { mutate: updateSchool, isPending: isUpdating } = useApiMutation();
    const uploadMutation = useUploadMutation();

    const handleMediaUpload = async (file: File, field: 'logoUrl' | 'bannerUrl') => {
        const uploadToast = toast.loading(`Uploading ${field === 'logoUrl' ? 'Logo' : 'Banner'}...`);
        
        try {
            const uploadResult = await uploadMutation.mutateAsync({ file });
            const uploadedUrl = uploadResult.url;

            // Prepare update data
            const updateData: any = { [field]: uploadedUrl };
            
            // If we're uploading a banner, also update imageUrl as it's the primary display image
            if (field === 'bannerUrl') {
                updateData.imageUrl = uploadedUrl;
            }

            updateSchool({
                method: 'PATCH',
                endpoint: `schools/${schoolId}`,
                data: updateData
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['school', schoolId] });
                    toast.success(`${field === 'logoUrl' ? 'Logo' : 'Banner'} updated successfully`, { id: uploadToast });
                },
                onError: (error) => {
                    console.error('Update failed:', error);
                    toast.error(`Failed to save ${field === 'logoUrl' ? 'logo' : 'banner'} to profile`, { id: uploadToast });
                }
            });
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error(`Image upload failed. Please try again.`, { id: uploadToast });
        }
    };

    const handleGeneralUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Helper for arrays
        const toArray = (val: any) => String(val).split(',').map(s => s.trim()).filter(Boolean);

        const payload = {
            ...data,
            phase: toArray(data.phase),
            gradesOffered: toArray(data.gradesOffered),
            facilities: toArray(data.facilities),
            extracurriculars: toArray(data.extracurriculars),
        };

        updateSchool({
            method: 'PATCH',
            endpoint: `schools/${schoolId}`,
            data: payload
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['school', schoolId] });
                toast.success('Settings updated successfully');
            },
            onError: () => toast.error('Failed to update settings')
        });
    };

    if (isSchoolLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!school) return (
        <div className="p-8 text-center text-muted-foreground">
            School information not available.
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">School Settings</h1>
                <p className="text-muted-foreground">Manage your school's public profile and branding.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-xl mb-8">
                    <TabsTrigger value="general" className="rounded-lg px-8 py-2">General</TabsTrigger>
                    <TabsTrigger value="academic" className="rounded-lg px-8 py-2">Academic</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg px-8 py-2">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Branding Sidebar */}
                        <div className="space-y-6">
                            <Card className="overflow-hidden border-2 border-muted">
                                <CardHeader className="bg-muted/30">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Branding & Media
                                    </CardTitle>
                                    <CardDescription className="text-[10px]">
                                        Visible on the mobile app and student portals.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    {/* Logo */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School Logo</Label>
                                        <div 
                                            className="group relative h-32 w-32 mx-auto rounded-2xl border-2 border-dashed flex items-center justify-center bg-muted/50 cursor-pointer overflow-hidden transition-all hover:bg-muted"
                                            onClick={() => document.getElementById('logo-input')?.click()}
                                        >
                                            {school.logoUrl ? (
                                                <img src={school.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <School className="h-8 w-8 text-muted-foreground/40" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                                                <Upload className="h-5 w-5 text-white mb-1" />
                                                <span className="text-[10px] text-white font-medium">Update</span>
                                            </div>
                                            <input id="logo-input" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0], 'logoUrl')} />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Banner */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cover Banner</Label>
                                        <div 
                                            className="group relative aspect-video w-full rounded-xl border-2 border-dashed flex items-center justify-center bg-muted/50 cursor-pointer overflow-hidden transition-all hover:bg-muted"
                                            onClick={() => document.getElementById('banner-input')?.click()}
                                        >
                                            {school.bannerUrl ? (
                                                <img src={school.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                                                <Upload className="h-5 w-5 text-white mb-1" />
                                                <span className="text-[10px] text-white font-medium">Update</span>
                                            </div>
                                            <input id="banner-input" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0], 'bannerUrl')} />
                                        </div>
                                    </div>

                                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                        <div className="flex items-start gap-2">
                                            <Info className="h-4 w-4 text-primary mt-0.5" />
                                            <p className="text-[10px] text-primary/80 leading-relaxed font-medium">
                                                High-quality images help your school stand out to potential students and parents.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Settings Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleGeneralUpdate} className="space-y-6">
                                <Card className="border-none shadow-none bg-transparent">
                                    <CardContent className="p-0 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">School Name</Label>
                                                <Input id="name" name="name" defaultValue={school.name} placeholder="e.g. Green Valley Academy" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="type">School Type</Label>
                                                <Input id="type" name="type" defaultValue={school.type} placeholder="Public / Private" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">School Description</Label>
                                            <Textarea 
                                                id="description" 
                                                name="description" 
                                                defaultValue={school.description} 
                                                placeholder="A brief overview of your school's mission and history..."
                                                className="min-h-[120px] resize-none"
                                            />
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                                                </Label>
                                                <Input name="email" type="email" defaultValue={school.email} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone
                                                </Label>
                                                <Input name="contactNumber" defaultValue={school.contactNumber} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Website
                                                </Label>
                                                <Input name="website" type="url" defaultValue={school.website} placeholder="https://..." />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Address
                                            </Label>
                                            <Input name="address" defaultValue={school.address} placeholder="Street address, Suburb" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Province</Label>
                                                <Input name="province" defaultValue={school.province} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Municipality</Label>
                                                <Input name="municipality" defaultValue={school.municipality} />
                                            </div>
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" /> Phases Offered
                                                </Label>
                                                <Input name="phase" defaultValue={school.phase?.join(', ')} placeholder="Primary, High School" />
                                                <p className="text-[10px] text-muted-foreground italic">Comma separated</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" /> Grades Offered
                                                </Label>
                                                <Input name="gradesOffered" defaultValue={school.gradesOffered?.join(', ')} placeholder="Grade 1, Grade 2" />
                                                <p className="text-[10px] text-muted-foreground italic">Comma separated</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Facilities</Label>
                                                <Input name="facilities" defaultValue={school.facilities?.join(', ')} placeholder="Library, Lab, Gym" />
                                                <p className="text-[10px] text-muted-foreground italic">Comma separated</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Extracurricular Activities</Label>
                                                <Input name="extracurriculars" defaultValue={school.extracurriculars?.join(', ')} placeholder="Soccer, Debate, Art" />
                                                <p className="text-[10px] text-muted-foreground italic">Comma separated</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={isUpdating} className="px-10">
                                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="academic">
                    <Card className="border-dashed h-60 flex flex-col items-center justify-center text-center">
                        <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-4" />
                        <CardTitle className="text-muted-foreground">Academic Configuration</CardTitle>
                        <CardDescription>Curriculum settings and subject management coming soon.</CardDescription>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="border-dashed h-60 flex flex-col items-center justify-center text-center">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground/40">
                             <span className="font-bold">!</span>
                        </div>
                        <CardTitle className="text-muted-foreground">Security & Access</CardTitle>
                        <CardDescription>Two-factor authentication and role management coming soon.</CardDescription>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
