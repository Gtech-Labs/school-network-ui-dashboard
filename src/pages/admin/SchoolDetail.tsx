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
import {ArrowLeft, Mail, Phone, Globe, MapPin, Award, Edit, Ban, Trash2, Image as ImageIcon} from 'lucide-react';
import {toast} from 'sonner';
import {getSchoolFeatures, setSchoolFeatures} from '@/lib/schoolFeatures';
import {useApiQuery} from '@/hooks/use-api-query.ts';
import {useApiMutation} from "@/hooks/use-api-mutation.ts";
import {useQueryClient} from "@tanstack/react-query";

export default function SchoolDetail() {
    const queryClient = useQueryClient();
    const {id} = useParams();
    const navigate = useNavigate();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const {mutate, isPending, error} = useApiMutation<any>();

    const {data: school, isLoading, isError} = useApiQuery(
        ['school'],
        `/schools/${id}`,
        {
            // any option
        }
    );

    // Feature toggles state - load from localStorage
    const [features, setFeatures] = useState(() => {
        if (id) {
            return getSchoolFeatures(id);
        }
        return {
            applications: true,
            students: true,
            teachers: true,
            parents: true,
            payments: true,
            academicProgress: true,
            attendance: true,
            calendar: true,
            timetable: true,
            announcements: true,
            activityLog: true,
        };
    });

    // const school = mockSchools.find(s => s.id === id);

    // Load features from localStorage when component mounts or id changes
    useEffect(() => {
        if (id) {
            const loadedFeatures = getSchoolFeatures(id);
            setFeatures(loadedFeatures);
        }
    }, [id]);


    {
        isError && <p>Error: {error}</p>
    }

    {
        isLoading && <p>Loading...</p>
    }

    if (!school) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Button variant="outline" onClick={() => navigate('/admin/schools')}>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Schools
                </Button>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">School not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }


    const handleEdit = () => {
        setEditDialogOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Convert FormData to a plain object
        const rawData = Object.fromEntries(formData.entries());

        // Helper function to turn comma-separated strings into clean arrays
        const formatArray = (value: any) => {
            if (!value) return [];
            return String(value)
                .split(',')
                .map(item => item.trim())
                .filter(item => item !== ""); // Remove empty strings
        };

        // Construct the final payload
        const payload = {
            ...rawData,
            passRate: parseFloat(rawData.passRate as string) || 0,
            annualFees: parseInt(rawData.annualFees as string) || 0,
            // Transform specific fields into arrays
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
        toast.success(`${school.name} has been suspended`);
        navigate('/admin/schools');
    };

    const handleDelete = () => {
        toast.success(`${school.name} has been deleted`);
        mutate({method: 'DELETE', endpoint: `school/${id}`, data: {}})
        navigate('/admin/schools');
    };

    const handleFeatureToggle = (feature: keyof typeof features) => {
        if (!id) return;

        const newFeatures = {
            ...features,
            [feature]: !features[feature]
        };

        setFeatures(newFeatures);
        setSchoolFeatures(id, newFeatures);

        toast.success(`${feature.charAt(0).toUpperCase() + feature.slice(1)} feature ${!features[feature] ? 'enabled' : 'disabled'}`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => navigate('/admin/schools')}>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Schools
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4"/>
                        Edit
                    </Button>
                    {school.schoolStatus === 'Active' && (
                        <Button variant="outline" onClick={handleSuspend}>
                            <Ban className="mr-2 h-4 w-4"/>
                            Suspend
                        </Button>
                    )}
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Delete
                    </Button>
                </div>
            </div>

            {/* School Header Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-3xl mb-2">{school?.name}</CardTitle>
                            <div className="flex gap-2 mt-2">
                                <Badge variant={
                                    school.type === 'Public' ? 'default' :
                                        school.type === 'Private' ? 'secondary' : 'outline'
                                }>
                                    {school.type}
                                </Badge>
                                <Badge variant={
                                    school.schoolStatus === 'Active' ? 'default' :
                                        school.schoolStatus === 'Pending' ? 'secondary' : 'destructive'
                                }>
                                    {school.schoolStatus}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5"/>
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">{school?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5"/>
                            <div>
                                <p className="text-sm font-medium">Phone</p>
                                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Globe className="h-5 w-5 text-muted-foreground mt-0.5"/>
                            <div>
                                <p className="text-sm font-medium">Website</p>
                                <p className="text-sm text-muted-foreground">www.{school.name.toLowerCase().replace(/\s+/g, '')}.edu</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5"/>
                            <div>
                                <p className="text-sm font-medium">Address</p>
                                <p className="text-sm text-muted-foreground">
                                    123 Education Street<br/>
                                    School District, ST 12345
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Students</span>
                            <span
                                className="text-2xl font-bold">{school?.studentsCount ? school.studentsCount : '876'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Teachers</span>
                            <span
                                className="text-2xl font-bold">{school?.teachersCount ? school.teachersCount : '34'}</span>
                        </div>
                        {/*<div className="flex justify-between items-center">*/}
                        {/*    <span className="text-sm font-medium">Monthly Revenue</span>*/}
                        {/*    <span className="text-2xl font-bold">${school.revenue.toLocaleString()}</span>*/}
                        {/*</div>*/}
                        <div className="flex items-start gap-3">
                            <Award className="h-5 w-5 text-muted-foreground mt-0.5"/>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Pass Rate</p>
                                <p className="text-sm text-muted-foreground">87.5%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Features & Access Control */}
            <Card>
                <CardHeader>
                    <CardTitle>Features & Access Control</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Control which features this school can access in their dashboard.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Applications Management</p>
                                    <p className="text-xs text-muted-foreground">Manage student applications</p>
                                </div>
                                <Switch
                                    checked={features.applications}
                                    onCheckedChange={() => handleFeatureToggle('applications')}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Student Management</p>
                                    <p className="text-xs text-muted-foreground">View and manage students</p>
                                </div>
                                <Switch
                                    checked={features.students}
                                    onCheckedChange={() => handleFeatureToggle('students')}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Teacher Management</p>
                                    <p className="text-xs text-muted-foreground">View and manage teachers</p>
                                </div>
                                <Switch
                                    checked={features.teachers}
                                    onCheckedChange={() => handleFeatureToggle('teachers')}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Parent Management</p>
                                    <p className="text-xs text-muted-foreground">View and manage parents</p>
                                </div>
                                <Switch
                                    checked={features.parents}
                                    onCheckedChange={() => handleFeatureToggle('parents')}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Payment Management</p>
                                    <p className="text-xs text-muted-foreground">Manage payments and invoices</p>
                                </div>
                                <Switch
                                    checked={features.payments}
                                    onCheckedChange={() => handleFeatureToggle('payments')}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Calendar & Events</p>
                                    <p className="text-xs text-muted-foreground">Schedule exams and events</p>
                                </div>
                                <Switch
                                    checked={features.calendar}
                                    onCheckedChange={() => handleFeatureToggle('calendar')}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Timetable</p>
                                    <p className="text-xs text-muted-foreground">Manage class schedules</p>
                                </div>
                                <Switch
                                    checked={features.timetable}
                                    onCheckedChange={() => handleFeatureToggle('timetable')}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Announcements</p>
                                    <p className="text-xs text-muted-foreground">Send announcements</p>
                                </div>
                                <Switch
                                    checked={features.announcements}
                                    onCheckedChange={() => handleFeatureToggle('announcements')}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Activity Log</p>
                                    <p className="text-xs text-muted-foreground">View audit trail</p>
                                </div>
                                <Switch
                                    checked={features.activityLog}
                                    onCheckedChange={() => handleFeatureToggle('activityLog')}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Media Assets */}
            <Card>
                <CardHeader>
                    <CardTitle>Media Assets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">School Logo</p>
                            <div className="border rounded-lg p-8 flex items-center justify-center bg-muted/30">
                                <ImageIcon className="h-12 w-12 text-muted-foreground"/>
                            </div>
                            <p className="text-xs text-muted-foreground">No logo uploaded</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">School Banner</p>
                            <div className="border rounded-lg p-8 flex items-center justify-center bg-muted/30">
                                <ImageIcon className="h-12 w-12 text-muted-foreground"/>
                            </div>
                            <p className="text-xs text-muted-foreground">No banner uploaded</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Joined Date</span>
                        <span
                            className="text-sm text-muted-foreground">{new Date(school.joinedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">School ID</span>
                        <span className="text-sm text-muted-foreground">{school.id}</span>
                    </div>
                </CardContent>
            </Card>

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
