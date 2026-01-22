import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
];

interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
}

export default function SchoolTimetable() {
  const [classes, setClasses] = useState<string[]>(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10']);
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addClassDialogOpen, setAddClassDialogOpen] = useState(false);
  const [deleteClassDialogOpen, setDeleteClassDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<Record<string, TimetableEntry[]>>({
    'Class 1': [
      { id: '1', day: 'Monday', time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Dr. Smith' },
      { id: '2', day: 'Monday', time: '09:00 - 10:00', subject: 'English', teacher: 'Ms. Johnson' },
      { id: '3', day: 'Tuesday', time: '08:00 - 09:00', subject: 'Science', teacher: 'Dr. Williams' },
    ],
  });

  const handleAddEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEntry: TimetableEntry = {
      id: Date.now().toString(),
      day: formData.get('day') as string,
      time: formData.get('time') as string,
      subject: formData.get('subject') as string,
      teacher: formData.get('teacher') as string,
    };

    setTimetable((prev) => ({
      ...prev,
      [selectedClass]: [...(prev[selectedClass] || []), newEntry],
    }));

    toast.success('Timetable entry added successfully');
    setAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setTimetable((prev) => ({
      ...prev,
      [selectedClass]: prev[selectedClass]?.filter((entry) => entry.id !== id) || [],
    }));
    toast.success('Entry removed');
  };

  const handleAddClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const className = formData.get('className') as string;

    if (classes.includes(className)) {
      toast.error('Class name already exists');
      return;
    }

    setClasses((prev) => [...prev, className]);
    toast.success(`${className} added successfully`);
    setAddClassDialogOpen(false);
    e.currentTarget.reset();
  };

  const handleDeleteClass = () => {
    if (!classToDelete) return;

    // Remove class from list
    setClasses((prev) => prev.filter((cls) => cls !== classToDelete));

    // Remove timetable data for this class
    setTimetable((prev) => {
      const newTimetable = { ...prev };
      delete newTimetable[classToDelete];
      return newTimetable;
    });

    // If the deleted class was selected, switch to the first available class
    if (selectedClass === classToDelete && classes.length > 1) {
      const remainingClasses = classes.filter((cls) => cls !== classToDelete);
      setSelectedClass(remainingClasses[0]);
    }

    toast.success(`${classToDelete} deleted successfully`);
    setDeleteClassDialogOpen(false);
    setClassToDelete(null);
  };

  const openDeleteDialog = (className: string) => {
    setClassToDelete(className);
    setDeleteClassDialogOpen(true);
  };

  const currentTimetable = timetable[selectedClass] || [];

  const getTimetableGrid = () => {
    const grid: Record<string, Record<string, TimetableEntry | null>> = {};
    
    days.forEach(day => {
      grid[day] = {};
      timeSlots.forEach(time => {
        const entry = currentTimetable.find(e => e.day === day && e.time === time);
        grid[day][time] = entry || null;
      });
    });
    
    return grid;
  };

  const grid = getTimetableGrid();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Class Timetable</h2>
          <p className="text-muted-foreground">Manage class schedules and periods</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Period
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Timetable Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <Label htmlFor="day">Day</Label>
                <Select name="day" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Time Slot</Label>
                <Select name="time" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required />
              </div>
              <div>
                <Label htmlFor="teacher">Teacher</Label>
                <Input id="teacher" name="teacher" required />
              </div>
              <Button type="submit" className="w-full">Add Entry</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Class Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Class</CardTitle>
            <Dialog open={addClassDialogOpen} onOpenChange={setAddClassDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddClass} className="space-y-4">
                  <div>
                    <Label htmlFor="className">Class Name</Label>
                    <Input 
                      id="className" 
                      name="className" 
                      placeholder="e.g., Class 11 or Grade 10-A"
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Class</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <div key={cls} className="relative group">
                <Button
                  variant={selectedClass === cls ? 'default' : 'outline'}
                  onClick={() => setSelectedClass(cls)}
                  className="pr-8"
                >
                  {cls}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(cls);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Class Confirmation Dialog */}
      <AlertDialog open={deleteClassDialogOpen} onOpenChange={setDeleteClassDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{classToDelete}"? This will permanently remove the class and all its timetable entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClassToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timetable for {selectedClass}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-3 bg-muted/50 text-left font-medium">Time</th>
                  {days.map((day) => (
                    <th key={day} className="border p-3 bg-muted/50 text-left font-medium">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="border p-3 bg-muted/30 font-medium text-sm">
                      {time}
                    </td>
                    {days.map((day) => {
                      const entry = grid[day][time];
                      return (
                        <td key={`${day}-${time}`} className="border p-3">
                          {entry ? (
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{entry.subject}</div>
                              <div className="text-xs text-muted-foreground">{entry.teacher}</div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleDelete(entry.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground text-center">-</div>
                          )}
                        </td>
                      );
                    })}
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
