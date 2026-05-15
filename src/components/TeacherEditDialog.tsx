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
import { useApiQuery } from '@/hooks/use-api-query';
import { toast } from 'sonner';
import { Loader2, Check, ChevronDown, Search, X, UserPlus } from 'lucide-react';
import { TeacherInterface } from '../pages/interfaces/teacher.interface';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

interface TeacherEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: TeacherInterface;
}

export default function TeacherEditDialog({ open, onOpenChange, teacher }: TeacherEditDialogProps) {
    const { mutateAsync: updateTeacher, isPending } = useUpdateTeacher(teacher?.id);
    const { data: school } = useApiQuery<any>(
        ['school', teacher?.schoolId],
        `/schools/${teacher?.schoolId}`,
        { enabled: !!teacher?.schoolId && open }
    );

    const { data: subjectsResponse } = useApiQuery<any>(
        ['schoolSubjects', teacher?.schoolId],
        `/schools/get-subjects?schoolId=${teacher?.schoolId}&isActive=true`,
        { enabled: !!teacher?.schoolId && open }
    );

    const availableGrades = school?.gradesOffered || [];
    const availableSubjects = Array.isArray(subjectsResponse) 
        ? subjectsResponse.map((s: any) => s.name) 
        : subjectsResponse?.data?.map((s: any) => s.name) || [];

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
    });

    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

    useEffect(() => {
        if (teacher) {
            setFormData({
                fullName: teacher.fullName || '',
                email: teacher.email || '',
                phone: teacher.phone || '',
            });
            setSelectedSubjects(teacher.subjects || []);
            setSelectedGrades(teacher.assignedClasses || []);
        }
    }, [teacher, open]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const toggleSubject = (subject: string) => {
        setSelectedSubjects(prev => 
            prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
        );
    };

    const toggleGrade = (grade: string) => {
        setSelectedGrades(prev => 
            prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
        );
    };

    const handleSave = async () => {
        if (!formData.fullName) {
            toast.error("Full name is required");
            return;
        }

        const payload = {
            ...formData,
            subjects: selectedSubjects,
            assignedClasses: selectedGrades,
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
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <UserPlus className="h-6 w-6 text-primary" />
                        Edit Teacher Profile
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Update the teacher's personal and academic assignments.
                    </p>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                        <div className="relative">
                            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="fullName" 
                                value={formData.fullName} 
                                onChange={handleInputChange} 
                                className="pl-10 h-11 border-muted-foreground/20 focus-visible:ring-primary"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</div>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                    className="pl-10 h-11 border-muted-foreground/20 focus-visible:ring-primary text-xs"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">TEL</div>
                                <Input 
                                    id="phone" 
                                    value={formData.phone} 
                                    onChange={handleInputChange} 
                                    className="pl-10 h-11 border-muted-foreground/20 focus-visible:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Grades Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned Classes/Grades</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-between h-auto min-h-[42px] px-3 py-2 text-left font-normal border-muted-foreground/20 hover:border-primary/50 transition-colors"
                                    >
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            {selectedGrades.length > 0 ? (
                                                selectedGrades.map(grade => (
                                                    <Badge key={grade} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0">
                                                        {grade}
                                                        <X 
                                                            className="ml-1 h-3 w-3 cursor-pointer" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleGrade(grade);
                                                            }}
                                                        />
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Select grades...</span>
                                            )}
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 shadow-xl border-primary/10" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search grades..." className="h-9" />
                                        <CommandList className="max-h-[300px]">
                                            <CommandEmpty>No grade found.</CommandEmpty>
                                            <CommandGroup>
                                                {availableGrades.map((grade: string) => (
                                                    <CommandItem
                                                        key={grade}
                                                        onSelect={() => toggleGrade(grade)}
                                                        className="flex items-center justify-between cursor-pointer"
                                                    >
                                                        <span>{grade}</span>
                                                        {selectedGrades.includes(grade) && (
                                                            <Check className="h-4 w-4 text-primary" />
                                                        )}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Subjects Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned Subjects</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-between h-auto min-h-[42px] px-3 py-2 text-left font-normal border-muted-foreground/20 hover:border-primary/50 transition-colors"
                                    >
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            {selectedSubjects.length > 0 ? (
                                                selectedSubjects.map(subject => (
                                                    <Badge key={subject} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0">
                                                        {subject}
                                                        <X 
                                                            className="ml-1 h-3 w-3 cursor-pointer" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleSubject(subject);
                                                            }}
                                                        />
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Select subjects...</span>
                                            )}
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 shadow-xl border-primary/10" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search subjects..." className="h-9" />
                                        <CommandList className="max-h-[300px]">
                                            <CommandEmpty>No subject found.</CommandEmpty>
                                            <CommandGroup>
                                                {availableSubjects.map((subject: string) => (
                                                    <CommandItem
                                                        key={subject}
                                                        onSelect={() => toggleSubject(subject)}
                                                        className="flex items-center justify-between cursor-pointer"
                                                    >
                                                        <span>{subject}</span>
                                                        {selectedSubjects.includes(subject) && (
                                                            <Check className="h-4 w-4 text-primary" />
                                                        )}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
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
