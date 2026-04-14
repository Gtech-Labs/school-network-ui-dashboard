import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Users,
    GraduationCap,
    UserCircle,
    School,
    Plus,
    ChevronLeft,
    ChevronRight,
    Upload,
    UserPlus
} from 'lucide-react';

import {toast} from 'sonner';
import {useApiQuery} from "@/hooks/use-api-query.ts";
import {useApiMutation} from "@/hooks/use-api-mutation.ts";
import {useQueryClient} from "@tanstack/react-query";

const ITEMS_PER_PAGE = 9;

type AddMode = 'choose' | 'single' | 'bulk';

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [addMode, setAddMode] = useState<AddMode>('choose');
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();

    const {mutate, isPending, error: createUserError} = useApiMutation<never>();

    const {data: users, isLoading, isError, error} = useApiQuery<never>(
        ['users', 'dashboard'], // Include roles in a key so cache updates when filters change
        `/users?roles=Admin,SuperAdmin,SchoolAdmin,SchoolSuperAdmin`,
        {
            staleTime: 1000 * 60 // 1 minute
        }
    );

    const {data: schools, isLoading: schoolLoading, isError: schoolIsError} = useApiQuery<never[]>(
        ['schools'],
        '/schools',
        {
            staleTime: 1000 * 60 // 1 minute
        }
    );

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error.message}</div>;
    const stats = users?.meta?.stats;

    const totalStudents = stats?.Student || 0;
    const totalTeachers = stats?.Teacher || 0;
    const totalAdmins = (stats?.Admin || 0) + (stats?.SuperAdmin || 0) + (stats?.SchoolAdmin || 0) + (stats?.SchoolSuperAdmin || 0);
    const totalAll = users?.meta?.all || 0;

    const handleCloseDialog = () => {
        setAddDialogOpen(false);
        setAddMode('choose');
    };

    const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = {
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          role: formData.get('role') as string,
          tenant_id: formData.get('school') as string,
          phone: formData.get('phone') as string,
          password: 'password', //Generate a password and send it via email or a link to set the password.
          schoolId: schools?.find((school) => school.tenant_id === formData.get('school'))?.id || '',
        }
        mutate({method: 'POST', endpoint: `auth/signup`, data: payload}, {
          onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['user']}).then(r => console.log('invalidated'));
          toast.success(`${payload.name} updated successfully`);
          handleCloseDialog();
        },
        onError: (err) => {
          toast.error("Failed to update school");
          console.error(err);
        }
      });
    };

    const handleBulkUpload = () => {
        toast.success('Users imported successfully');
        handleCloseDialog();
    };

    const filteredUsers = users?.data?.filter((user: {
        name: string;
        email: string;
        school: string;
        role: string;
    }) => {
        const matchesSearch =
            user?.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
            user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Admin Management</h2>
                    <p className="text-muted-foreground">Manage all admins across all schools and the platform</p>
                </div>
                <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Add User
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAll}</div>
                        <p className="text-xs text-muted-foreground">Across all schools</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-primary"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Active students</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                        <UserCircle className="h-4 w-4 text-accent"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTeachers}</div>
                        <p className="text-xs text-muted-foreground">Teaching staff</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">School Admins</CardTitle>
                        <School className="h-4 w-4 text-success"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAdmins}</div>
                        <p className="text-xs text-muted-foreground">Admins across all the platforms</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <div className="mt-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                            <Input
                                placeholder="Search by name, email, or school..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={(v) => {
                            setRoleFilter(v);
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by role"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="Admin">Admins</SelectItem>
                                <SelectItem value="SuperAdmins">Super Admin</SelectItem>
                                <SelectItem value="SchoolAdmin">School Admins</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>School</TableHead>
                                <TableHead>Verified</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.role === 'Admin' ? 'default' : user.role === 'SuperAdmin' ? 'secondary' : 'outline'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">{user.tenant_id}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.isVerified === true ? 'default' : 'secondary'}>
                                            {user.isVerified ? 'Verified' : 'Not Verified'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">View Details</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t mt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}>
                                    <ChevronLeft className="h-4 w-4"/>
                                    <span className="ml-1">Prev</span>
                                </Button>
                                {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                                    let page: number;
                                    if (totalPages <= 5) page = i + 1;
                                    else if (currentPage <= 3) page = i + 1;
                                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                                    else page = currentPage - 2 + i;
                                    return (
                                        <Button key={page} variant={currentPage === page ? 'default' : 'outline'}
                                                size="sm" onClick={() => setCurrentPage(page)} className="w-8 h-8 p-0">
                                            {page}
                                        </Button>
                                    );
                                })}
                                <Button variant="outline" size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}>
                                    <span className="mr-1">Next</span>
                                    <ChevronRight className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add User Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>

                    {addMode === 'choose' && (
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <Button variant="outline" className="h-28 flex flex-col gap-2"
                                    onClick={() => setAddMode('single')}>
                                <UserPlus className="h-8 w-8"/>
                                <span>Single User</span>
                            </Button>
                            <Button variant="outline" className="h-28 flex flex-col gap-2"
                                    onClick={() => setAddMode('bulk')}>
                                <Upload className="h-8 w-8"/>
                                <span>Bulk Upload</span>
                            </Button>
                        </div>
                    )}

                    {addMode === 'single' && (
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required/>
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required/>
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" type="text" required/>
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Select name="role" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                                        <SelectItem value="SchoolAdmin">School Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <div>
                                    <Label htmlFor="school">School</Label>
                                    {
                                        schoolLoading ? <p>Loading schools...</p> : null
                                    }
                                    {
                                        schoolIsError ? <p>Error loading schools</p> : null
                                    }
                                    <Select name="school" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select school"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                schools?.map((school, index) => (

                                                    <SelectItem key={school?.id || index}
                                                                value={school?.tenant_id}>{school?.name}</SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button"
                                        onClick={() => setAddMode('choose')}>Back</Button>
                                <Button type="submit">Add User</Button>
                            </DialogFooter>
                        </form>
                    )}

                    {addMode === 'bulk' && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Upload a spreadsheet with columns: <strong>Name, Email, Role, School</strong>
                            </p>
                            <Input type="file" accept=".csv,.xlsx,.xls"/>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setAddMode('choose')}>Back</Button>
                                <Button onClick={handleBulkUpload}>
                                    <Upload className="h-4 w-4 mr-2"/>
                                    Import Users
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
