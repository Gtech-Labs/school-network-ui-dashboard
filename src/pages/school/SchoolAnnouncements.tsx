import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Megaphone, Send, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: string;
  date: string;
  status: 'Sent' | 'Draft';
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Winter Break Notice',
    message: 'School will be closed from Dec 20 to Jan 5 for winter break.',
    audience: 'All Parents',
    date: '2024-01-02',
    status: 'Sent',
  },
  {
    id: '2',
    title: 'Parent-Teacher Meeting',
    message: 'Annual parent-teacher meetings scheduled for next week.',
    audience: 'All Parents',
    date: '2024-01-10',
    status: 'Sent',
  },
  {
    id: '3',
    title: 'Sports Day Announcement',
    message: 'Annual sports day will be held on February 15th.',
    audience: 'Students',
    date: '2024-01-15',
    status: 'Draft',
  },
];

const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

export default function SchoolAnnouncements() {
  const [announcements] = useState<Announcement[]>(mockAnnouncements);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGradeToggle = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade]
    );
  };

  const getAudienceDisplay = () => {
    if (audience === 'parents-by-grade' || audience === 'students-by-grade') {
      const recipientType = audience === 'parents-by-grade' ? 'Parents' : 'Students';
      if (selectedGrades.length === 0) return recipientType;
      return `${recipientType} of ${selectedGrades.join(', ')}`;
    }
    
    const audienceMap: Record<string, string> = {
      'all': 'All (Students, Parents, Teachers)',
      'parents': 'All Parents',
      'students': 'All Students',
      'teachers': 'All Teachers',
    };
    return audienceMap[audience] || audience;
  };

  const handleSendAnnouncement = () => {
    if (!title || !message) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if ((audience === 'parents-by-grade' || audience === 'students-by-grade') && selectedGrades.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one grade',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Announcement Sent',
      description: `Your announcement has been sent to ${getAudienceDisplay()}`,
    });

    setTitle('');
    setMessage('');
    setAudience('all');
    setSelectedGrades([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Announcements</h2>
          <p className="text-muted-foreground">
            Send notifications to students, parents, and teachers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.filter((a) => a.status === 'Sent').length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.filter((a) => a.status === 'Draft').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending announcements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">250+</div>
            <p className="text-xs text-muted-foreground">Total recipients</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Announcement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Create New Announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Announcement title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Write your announcement message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Send To</Label>
              <Select value={audience} onValueChange={(value) => {
                setAudience(value);
                setSelectedGrades([]);
              }}>
                <SelectTrigger id="audience">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All (Students, Parents, Teachers)</SelectItem>
                  <SelectItem value="parents">All Parents</SelectItem>
                  <SelectItem value="students">All Students</SelectItem>
                  <SelectItem value="teachers">All Teachers</SelectItem>
                  <SelectItem value="parents-by-grade">Parents of Certain Grades</SelectItem>
                  <SelectItem value="students-by-grade">Students of Certain Grades</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(audience === 'parents-by-grade' || audience === 'students-by-grade') && (
              <div className="space-y-2">
                <Label>Select Grades</Label>
                <div className="rounded-lg border p-4 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    {grades.map((grade) => (
                      <div key={grade} className="flex items-center space-x-2">
                        <Checkbox
                          id={grade}
                          checked={selectedGrades.includes(grade)}
                          onCheckedChange={() => handleGradeToggle(grade)}
                        />
                        <label
                          htmlFor={grade}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {grade}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedGrades.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedGrades.join(', ')}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSendAnnouncement} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Send Announcement
              </Button>
              <Button variant="outline">Save Draft</Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-semibold">{announcement.title}</h4>
                    <Badge
                      variant={
                        announcement.status === 'Sent' ? 'default' : 'secondary'
                      }
                    >
                      {announcement.status}
                    </Badge>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {announcement.message}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {announcement.audience}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {announcement.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
