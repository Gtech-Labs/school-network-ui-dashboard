import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Plus, Send, Calendar, Users, Eye } from 'lucide-react';

export default function AdminAnnouncements() {
  const { t } = useTranslation();

  const announcements = [
    { 
      id: 1, 
      title: 'Platform Maintenance Scheduled', 
      content: 'We will be performing scheduled maintenance on January 20th from 2:00 AM to 4:00 AM.',
      audience: 'All Schools',
      status: 'published',
      date: '2024-01-15',
      views: 245
    },
    { 
      id: 2, 
      title: 'New Feature: Parent Portal', 
      content: 'We are excited to announce the launch of our new Parent Portal feature!',
      audience: 'All Schools',
      status: 'published',
      date: '2024-01-10',
      views: 189
    },
    { 
      id: 3, 
      title: 'Holiday Schedule Update', 
      content: 'Please note the updated holiday schedule for the upcoming term.',
      audience: 'Premium Schools',
      status: 'draft',
      date: '2024-01-18',
      views: 0
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.announcements')}</h1>
          <p className="text-muted-foreground">Send announcements to all schools on the platform</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Megaphone className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{announcements.length}</p>
            <p className="text-sm text-muted-foreground">Total Announcements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Send className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">2</p>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-muted-foreground">Schools Reached</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">434</p>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>Manage platform-wide announcements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{announcement.title}</h3>
                    <Badge variant={announcement.status === 'published' ? 'default' : 'secondary'}>
                      {announcement.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{announcement.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {announcement.audience}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {announcement.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {announcement.views} views
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Announcement</CardTitle>
            <CardDescription>Send a quick announcement to all schools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Announcement title..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea placeholder="Write your announcement..." rows={4} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Audience</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">All Schools</Button>
                <Button variant="outline" size="sm" className="flex-1">Premium Only</Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Publish
              </Button>
              <Button variant="outline">Save Draft</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
