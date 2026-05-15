import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {mockSchools} from '@/lib/mockData';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Search, MoreVertical, Plus, Upload, School, MapPin, BookOpen, ChevronRight, ChevronLeft, CheckCircle2, ChevronDown} from 'lucide-react';
import {useApiQuery} from "@/hooks/use-api-query.ts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {toast} from 'sonner';
import {SchoolPayload} from "@/pages/interfaces/school.interface.ts";
import {useApiMutation} from "@/hooks/use-api-mutation.ts";
import {useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@/context/AuthContext.tsx";

export default function AdminSchools() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const {mutate, isPending, error : createSchoolError} = useApiMutation<never>();
    const queryClient = useQueryClient();
    const {user} = useAuth();

    const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formDataObj = new FormData(e.currentTarget);
        const data = Object.fromEntries(formDataObj);
        
        if (formDataObj.has('phase')) {
            data.phase = formDataObj.getAll('phase').join(', ');
        }
        
        setFormData((prev) => ({ ...prev, ...data }));
        setStep(prev => prev + 1);
    };

    const {data: schools, isLoading, isError, error} = useApiQuery<any[]>(
        ['schools'],
        '/schools',
        {
            staleTime: 1000 * 60 // 1 minute
        }
    );

    console.log("Schools,", schools)
    const filteredSchools = schools?.filter((school) =>
        school?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formDataObj = new FormData(e.currentTarget);
        const step2Data = Object.fromEntries(formDataObj);
        step2Data.phase = formDataObj.getAll('phase').join(', ');
        const finalData : any = { ...formData, ...step2Data };

        // Transform into Swagger-Compliant DTO
        const payload  = {
            name: finalData.name,
            address: finalData.address,
            province: finalData.province,
            createdById : user?.sub,
            municipality: finalData.municipality,
            type: finalData.type,
            tenant_id: finalData.tenant_id,
            contactNumber: finalData.contactNumber,
            email: finalData.email,
            website: finalData.website,
            annualFees: finalData.annualFees ? Number(finalData.annualFees) : undefined,
            admissionRequirements: finalData.admissionRequirements,
            passRate: finalData.passRate ? parseFloat(String(finalData.passRate)) : undefined,
            curriculum: finalData.curriculum && finalData.curriculum !== "" ? finalData.curriculum : undefined,
            imageUrl: finalData.imageUrl || "https://cdn.example.com/school.jpg",
            phase: finalData.phase ? String(finalData.phase).split(',').map(s => s.trim()) : undefined,
            gradesOffered: finalData.gradesOffered ? String(finalData.gradesOffered).split(',').map(s => s.trim()) : undefined,
            facilities: finalData.facilities ? String(finalData.facilities).split(',').map(s => s.trim()) : undefined,
            subjects: finalData.subjects ? String(finalData.subjects).split(',').map(item => {
                const [name, code] = item.split(':');
                return { name: name?.trim(), code: code?.trim() };
            }) : undefined,
        };

        //call mutation
        mutate({method: 'POST', endpoint: `schools`, data: payload}, {
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: ['schools']}).then(r => console.log('invalidated'));
                toast.success(`${payload.name} successfully created`);
                setFormData({});
                setStep(1);
                setAddDialogOpen(false);
            },
            onError: (err) => {
                toast.error("Failed to update school");
                console.error(err);
            }
        });
        console.log('API Payload:', JSON.stringify(payload, null, 2));
    };

    const handleViewSchool = (schoolId: string) => {
        navigate(`/admin/schools/${schoolId}`);
    };

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">School Management</h2>
                        <p className="text-muted-foreground">Manage all registered schools</p>
                    </div>
                    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4"/>
                                Add New School
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl sm:rounded-3xl shadow-2xl border-0">
                            <div className="bg-muted/30 px-8 py-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 backdrop-blur-sm">
                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <School className="h-5 w-5 text-primary" />
                                    </div>
                                    Register New School
                                </DialogTitle>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <span className={`px-2 py-1 rounded-md transition-colors ${step === 1 ? 'bg-primary/10 text-primary font-bold' : ''}`}>Identity</span>
                                    <ChevronRight className="h-3 w-3 opacity-50" />
                                    <span className={`px-2 py-1 rounded-md transition-colors ${step === 2 ? 'bg-primary/10 text-primary font-bold' : ''}`}>Location</span>
                                    <ChevronRight className="h-3 w-3 opacity-50" />
                                    <span className={`px-2 py-1 rounded-md transition-colors ${step === 3 ? 'bg-primary/10 text-primary font-bold' : ''}`}>Academic</span>
                                </div>
                            </div>
                            <form onSubmit={step < 3 ? handleNext : handleSubmit} className="p-8">
                                <div className="min-h-[320px]">
                                    {step === 1 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                                <School className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="text-base font-semibold">Identity & Contact</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">School Name <span className="text-destructive">*</span></Label>
                                                    <Input name="name" placeholder="e.g. Green Valley Academy" required defaultValue={(formData as any).name} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tenant ID <span className="text-destructive">*</span></Label>
                                                    <Input name="tenant_id" placeholder="e.g. GVA_HS" required defaultValue={(formData as any).tenant_id} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address <span className="text-destructive">*</span></Label>
                                                    <Input name="email" type="email" placeholder="contact@school.com" required defaultValue={(formData as any).email} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                                                    <Input name="contactNumber" placeholder="+27 83 123 4567" defaultValue={(formData as any).contactNumber} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Website</Label>
                                                    <Input name="website" type="url" placeholder="https://..." defaultValue={(formData as any).website} className="bg-muted/20" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="text-base font-semibold">Location & Type</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Address</Label>
                                                    <Input name="address" placeholder="123 Main St, Suburb" defaultValue={(formData as any).address} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Province</Label>
                                                    <Input name="province" placeholder="Gauteng" defaultValue={(formData as any).province} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Municipality</Label>
                                                    <Input name="municipality" placeholder="City of Johannesburg" defaultValue={(formData as any).municipality} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">School Type</Label>
                                                    <div className="relative">
                                                        <Select name="type" defaultValue={(formData as any).type || "Public"}>
                                                            <SelectTrigger className="h-10 w-full rounded-xl border-input bg-muted/20 px-4 py-2 hover:border-primary/50 transition-colors cursor-pointer">
                                                                <SelectValue placeholder="Select Type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Public">Public</SelectItem>
                                                                <SelectItem value="Private">Private</SelectItem>
                                                                <SelectItem value="Independent">Independent</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="text-base font-semibold">Academic & Operations</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2 col-span-2 p-5 rounded-2xl border bg-primary/5 border-primary/10 shadow-sm relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                        <BookOpen className="w-24 h-24" />
                                                    </div>
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-primary">Curriculum Setup</Label>
                                                    <div className="relative mt-2">
                                                        <Select name="curriculum" defaultValue={(formData as any).curriculum || ""}>
                                                            <SelectTrigger className="h-11 w-full rounded-xl border-primary/30 bg-background px-4 py-2 hover:border-primary transition-colors cursor-pointer shadow-sm relative z-10">
                                                                <SelectValue placeholder="Select a Master Curriculum..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="CAPS">CAPS (South Africa)</SelectItem>
                                                                <SelectItem value="IEB">IEB</SelectItem>
                                                                <SelectItem value="Cambridge">Cambridge</SelectItem>
                                                                <SelectItem value="IB">International Baccalaureate (IB)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-1.5 font-medium flex items-center gap-1.5">
                                                        <BookOpen className="h-3 w-3" />
                                                        This automatically generates and links master subjects.
                                                    </p>
                                                </div>

                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phases Offered</Label>
                                                    <div className="flex flex-wrap gap-3 mt-3">
                                                        {['Creche', 'Primary', 'High School'].map(phase => (
                                                            <div key={phase} className="relative">
                                                                <input 
                                                                    type="checkbox" 
                                                                    name="phase" 
                                                                    value={phase} 
                                                                    id={`phase-${phase}`} 
                                                                    defaultChecked={(formData as any).phase?.includes(phase)}
                                                                    className="peer sr-only"
                                                                />
                                                                <label 
                                                                    htmlFor={`phase-${phase}`} 
                                                                    className="flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-full border-2 border-border/60 bg-muted/30 text-muted-foreground transition-all hover:bg-muted cursor-pointer peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-checked:shadow-sm"
                                                                >
                                                                    {phase}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grades Offered</Label>
                                                    <Input name="gradesOffered" placeholder="e.g. R, 1, 2, 12" defaultValue={(formData as any).gradesOffered} className="bg-muted/20" />
                                                </div>
                                                
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pass Rate (%)</Label>
                                                    <Input name="passRate" type="number" step="0.1" placeholder="e.g. 98.5" defaultValue={(formData as any).passRate} className="bg-muted/20" />
                                                </div>

                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Annual Fees</Label>
                                                    <Input name="annualFees" type="number" placeholder="e.g. 35000" defaultValue={(formData as any).annualFees} className="bg-muted/20" />
                                                </div>

                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facilities</Label>
                                                    <Input name="facilities" placeholder="Library, Lab, Gym" defaultValue={(formData as any).facilities} className="bg-muted/20" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t mt-8">
                                    <Button type="button" variant="ghost" onClick={() => {
                                        if (step > 1) setStep(step - 1);
                                        else setAddDialogOpen(false);
                                    }} className="text-muted-foreground hover:text-foreground">
                                        {step > 1 ? (
                                            <><ChevronLeft className="mr-2 h-4 w-4" /> Back</>
                                        ) : 'Cancel'}
                                    </Button>
                                    
                                    <Button type="submit" disabled={isPending} className="px-8 shadow-md rounded-full font-semibold transition-all hover:scale-105 active:scale-95">
                                        {step < 3 ? (
                                            <>Next Step <ChevronRight className="ml-2 h-4 w-4" /></>
                                        ) : isPending ? (
                                            'Registering...'
                                        ) : (
                                            <><CheckCircle2 className="mr-2 h-4 w-4" /> Complete Registration</>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                <Input
                                    placeholder="Search schools..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    {isLoading && <p>Loading...</p>}
                    {isError && <p>Error: {error.message}</p>}
                    {filteredSchools && filteredSchools.length > 0 && (
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="pb-3 text-left font-medium">School Name</th>
                                        <th className="pb-3 text-left font-medium">Email</th>
                                        <th className="pb-3 text-left font-medium">Type</th>
                                        <th className="pb-3 text-left font-medium">Students</th>
                                        <th className="pb-3 text-left font-medium">Status</th>
                                        <th className="pb-3 text-right font-medium">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredSchools.map((school) => (
                                        <tr
                                            key={school.id}
                                            className="border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => handleViewSchool(school.id)}
                                        >
                                            <td className="py-4 font-medium">{school?.name}</td>
                                            <td className="py-4 text-sm text-muted-foreground">{school?.email}</td>
                                            <td className="py-4">
                                                <Badge variant={
                                                    school?.type === 'Public' ? 'default' :
                                                        school?.type === 'Private' ? 'secondary' : 'outline'
                                                }>
                                                    {school?.type}
                                                </Badge>
                                            </td>
                                            <td className="py-4">{school.studentsCount ? school.studentsCount : '974'}</td>
                                            <td className="py-4">
                                                <Badge variant={
                                                    school?.schoolStatus === 'Active' ? 'default' :
                                                        school?.schoolStatus === 'Pending' ? 'secondary' : 'destructive'
                                                }>
                                                    {school?.schoolStatus}
                                                </Badge>
                                            </td>
                                            <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4"/>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewSchool(school.id)}>
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {school?.schoolStatus === 'Pending' && (
                                                            <DropdownMenuItem
                                                                onClick={() => toast.success(`${school?.name} approved`)}>
                                                                Approve
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </>
    );
}
