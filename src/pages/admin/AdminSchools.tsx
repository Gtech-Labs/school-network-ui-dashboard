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
import {Search, MoreVertical, Plus, Upload, School, MapPin, BookOpen, ChevronRight, ChevronLeft, CheckCircle2, ChevronDown, Loader2, Check, X, Shield} from 'lucide-react';
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
import {useUploadMutation} from '@/hooks/use-upload-mutation';

interface SchoolFormState {
    name?: string;
    tenant_id?: string;
    registrationNumber?: string;
    type?: string;
    principalName?: string;
    email?: string;
    contactNumber?: string;
    address?: string;
    website?: string;
    regCertificateUrl?: string;
    proofOfAuthUrl?: string;
    paymentsInvolved?: string | boolean;
    bankName?: string;
    accountNumber?: string;
    accountType?: string;
    branchCode?: string;
    province?: string;
    municipality?: string;
    curriculum?: string;
    phase?: string;
    gradesOffered?: string;
    passRate?: string;
    annualFees?: string;
    facilities?: string;
    admissionRequirements?: string;
    imageUrl?: string;
    subjects?: string;
}

export default function AdminSchools() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<SchoolFormState>({});
    const {mutate, isPending, error : createSchoolError} = useApiMutation<never>();
    const queryClient = useQueryClient();
    const {user} = useAuth();
    const uploadMutation = useUploadMutation();

    // New Identity and compliance fields state
    const [regCertificateUrl, setRegCertificateUrl] = useState('');
    const [proofOfAuthUrl, setProofOfAuthUrl] = useState('');
    const [paymentsInvolved, setPaymentsInvolved] = useState(false);
    const [schoolType, setSchoolType] = useState('Public');
    const [accountType, setAccountType] = useState('Savings');

    const [isUploadingReg, setIsUploadingReg] = useState(false);
    const [isUploadingProof, setIsUploadingProof] = useState(false);

    const handleCloseDialog = () => {
        setFormData({});
        setStep(1);
        setRegCertificateUrl('');
        setProofOfAuthUrl('');
        setPaymentsInvolved(false);
        setSchoolType('Public');
        setAccountType('Savings');
        setAddDialogOpen(false);
    };

    const handleFileUpload = async (file: File, type: 'reg' | 'proof') => {
        const isReg = type === 'reg';
        if (isReg) setIsUploadingReg(true);
        else setIsUploadingProof(true);

        const uploadToast = toast.loading(`Uploading ${isReg ? 'Registration Certificate' : 'Proof of Authorization'}...`);

        try {
            const res = await uploadMutation.mutateAsync({ file });
            if (isReg) {
                setRegCertificateUrl(res.url);
                toast.success('Registration Certificate uploaded successfully', { id: uploadToast });
            } else {
                setProofOfAuthUrl(res.url);
                toast.success('Proof of Authorization uploaded successfully', { id: uploadToast });
            }
        } catch (err) {
            toast.error('File upload failed. Please try again.', { id: uploadToast });
            console.error(err);
        } finally {
            if (isReg) setIsUploadingReg(false);
            else setIsUploadingProof(false);
        }
    };

    const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formDataObj = new FormData(e.currentTarget);
        const data = Object.fromEntries(formDataObj);
        
        if (step === 1) {
            // UI validation check for step 1 fields
            if (!data.name || String(data.name).trim() === '') {
                toast.error("School Name is required");
                return;
            }
            if (!data.tenant_id || String(data.tenant_id).trim() === '') {
                toast.error("Tenant ID is required");
                return;
            }
            if (!data.registrationNumber || String(data.registrationNumber).trim() === '') {
                toast.error("EMIS / Registration number is required");
                return;
            }
            if (!data.principalName || String(data.principalName).trim() === '') {
                toast.error("Principal/Authorized Rep Name is required");
                return;
            }
            if (!data.email || String(data.email).trim() === '') {
                toast.error("Official Email is required");
                return;
            }
            if (!data.contactNumber || String(data.contactNumber).trim() === '') {
                toast.error("Phone Number is required");
                return;
            }
            if (!data.address || String(data.address).trim() === '') {
                toast.error("Address is required");
                return;
            }
            if (!regCertificateUrl) {
                toast.error("Please upload the Registration Certificate");
                return;
            }
            if (!proofOfAuthUrl) {
                toast.error("Please upload the Proof of Authorization");
                return;
            }
            if (paymentsInvolved) {
                if (!data.bankName || String(data.bankName).trim() === '') {
                    toast.error("Bank Name is required when payments are involved");
                    return;
                }
                if (!data.accountNumber || String(data.accountNumber).trim() === '') {
                    toast.error("Account Number is required when payments are involved");
                    return;
                }
                if (!data.accountType || String(data.accountType).trim() === '') {
                    toast.error("Account Type is required when payments are involved");
                    return;
                }
                if (!data.branchCode || String(data.branchCode).trim() === '') {
                    toast.error("Branch Code is required when payments are involved");
                    return;
                }
            }

            // Inject non-native form input values
            data.type = schoolType;
            data.regCertificateUrl = regCertificateUrl;
            data.proofOfAuthUrl = proofOfAuthUrl;
            data.paymentsInvolved = paymentsInvolved ? 'true' : 'false';
            if (paymentsInvolved) {
                data.accountType = accountType;
            }
        }

        if (formDataObj.has('phase')) {
            data.phase = formDataObj.getAll('phase').join(', ');
        }
        
        setFormData((prev) => ({ ...prev, ...data }));
        setStep(prev => prev + 1);
    };

    const {data: schools, isLoading, isError, error} = useApiQuery<Record<string, unknown>[]>(
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
        const step3Data = Object.fromEntries(formDataObj);
        step3Data.phase = formDataObj.getAll('phase').join(', ');
        const finalData = { ...formData, ...step3Data } as SchoolFormState;

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
            
            // New fields optional in backend
            registrationNumber: finalData.registrationNumber || undefined,
            principalName: finalData.principalName || undefined,
            regCertificateUrl: finalData.regCertificateUrl || undefined,
            proofOfAuthUrl: finalData.proofOfAuthUrl || undefined,
            paymentsInvolved: finalData.paymentsInvolved === 'true' || finalData.paymentsInvolved === true,
            bankName: (finalData.paymentsInvolved === 'true' || finalData.paymentsInvolved === true) ? finalData.bankName : undefined,
            accountNumber: (finalData.paymentsInvolved === 'true' || finalData.paymentsInvolved === true) ? finalData.accountNumber : undefined,
            accountType: (finalData.paymentsInvolved === 'true' || finalData.paymentsInvolved === true) ? finalData.accountType : undefined,
            branchCode: (finalData.paymentsInvolved === 'true' || finalData.paymentsInvolved === true) ? finalData.branchCode : undefined,
        };

        //call mutation
        mutate({method: 'POST', endpoint: `schools`, data: payload}, {
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: ['schools']}).then(r => console.log('invalidated'));
                toast.success(`${payload.name} successfully created`);
                setStep(4);
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
                    <Dialog open={addDialogOpen} onOpenChange={(open) => {
                        setAddDialogOpen(open);
                        if (!open) {
                            handleCloseDialog();
                        }
                    }}>
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
                                {step < 4 ? (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        <span className={`px-2 py-1 rounded-md transition-colors ${step === 1 ? 'bg-primary/10 text-primary font-bold' : ''}`}>Identity</span>
                                        <ChevronRight className="h-3 w-3 opacity-50" />
                                        <span className={`px-2 py-1 rounded-md transition-colors ${step === 2 ? 'bg-primary/10 text-primary font-bold' : ''}`}>Location</span>
                                        <ChevronRight className="h-3 w-3 opacity-50" />
                                        <span className={`px-2 py-1 rounded-md transition-colors ${step === 3 ? 'bg-primary/10 text-primary font-bold' : ''}`}>Academic</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-500/10 px-3 py-1 rounded-full">
                                        <Check className="h-3.5 w-3.5" />
                                        Completed
                                    </div>
                                )}
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
                                                    <Input name="name" placeholder="e.g. Green Valley Academy" required defaultValue={formData.name} className="bg-muted/20 animate-fade-in" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tenant ID <span className="text-destructive">*</span></Label>
                                                    <Input name="tenant_id" placeholder="e.g. GVA_HS" required defaultValue={formData.tenant_id} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">EMIS / Registration Number <span className="text-destructive">*</span></Label>
                                                    <Input name="registrationNumber" placeholder="e.g. EMIS123456789" required defaultValue={formData.registrationNumber} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">School Type <span className="text-destructive">*</span></Label>
                                                    <Select name="type" value={schoolType} onValueChange={setSchoolType}>
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
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Principal / Authorized Rep Name <span className="text-destructive">*</span></Label>
                                                    <Input name="principalName" placeholder="e.g. Dr. John Doe" required defaultValue={formData.principalName} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Official Email Address <span className="text-destructive">*</span></Label>
                                                    <Input name="email" type="email" placeholder="contact@school.com" required defaultValue={formData.email} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Official Phone Number <span className="text-destructive">*</span></Label>
                                                    <Input name="contactNumber" type="tel" placeholder="+27 83 123 4567" required defaultValue={formData.contactNumber} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Address <span className="text-destructive">*</span></Label>
                                                    <Input name="address" placeholder="123 Main St, Suburb" required defaultValue={formData.address} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Website</Label>
                                                    <Input name="website" type="url" placeholder="https://..." defaultValue={formData.website} className="bg-muted/20" />
                                                </div>
                                                
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registration Certificate <span className="text-destructive">*</span></Label>
                                                    {regCertificateUrl ? (
                                                        <div className="flex items-center justify-between p-3 rounded-xl border border-green-500/30 bg-green-500/5 text-sm">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                                                <span className="text-green-700 font-medium truncate">Certificate Uploaded</span>
                                                            </div>
                                                            <Button type="button" variant="ghost" size="sm" onClick={() => setRegCertificateUrl('')} className="h-7 px-2 hover:bg-green-500/10 text-green-700 hover:text-green-800">
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex flex-col gap-1 items-center justify-center border border-dashed rounded-xl p-4 cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all group min-h-[70px]">
                                                            {isUploadingReg ? (
                                                                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                                            ) : (
                                                                <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                            )}
                                                            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">
                                                                {isUploadingReg ? 'Uploading...' : 'Upload Certificate'}
                                                            </span>
                                                            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'reg')} disabled={isUploadingReg} />
                                                        </label>
                                                    )}
                                                </div>

                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proof of Authorization <span className="text-destructive">*</span></Label>
                                                    {proofOfAuthUrl ? (
                                                        <div className="flex items-center justify-between p-3 rounded-xl border border-green-500/30 bg-green-500/5 text-sm">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                                                <span className="text-green-700 font-medium truncate">Proof Uploaded</span>
                                                            </div>
                                                            <Button type="button" variant="ghost" size="sm" onClick={() => setProofOfAuthUrl('')} className="h-7 px-2 hover:bg-green-500/10 text-green-700 hover:text-green-800">
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex flex-col gap-1 items-center justify-center border border-dashed rounded-xl p-4 cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all group min-h-[70px]">
                                                            {isUploadingProof ? (
                                                                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                                            ) : (
                                                                <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                            )}
                                                            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">
                                                                {isUploadingProof ? 'Uploading...' : 'Upload Proof'}
                                                            </span>
                                                            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'proof')} disabled={isUploadingProof} />
                                                        </label>
                                                    )}
                                                </div>

                                                <div className="space-y-2 col-span-2">
                                                    <div className="flex items-center space-x-2 p-2 border rounded-xl bg-muted/10">
                                                        <input 
                                                            type="checkbox" 
                                                            id="paymentsInvolved" 
                                                            checked={paymentsInvolved}
                                                            onChange={(e) => setPaymentsInvolved(e.target.checked)}
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                        />
                                                        <Label htmlFor="paymentsInvolved" className="text-sm font-semibold text-foreground cursor-pointer select-none">
                                                            Payments Involved (Requires Bank Details)
                                                        </Label>
                                                    </div>
                                                </div>

                                                {paymentsInvolved && (
                                                    <div className="col-span-2 border border-primary/20 rounded-2xl p-5 bg-primary/5 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                                                        <div className="col-span-2 pb-2 border-b border-primary/10">
                                                            <h4 className="text-sm font-bold text-primary">Bank Account Details</h4>
                                                        </div>
                                                        <div className="space-y-2 col-span-2 sm:col-span-1">
                                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bank Name <span className="text-destructive">*</span></Label>
                                                            <Input name="bankName" placeholder="e.g. Standard Bank" required defaultValue={formData.bankName} className="bg-background" />
                                                        </div>
                                                        <div className="space-y-2 col-span-2 sm:col-span-1">
                                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Number <span className="text-destructive">*</span></Label>
                                                            <Input name="accountNumber" placeholder="e.g. 123456789" required defaultValue={formData.accountNumber} className="bg-background" />
                                                        </div>
                                                        <div className="space-y-2 col-span-2 sm:col-span-1">
                                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Type <span className="text-destructive">*</span></Label>
                                                            <Select name="accountType" value={accountType} onValueChange={setAccountType}>
                                                                <SelectTrigger className="h-10 w-full rounded-xl border-input bg-background px-4 py-2 hover:border-primary/50 transition-colors cursor-pointer">
                                                                    <SelectValue placeholder="Select Account Type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Savings">Savings</SelectItem>
                                                                    <SelectItem value="Cheque">Cheque/Current</SelectItem>
                                                                    <SelectItem value="Transmission">Transmission</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2 col-span-2 sm:col-span-1">
                                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Branch Code <span className="text-destructive">*</span></Label>
                                                            <Input name="branchCode" placeholder="e.g. 051001" required defaultValue={formData.branchCode} className="bg-background" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="text-base font-semibold">Location Details</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Province</Label>
                                                    <Input name="province" placeholder="Gauteng" defaultValue={formData.province} className="bg-muted/20" />
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Municipality</Label>
                                                    <Input name="municipality" placeholder="City of Johannesburg" defaultValue={formData.municipality} className="bg-muted/20" />
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
                                                        <Select name="curriculum" defaultValue={formData.curriculum || ""}>
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
                                                                    defaultChecked={formData.phase?.split(',').map(s => s.trim()).includes(phase)}
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
                                                    <Input name="gradesOffered" placeholder="e.g. R, 1, 2, 12" defaultValue={formData.gradesOffered} className="bg-muted/20" />
                                                </div>
                                                
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pass Rate (%)</Label>
                                                    <Input name="passRate" type="number" step="0.1" placeholder="e.g. 98.5" defaultValue={formData.passRate} className="bg-muted/20" />
                                                </div>

                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Annual Fees</Label>
                                                    <Input name="annualFees" type="number" placeholder="e.g. 35000" defaultValue={formData.annualFees} className="bg-muted/20" />
                                                </div>

                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facilities</Label>
                                                    <Input name="facilities" placeholder="Library, Lab, Gym" defaultValue={formData.facilities} className="bg-muted/20" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="space-y-6 text-center animate-in zoom-in-95 duration-300 py-6">
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-foreground">Registration Submitted</h3>
                                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                                    Thank you for registering. Your uploaded compliance documents will be manually reviewed by our compliance team.
                                                </p>
                                                <p className="text-sm text-primary font-semibold">
                                                    You will receive a confirmation email once your account is activated.
                                                </p>
                                            </div>

                                            <div className="border border-border rounded-xl p-4 bg-muted/20 text-left max-w-md mx-auto space-y-2">
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                    <Shield className="h-4 w-4 text-primary" />
                                                    POPIA Disclaimer & Privacy Consent
                                                </div>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    In compliance with the Protection of Personal Information Act (POPIA), Act 4 of 2013, GTech Labs commits to protecting your privacy. The information and compliance files collected during registration are processed solely for verification and system setup. By closing this dialog, you consent to the secure handling of your submitted documents.
                                                </p>
                                            </div>

                                            <div className="pt-4">
                                                <Button type="button" onClick={handleCloseDialog} className="w-full max-w-xs rounded-full shadow-md font-semibold">
                                                    Finish & Close
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {step < 4 && (
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
