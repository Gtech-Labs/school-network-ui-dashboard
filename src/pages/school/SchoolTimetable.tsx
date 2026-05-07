import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, Clock, Trash2, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useUserWithProfile } from '@/hooks/users/user.hook';
import { useTimetables, useCreateTimetable, useDeleteTimetable } from '@/hooks/timetable.hook';
import { useTeachers } from '@/hooks/users/teacher.hook';
import { useSubjects } from '@/hooks/schools/subject.hook';
import { DayOfWeek } from '@/api/timetable.api';

const days = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];

export default function SchoolTimetable() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProfile } = useUserWithProfile(user?.sub || '');
  const school = userProfile?.schoolAdminProfile?.school;
  const schoolId = school?.id || '';
  const gradesOffered = school?.gradesOffered || [];

  const [selectedClass, setSelectedClass] = useState('');
  useEffect(() => {
    if (gradesOffered.length > 0 && !selectedClass) {
      setSelectedClass(gradesOffered[0]);
    }
  }, [gradesOffered, selectedClass]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Combobox states
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);

  // Form states
  const [day, setDay] = useState<DayOfWeek>(DayOfWeek.MONDAY);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:45');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');

  const { toast } = useToast();

  const { data: timetablesData, isLoading } = useTimetables(schoolId, selectedClass);
  const timetables = timetablesData || [];
  
  const { mutate: createTimetable, isPending: isCreating } = useCreateTimetable();
  const { mutate: deleteTimetable } = useDeleteTimetable();

  const { data: teachersData } = useTeachers(schoolId);
  const teachers = teachersData?.data || [];

  const { data: subjectsData } = useSubjects(schoolId);
  const subjects = subjectsData || [];

  const handleAddEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subjectId || !teacherId) {
      toast({ title: 'Error', description: 'Please select a subject and teacher', variant: 'destructive' });
      return;
    }

    createTimetable(
      {
        schoolId,
        data: {
          dayOfWeek: day,
          startTime,
          endTime,
          groupLabel: selectedClass,
          subjectId,
          teacherId,
        }
      },
      {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Timetable entry added successfully' });
          setAddDialogOpen(false);
        },
        onError: () => {
          toast({ title: 'Error', description: 'Failed to add timetable entry', variant: 'destructive' });
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteTimetable(id, {
      onSuccess: () => toast({ title: 'Success', description: 'Entry removed' }),
      onError: () => toast({ title: 'Error', description: 'Failed to remove entry', variant: 'destructive' })
    });
  };

  const timeSlots = useMemo(() => {
    const slots = new Set<string>();
    timetables.forEach((t: any) => {
      slots.add(`${t.startTime.slice(0, 5)} - ${t.endTime.slice(0, 5)}`);
    });
    return Array.from(slots).sort();
  }, [timetables]);

  const getTimetableGrid = () => {
    const grid: Record<string, Record<string, any>> = {};
    days.forEach(d => {
      grid[d] = {};
      timeSlots.forEach(time => {
        const [st, et] = time.split(' - ');
        const entry = timetables.find((t: any) => t.dayOfWeek === d && t.startTime.slice(0, 5) === st && t.endTime.slice(0, 5) === et);
        grid[d][time] = entry || null;
      });
    });
    return grid;
  };

  const grid = getTimetableGrid();

  if (!schoolId) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Class Timetable</h2>
          <p className="text-muted-foreground">Manage class schedules and periods</p>
        </div>
        {selectedClass && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Period
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Timetable Entry for {selectedClass}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Select value={day} onValueChange={(val) => setDay(val as DayOfWeek)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((d) => (
                        <SelectItem key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Label>Subject</Label>
                  <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={subjectOpen} className="w-full justify-between">
                        {subjectId ? subjects.find((s: any) => s.id === subjectId)?.name : "Select subject..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search subject..." />
                        <CommandList>
                          <CommandEmpty>No subject found.</CommandEmpty>
                          <CommandGroup>
                            {subjects.map((subject: any) => (
                              <CommandItem
                                key={subject.id}
                                value={subject.name}
                                onSelect={() => {
                                  setSubjectId(subject.id);
                                  setSubjectOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", subjectId === subject.id ? "opacity-100" : "opacity-0")} />
                                {subject.name} ({subject.code})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col space-y-2">
                  <Label>Teacher</Label>
                  <Popover open={teacherOpen} onOpenChange={setTeacherOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={teacherOpen} className="w-full justify-between">
                        {teacherId ? teachers.find((t: any) => t.id === teacherId)?.fullName : "Select teacher..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search teacher..." />
                        <CommandList>
                          <CommandEmpty>No teacher found.</CommandEmpty>
                          <CommandGroup>
                            {teachers.map((teacher: any) => (
                              <CommandItem
                                key={teacher.id}
                                value={teacher.fullName || ''}
                                onSelect={() => {
                                  setTeacherId(teacher.id);
                                  setTeacherOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", teacherId === teacher.id ? "opacity-100" : "opacity-0")} />
                                {teacher.fullName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandGroup>
                            <CommandItem onSelect={() => navigate('/dashboard/school/teachers')}>
                              <Plus className="mr-2 h-4 w-4" /> Add Teacher
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Entry
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
        </CardHeader>
        <CardContent>
          {gradesOffered.length === 0 ? (
            <p className="text-muted-foreground text-sm">No classes configured for this school.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {gradesOffered.map((cls: string) => (
                <Button
                  key={cls}
                  variant={selectedClass === cls ? 'default' : 'outline'}
                  onClick={() => setSelectedClass(cls)}
                >
                  {cls}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timetable for {selectedClass}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">No timetable entries found for this class. Click "Add Period" to start building the schedule.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-3 bg-muted/50 text-left font-medium">Time</th>
                      {days.map((day) => (
                        <th key={day} className="border p-3 bg-muted/50 text-left font-medium">
                          {day.charAt(0) + day.slice(1).toLowerCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => (
                      <tr key={time}>
                        <td className="border p-3 bg-muted/30 font-medium text-sm whitespace-nowrap">
                          {time}
                        </td>
                        {days.map((day) => {
                          const entry = grid[day][time];
                          return (
                            <td key={`${day}-${time}`} className="border p-3 align-top min-w-[150px]">
                              {entry ? (
                                <div className="space-y-1 relative group">
                                  <div className="font-medium text-sm">{entry.subject?.name}</div>
                                  <div className="text-xs text-muted-foreground">{entry.teacher?.fullName}</div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background border"
                                    onClick={() => handleDelete(entry.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground text-center opacity-50">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
