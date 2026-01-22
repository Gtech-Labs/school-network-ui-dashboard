import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Search, Inbox, Star, Archive } from 'lucide-react';

export default function AdminMessages() {
  const { t } = useTranslation();
  const [selectedMessage, setSelectedMessage] = useState<number | null>(0);

  const messages = [
    { 
      id: 1, 
      from: 'Greenwood High School', 
      subject: 'Billing inquiry for January', 
      preview: 'Hi, we noticed a discrepancy in our January invoice...', 
      time: '10:30 AM',
      unread: true,
      starred: false
    },
    { 
      id: 2, 
      from: 'Riverside Academy', 
      subject: 'Feature request - Parent app', 
      preview: 'We would love to have a dedicated mobile app for parents...', 
      time: 'Yesterday',
      unread: false,
      starred: true
    },
    { 
      id: 3, 
      from: 'Oakmont International', 
      subject: 'Thank you for the support', 
      preview: 'Just wanted to express our gratitude for the quick response...', 
      time: '2 days ago',
      unread: false,
      starred: false
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.messages')}</h1>
          <p className="text-muted-foreground">Communication center for school inquiries</p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Inbox className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Inbox</p>
              <p className="text-sm text-muted-foreground">12 messages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium">Starred</p>
              <p className="text-sm text-muted-foreground">3 messages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Send className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium">Sent</p>
              <p className="text-sm text-muted-foreground">24 messages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Archive className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Archive</p>
              <p className="text-sm text-muted-foreground">156 messages</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg.id)}
                  className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                    selectedMessage === msg.id ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${msg.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {msg.from}
                        </p>
                        {msg.unread && <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />}
                      </div>
                      <p className="text-sm font-medium truncate">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">{msg.preview}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                      {msg.starred && <Star className="h-3 w-3 text-warning fill-warning" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Billing inquiry for January</h3>
                    <p className="text-sm text-muted-foreground">From: Greenwood High School</p>
                  </div>
                  <span className="text-sm text-muted-foreground">10:30 AM</span>
                </div>
                <div className="border-t pt-4">
                  <p className="text-foreground leading-relaxed">
                    Hi,<br /><br />
                    We noticed a discrepancy in our January invoice. The amount charged was R12,500 but based on our 
                    subscription plan and student count, we expected R11,800.<br /><br />
                    Could you please review and clarify?<br /><br />
                    Best regards,<br />
                    Admin Team, Greenwood High School
                  </p>
                </div>
                <div className="border-t pt-4 flex gap-2">
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline">Forward</Button>
                  <Button variant="outline">Archive</Button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mr-4 opacity-20" />
                <p>Select a message to view</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
