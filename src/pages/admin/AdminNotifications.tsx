import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Megaphone, Send, Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { mockSchools } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  recipients: string[];
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Sent' | 'Draft';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Platform Maintenance',
    message: 'Scheduled maintenance on Sunday, 2 AM - 4 AM EST',
    recipients: ['All Schools'],
    date: '2024-01-15',
    priority: 'High',
    status: 'Sent',
  },
  {
    id: '2',
    title: 'New Feature Release',
    message: 'Check out our new analytics dashboard with enhanced reporting',
    recipients: ['All Schools'],
    date: '2024-01-10',
    priority: 'Medium',
    status: 'Sent',
  },
  {
    id: '3',
    title: 'Payment Reminder',
    message: 'Monthly subscription payment due in 5 days',
    recipients: ['Maple Leaf Academy'],
    date: '2024-01-20',
    priority: 'High',
    status: 'Draft',
  },
];

export default function AdminNotifications() {
  const [notifications] = useState<Notification[]>(mockNotifications);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSendNotification = () => {
    if (!title || !message || selectedSchools.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields and select at least one school',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Notification Sent',
      description: `Notification sent to ${selectedSchools.length} school(s)`,
    });

    setTitle('');
    setMessage('');
    setSelectedSchools([]);
  };

  const toggleSchool = (schoolId: string) => {
    setSelectedSchools((prev) =>
      prev.includes(schoolId)
        ? prev.filter((id) => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const toggleAllSchools = () => {
    if (selectedSchools.length === mockSchools.length) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(mockSchools.map((s) => s.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Platform Notifications</h2>
          <p className="text-muted-foreground">
            Send system-wide notifications to schools
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
              {notifications.filter((n) => n.status === 'Sent').length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter((n) => n.priority === 'High').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter((n) => n.status === 'Draft').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending notifications</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Create Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Notification title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Write your notification message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High Priority</SelectItem>
                  <SelectItem value="Medium">Medium Priority</SelectItem>
                  <SelectItem value="Low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Select Schools</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllSchools}
                  type="button"
                >
                  {selectedSchools.length === mockSchools.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                {mockSchools.map((school) => (
                  <div key={school.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={school.id}
                      checked={selectedSchools.includes(school.id)}
                      onCheckedChange={() => toggleSchool(school.id)}
                    />
                    <label
                      htmlFor={school.id}
                      className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {school.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({school.studentsCount} students)
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedSchools.length} school(s) selected
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSendNotification} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Send Notification
              </Button>
              <Button variant="outline">Save Draft</Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-semibold">{notification.title}</h4>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          notification.priority === 'High'
                            ? 'destructive'
                            : notification.priority === 'Medium'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {notification.priority}
                      </Badge>
                      <Badge
                        variant={
                          notification.status === 'Sent' ? 'default' : 'secondary'
                        }
                      >
                        {notification.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>To: {notification.recipients.join(', ')}</span>
                    <span>{notification.date}</span>
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
