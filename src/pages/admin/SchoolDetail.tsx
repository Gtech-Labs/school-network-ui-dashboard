import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Switch} from '@/components/ui/switch';
import {ArrowLeft, Mail, Phone, Globe, MapPin, Award, Edit, Ban, Trash2, Image as ImageIcon, Loader2, School, GraduationCap} from 'lucide-react';
import {toast} from 'sonner';
import {getSchoolFeatures, setSchoolFeatures} from '@/lib/schoolFeatures';
import {useApiQuery} from '@/hooks/use-api-query.ts';
import {useApiMutation} from "@/hooks/use-api-mutation.ts";
import {useQueryClient} from "@tanstack/react-query";
import {useUploadMutation} from "@/hooks/use-upload-mutation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function SchoolDetail() {
    const queryClient = useQueryClient();
    const {id} = useParams();
    const navigate = useNavigate();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const {mutate, isPending, error} = useApiMutation<any>();
    const uploadMutation = useUploadMutation();

    const handleMediaUpload = async (file: File, field: 'logoUrl' | 'bannerUrl') => {
        const uploadToast = toast.loading(`Uploading ${field === 'logoUrl' ? 'logo' : 'banner'}...`);
        
        try {
            const uploadResult = await uploadMutation.mutateAsync({ file });
            const imageUrl = uploadResult.url;

            await mutate({
                method: 'PATCH',
                endpoint: `schools/${id}`,
                data: { [field]: imageUrl }
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['school'] });
                    toast.success(`${field === 'logoUrl' ? 'Logo' : 'Banner'} updated successfully`, { id: uploadToast });
                },
                onError: () => {
                    toast.error(`Failed to update school ${field === 'logoUrl' ? 'logo' : 'banner'}`, { id: uploadToast });
                }
            });
        } catch (error) {
            toast.error(`Failed to upload ${field === 'logoUrl' ? 'logo' : 'banner'}`, { id: uploadToast });
            console.error(error);
        }
    };

    const {data: school, isLoading, isError} = useApiQuery(
        ['school'],
        `/schools/${id}`
    );

    const [features, setFeatures] = useState(() => {
        if (id) return getSchoolFeatures(id);
        return {
            applications: true, students: true, teachers: true, parents: true, payments: true,
            academicProgress: true, attendance: true, calendar: true, timetable: true,
            announcements: true, activityLog: true,
        };
    });

    useEffect(() => {
        if (id) {
            const loadedFeatures = getSchoolFeatures(id);
            setFeatures(loadedFeatures);
        }
    }, [id]);

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!school) return (
        <div className="space-y-6 animate-fade-in">
            <Button variant="outline" onClick={() => navigate('/admin/schools')}>
                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Schools
            </Button>
            <Card className="border-dashed h-40 flex items-center justify-center">
                <p className="text-muted-foreground">School not found</p>
            </Card>
        </div>
    );

    const handleEdit = () => setEditDialogOpen(true);

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const rawData = Object.fromEntries(formData.entries());

        const formatArray = (value: any) => {
            if (!value) return [];
            return String(value).split(',').map(item => item.trim()).filter(item => item !== "");
        };

        const payload = {
            ...rawData,
            passRate: parseFloat(rawData.passRate as string) || 0,
            annualFees: parseInt(rawData.annualFees as string) || 0,
            phase: formatArray(rawData.phase),
            gradesOffered: formatArray(rawData.gradesOffered),
            facilities: formatArray(rawData.facilities),
            extracurriculars: formatArray(rawData.extracurriculars),
        };

        mutate({method: 'PATCH', endpoint: `schools/${id}`, data: payload}, {
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: ['school']});
                toast.success(`${payload.name} updated successfully`);
                setEditDialogOpen(false);
            },
            onError: (err) => {
                toast.error("Failed to update school");
                console.error(err);
            }
        });
    };

    const handleSuspend = () => {
        mutate({
            method: 'PATCH',
            endpoint: `schools/${id}`,
            data: { schoolStatus: school.schoolStatus === 'Active' ? 'Suspended' : 'Active' }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: ['school']});
                toast.success(`${school.name} has been ${school.schoolStatus === 'Active' ? 'suspended' : 'activated'}`);
            }
        });
    };
    const handleDelete = () => {
        mutate({method: 'DELETE', endpoint: `schools/${id}`, data: {}}, {
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: ['schools']});
                toast.success(`${school.name} deleted`);
                navigate('/admin/schools');
            }
        });
    };

    const handleFeatureToggle = (feature: keyof typeof features) => {
        if (!id) return;
        const newFeatures = { ...features, [feature]: !features[feature] };
        setFeatures(newFeatures);
        setSchoolFeatures(id, newFeatures);
        toast.success(`${feature} ${!features[feature] ? 'enabled' : 'disabled'}`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Navigation & Actions Top Bar */}
            <div className="flex items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 border-b -mx-6 px-6">
                <Button variant="ghost" onClick={() => navigate('/admin/schools')} className="hover:bg-transparent -ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    <span className="font-semibold">Schools</span>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4"/> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSuspend}>
                        {school.schoolStatus === 'Active' ? <Ban className="mr-2 h-4 w-4"/> : <Award className="mr-2 h-4 w-4"/>}
                        {school.schoolStatus === 'Active' ? 'Suspend' : 'Activate'}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                    </Button>
                </div>
            </div>

            {/* Hero Banner Section */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border bg-muted">
                {/* Banner Background */}
                <div className="h-64 md:h-80 w-full relative group">
                    {school.bannerUrl ? (
                        <img src={school.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary/20 via-primary/10 to-background flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-primary/20" />
                        </div>
                    )}
                    <div 
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center cursor-pointer"
                        onClick={() => document.getElementById('hero-banner-upload')?.click()}
                    >
                        <Button variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            Change Banner
                        </Button>
                        <input id="hero-banner-upload" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0], 'bannerUrl')} />
                    </div>
                </div>

                {/* Profile Overlay */}
                <div className="px-8 pb-8 pt-0 relative">
                    <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 md:-mt-20 relative z-10">
                        {/* Logo Container */}
                        <div 
                            className="relative h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-background bg-card shadow-xl overflow-hidden group cursor-pointer"
                            onClick={() => document.getElementById('hero-logo-upload')?.click()}
                        >
                            {school.logoUrl ? (
                                <img src={school.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <School className="h-12 w-12 text-muted-foreground" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ImageIcon className="h-6 w-6 text-white" />
                            </div>
                            <input id="hero-logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0], 'logoUrl')} />
                        </div>

                        {/* Title & Stats */}
                        <div className="flex-1 space-y-2 mb-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">{school.name}</h1>
                                <div className="flex gap-2">
                                    <Badge variant={school.schoolStatus === 'Active' ? 'default' : 'destructive'} className="rounded-full px-4">
                                        {school.schoolStatus}
                                    </Badge>
                                    <Badge variant="secondary" className="rounded-full px-4">{school.type}</Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {school.province}, {school.municipality}
                                </div>
                                <div className="flex items-center gap-1.5 text-primary">
                                    <Globe className="h-4 w-4" />
                                    {school.website || 'No website'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
                            <TabsTrigger value="overview" className="rounded-lg px-6 py-2">Overview</TabsTrigger>
                            <TabsTrigger value="features" className="rounded-lg px-6 py-2">Features</TabsTrigger>
                            <TabsTrigger value="academic" className="rounded-lg px-6 py-2">Academics</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <Card className="border-none bg-muted/30 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-xl">About the Institution</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pass Rate</p>
                                            <p className="text-2xl font-bold text-primary">{school.passRate || 'N/A'}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Annual Fees</p>
                                            <p className="text-2xl font-bold">R{(school.annualFees || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Capacity</p>
                                            <p className="text-2xl font-bold">1,200</p>
                                        </div>
                                    </div>
                                    
                                    <Separator className="opacity-50" />
                                    
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold">Admission Requirements</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                                            {school.admissionRequirements || "Standard requirements apply. Contact administration for details."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="border-none bg-muted/30 shadow-none">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <Award className="h-4 w-4 text-primary" />
                                            Phases Offered
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {school.phase?.map(p => <Badge key={p} variant="outline" className="bg-background">{p}</Badge>) || 'None'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-none bg-muted/30 shadow-none">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                            Grades
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {school.gradesOffered?.map(g => <Badge key={g} variant="outline" className="bg-background">{g}</Badge>) || 'None'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="features" className="space-y-6">
                            <Card className="border-none bg-muted/30 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-xl">Dashboard Capabilities</CardTitle>
                                    <p className="text-sm text-muted-foreground">Manage specific module access for this school's dashboard.</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(features).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/40 hover:border-primary/40 transition-colors">
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                    <p className="text-xs text-muted-foreground">Enable module access</p>
                                                </div>
                                                <Switch checked={value} onCheckedChange={() => handleFeatureToggle(key as keyof typeof features)} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="academic" className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-none bg-muted/30 shadow-none">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Facilities</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {school.facilities?.map(f => (
                                                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    {f}
                                                </li>
                                            )) || <p className="text-sm italic">No facilities listed</p>}
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card className="border-none bg-muted/30 shadow-none">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Extracurriculars</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {school.extracurriculars?.map(e => (
                                                <li key={e} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    {e}
                                                </li>
                                            )) || <p className="text-sm italic">No activities listed</p>}
                                        </ul>
                                    </CardContent>
                                </Card>
                             </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Quick Contacts & Meta */}
                <div className="space-y-6">
                    <Card className="border shadow-lg bg-card">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Contacts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium truncate">{school.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-muted-foreground">Phone</p>
                                        <p className="text-sm font-medium">{school.contactNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group border-t pt-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-muted-foreground">Address</p>
                                        <p className="text-sm font-medium leading-tight">{school.address}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border bg-primary/5 dark:bg-primary/10 border-primary/10">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Tenant ID</span>
                                <Badge variant="outline" className="font-mono text-[10px]">{school.tenant_id || 'N/A'}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">System Entry</span>
                                <span className="font-semibold">{new Date(school.createdAt).toLocaleDateString()}</span>
                            </div>
                            <Separator />
                            <div className="text-center">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">School ID</p>
                                <p className="text-[10px] font-mono text-muted-foreground truncate px-4">{school.id}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit School Details</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">School Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. St. Mary High School"
                                    defaultValue={school.name}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">School Type *</Label>
                                <Input
                                    id="type"
                                    name="type"
                                    placeholder="Public / Private / Independent"
                                    defaultValue={school.type}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">School Email *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@school.co.za"
                                    defaultValue={school.email}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactNumber">Contact Number *</Label>
                                <Input
                                    id="contactNumber"
                                    name="contactNumber"
                                    type="tel"
                                    placeholder="+27..."
                                    defaultValue={school.contactNumber}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website URL</Label>
                            <Input
                                id="website"
                                name="website"
                                type="url"
                                placeholder="https://www.example.co.za"
                                defaultValue={school.website}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Street Address *</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="123 Education St, Suburb"
                                defaultValue={school.address}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="province">Province</Label>
                                <Input
                                    id="province"
                                    name="province"
                                    placeholder="e.g. Gauteng"
                                    defaultValue={school.province}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="municipality">Municipality</Label>
                                <Input
                                    id="municipality"
                                    name="municipality"
                                    placeholder="e.g. City of Johannesburg"
                                    defaultValue={school.municipality}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="passRate">Pass Rate (%)</Label>
                                <Input
                                    id="passRate"
                                    name="passRate"
                                    type="number"
                                    step="0.1"
                                    placeholder="0.0"
                                    defaultValue={school.passRate}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="annualFees">Annual Fees</Label>
                                <Input
                                    id="annualFees"
                                    name="annualFees"
                                    type="number"
                                    placeholder="30000"
                                    defaultValue={school.annualFees}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">School Image URL</Label>
                                <Input
                                    id="imageUrl"
                                    name="imageUrl"
                                    type="url"
                                    placeholder="https://path-to-image.jpg"
                                    defaultValue={school.imageUrl}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admissionRequirements">Admission Requirements</Label>
                            <Textarea
                                id="admissionRequirements"
                                name="admissionRequirements"
                                placeholder="List required documents..."
                                defaultValue={school.admissionRequirements}
                                className="min-h-[80px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phase">Phases</Label>
                                <Input
                                    id="phase"
                                    name="phase"
                                    placeholder="Primary, High School..."
                                    defaultValue={school.phase?.join(", ")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gradesOffered">Grades Offered</Label>
                                <Input
                                    id="gradesOffered"
                                    name="gradesOffered"
                                    placeholder="Grade R, 1, 2..."
                                    defaultValue={school.gradesOffered?.join(", ")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facilities">Facilities</Label>
                                <Input
                                    id="facilities"
                                    name="facilities"
                                    placeholder="Library, Lab, Gym..."
                                    defaultValue={school.facilities?.join(", ")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="extracurriculars">Extracurriculars</Label>
                                <Input
                                    id="extracurriculars"
                                    name="extracurriculars"
                                    placeholder="Soccer, Debate, Art..."
                                    defaultValue={school.extracurriculars?.join(", ")}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1" disabled={isPending}> {isPending ? '... updating': 'Update School' }</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditDialogOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
