import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, MessageSquare, FileText, ExternalLink, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSupport() {
  const { t } = useTranslation();

  const tickets = [
    { 
      id: 'TKT-001', 
      subject: 'Cannot access billing portal', 
      school: 'Greenwood High', 
      status: 'open', 
      priority: 'high',
      created: '2 hours ago' 
    },
    { 
      id: 'TKT-002', 
      subject: 'Student import failing', 
      school: 'Riverside Academy', 
      status: 'in-progress', 
      priority: 'medium',
      created: '1 day ago' 
    },
    { 
      id: 'TKT-003', 
      subject: 'Feature request: Bulk email', 
      school: 'Oakmont International', 
      status: 'resolved', 
      priority: 'low',
      created: '3 days ago' 
    },
  ];

  const faqs = [
    { question: 'How do I add a new school?', views: 1234 },
    { question: 'How to configure payment settings?', views: 856 },
    { question: 'Setting up email notifications', views: 678 },
    { question: 'Managing user permissions', views: 543 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.support')}</h1>
          <p className="text-muted-foreground">Help center and support tickets</p>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Open Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">4.2h</p>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">156</p>
            <p className="text-sm text-muted-foreground">Resolved This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold">2</p>
            <p className="text-sm text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Support Tickets</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    ticket.status === 'open' ? 'bg-warning/10' :
                    ticket.status === 'in-progress' ? 'bg-primary/10' : 'bg-success/10'
                  }`}>
                    {ticket.status === 'open' ? (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    ) : ticket.status === 'in-progress' ? (
                      <Clock className="h-5 w-5 text-primary" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{ticket.subject}</p>
                      <Badge variant={
                        ticket.priority === 'high' ? 'destructive' :
                        ticket.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ticket.id} • {ticket.school} • {ticket.created}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Help</CardTitle>
            <CardDescription>Common questions and resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search help articles..." className="pl-9" />
            </div>
            <div className="space-y-2">
              {faqs.map((faq) => (
                <button 
                  key={faq.question}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{faq.question}</p>
                      <p className="text-xs text-muted-foreground">{faq.views} views</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              View Documentation
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
