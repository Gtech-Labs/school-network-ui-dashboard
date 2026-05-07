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
import {Search, MoreVertical, Plus, Upload} from 'lucide-react';
import {useApiQuery} from "@/hooks/use-api-query.ts";

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
        const data = Object.fromEntries(new FormData(e.currentTarget));
        setFormData((prev) => ({ ...prev, ...data }));
        setStep(2);
    };

    const {data: schools, isLoading, isError, error} = useApiQuery<never[]>(
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
        const step2Data = Object.fromEntries(new FormData(e.currentTarget));
        const finalData : SchoolPayload = { ...formData, ...step2Data };

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
            annualFees: Number(finalData.annualFees),
            admissionRequirements: finalData.admissionRequirements,
            passRate: parseFloat(String(finalData.passRate)),
            imageUrl: finalData.imageUrl || "https://cdn.example.com/school.jpg",
            phase: (finalData.phase as unknown as string).split(',').map(s => s.trim()),
            gradesOffered: (finalData.gradesOffered as unknown as string).split(',').map(s => s.trim()),
            facilities: (finalData.facilities as unknown as string).split(',').map(s => s.trim()),
            subjects: (finalData.subjects as unknown as string).split(',').map(item => {
                const [name, code] = item.split(':');
                return { name: name?.trim(), code: code?.trim() };
            }),
        };

        //call mutation
        mutate({method: 'POST', endpoint: `schools`, data: payload}, {
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: ['schools']}).then(r => console.log('invalidated'));
                toast.success(`${payload.name} successfully created`);
                //handleCloseDialog();
            },
            onError: (err) => {
                toast.error("Failed to update school");
                console.error(err);
            }
        });
        console.log('API Payload:', JSON.stringify(payload, null, 2));
        toast.success("School added successfully");
        setAddDialogOpen(false);
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
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New School</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-6">
                                {step === 1 ? (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Step 1: Identity & Location</h3>
                                        <Input name="name" placeholder="School Name" required defaultValue={formData.name} />
                                        <Input name="email" type="email" placeholder="Email" required defaultValue={formData.email} />
                                        <Input name="address" placeholder="Full Address" defaultValue={formData.address} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input name="province" placeholder="Province" defaultValue={formData.province} />
                                            <Input name="municipality" placeholder="Municipality" defaultValue={formData.municipality} />
                                        </div>
                                        <Input
                                            id="tenant_id"
                                            name="tenant_id"
                                            placeholder="Enter Tenant ID"
                                            required
                                            defaultValue={formData.tenant_id}
                                        />
                                        <Input name="contactNumber" placeholder="Contact Number" defaultValue={formData.contactNumber} />
                                        <Button type="submit" className="w-full">Next</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Step 2: Operations & Academic</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <Input name="type" placeholder="Type" defaultValue={formData.type} />
                                            <Input name="annualFees" type="number" placeholder="Annual Fees" defaultValue={formData.annualFees} />
                                            <Input name="passRate" type="number" step="0.1" placeholder="Pass Rate %" defaultValue={formData.passRate} />
                                        </div>
                                        <Input name="website" type="url" placeholder="Website" defaultValue={formData.website} />
                                        <Input name="phase" placeholder="Phases (e.g. Creche, Primary)" defaultValue={formData.phase} />
                                        <Input name="gradesOffered" placeholder="Grades (e.g. R, 1, 2)" defaultValue={formData.gradesOffered} />
                                        <Input name="facilities" placeholder="Facilities (e.g. Library, Field)" defaultValue={formData.facilities} />
                                        <Input name="subjects" placeholder="Subjects (e.g. Math:MATH101)" defaultValue={formData.subjects} />
                                        <Textarea name="admissionRequirements" placeholder="Admission Requirements" defaultValue={formData.admissionRequirements} />
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">Back</Button>
                                            <Button type="submit" className="w-full" disabled={isPending}>{isPending ? 'Submitting ...' : 'Submit'}</Button>
                                        </div>
                                    </div>
                                )}
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
