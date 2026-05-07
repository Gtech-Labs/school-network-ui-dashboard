import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateTeacher } from '@/hooks/users/teacher.hook';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { TeacherInterface } from '../pages/interfaces/teacher.interface';

interface TeacherEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: TeacherInterface;
}

export default function TeacherEditDialog({ open, onOpenChange, teacher }: TeacherEditDialogProps) {
    const { mutateAsync: updateTeacher, isPending } = useUpdateTeacher(teacher?.id);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        subjects: '',
        assignedClasses: '',
    });

    useEffect(() => {
        if (teacher) {
            setFormData({
                fullName: teacher.fullName || '',
                email: teacher.email || '',
                phone: teacher.phone || '',
                subjects: teacher.subjects?.join(', ') || '',
                assignedClasses: teacher.assignedClasses?.join(', ') || '',
            });
        }
    }, [teacher, open]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSave = async () => {
        if (!formData.fullName) {
            toast.error("Full name is required");
            return;
        }

        const payload = {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s !== ''),
            assignedClasses: formData.assignedClasses.split(',').map(s => s.trim()).filter(s => s !== ''),
        };

        try {
            await updateTeacher(payload);
            toast.success("Teacher updated successfully");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update teacher");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Teacher Profile</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={formData.fullName} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subjects">Subjects (comma separated)</Label>
                        <Input id="subjects" value={formData.subjects} onChange={handleInputChange} placeholder="e.g. Mathematics, Physics" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="assignedClasses">Assigned Classes (comma separated)</Label>
                        <Input id="assignedClasses" value={formData.assignedClasses} onChange={handleInputChange} placeholder="e.g. Grade 10A, Grade 11B" />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
