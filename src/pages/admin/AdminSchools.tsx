import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSchools } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, MoreVertical, Plus, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function AdminSchools() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState(mockSchools);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSchool = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    toast.success(`School ${formData.get('name')} added successfully`);
    setAddDialogOpen(false);
  };

  const handleViewSchool = (schoolId: string) => {
    navigate(`/admin/schools/${schoolId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">School Management</h2>
          <p className="text-muted-foreground">Manage all registered schools</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New School
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New School</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSchool} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">School Name *</Label>
                  <Input id="name" name="name" placeholder="Enter school name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">School Email *</Label>
                  <Input id="email" name="email" type="email" placeholder="school@example.com" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" type="url" placeholder="https://www.school.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Textarea 
                  id="address" 
                  name="address" 
                  placeholder="Enter complete school address including city, state, and postal code"
                  className="min-h-[80px]"
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">School Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="logo" 
                      name="logo" 
                      type="file" 
                      accept="image/*"
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Upload school logo (PNG, JPG, max 2MB)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner">School Banner</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="banner" 
                      name="banner" 
                      type="file" 
                      accept="image/*"
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Upload school banner (PNG, JPG, max 5MB)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passrate">Pass Rate (%)</Label>
                <Input 
                  id="passrate" 
                  name="passrate" 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  placeholder="e.g., 85.5"
                />
                <p className="text-xs text-muted-foreground">Enter the school's overall pass rate percentage</p>
              </div>

              <Button type="submit" className="w-full">Add School</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium">School Name</th>
                  <th className="pb-3 text-left font-medium">Email</th>
                  <th className="pb-3 text-left font-medium">Plan</th>
                  <th className="pb-3 text-left font-medium">Students</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                  <th className="pb-3 text-left font-medium">Revenue</th>
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
                    <td className="py-4 font-medium">{school.name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{school.email}</td>
                    <td className="py-4">
                      <Badge variant={
                        school.plan === 'Enterprise' ? 'default' :
                        school.plan === 'Premium' ? 'secondary' : 'outline'
                      }>
                        {school.plan}
                      </Badge>
                    </td>
                    <td className="py-4">{school.studentsCount}</td>
                    <td className="py-4">
                      <Badge variant={
                        school.status === 'Active' ? 'default' :
                        school.status === 'Pending' ? 'secondary' : 'destructive'
                      }>
                        {school.status}
                      </Badge>
                    </td>
                    <td className="py-4">${school.revenue.toLocaleString()}</td>
                    <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewSchool(school.id)}>
                            View Details
                          </DropdownMenuItem>
                          {school.status === 'Pending' && (
                            <DropdownMenuItem onClick={() => toast.success(`${school.name} approved`)}>
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
      </Card>
    </div>
  );
}
