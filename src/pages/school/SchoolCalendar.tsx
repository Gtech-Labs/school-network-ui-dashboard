import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "exam" | "event";
  description?: string;
  grade?: string;
  subject?: string;
}

const SchoolCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Mathematics Final Exam",
      date: new Date(2025, 0, 20),
      type: "exam",
      grade: "Grade 10",
      subject: "Mathematics",
      description: "Final examination for Term 1"
    },
    {
      id: "2",
      title: "Sports Day",
      date: new Date(2025, 0, 25),
      type: "event",
      description: "Annual sports day event"
    },
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: "event",
    date: new Date(),
  });

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      const event: CalendarEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        type: newEvent.type || "event",
        description: newEvent.description,
        grade: newEvent.grade,
        subject: newEvent.subject,
      };
      setEvents([...events, event]);
      setIsDialogOpen(false);
      setNewEvent({ type: "event", date: new Date() });
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const eventDates = events.map(e => e.date);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage exams and events</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value: "exam" | "event") =>
                    setNewEvent({ ...newEvent, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEvent.title || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder={newEvent.type === "exam" ? "e.g., Mathematics Final Exam" : "e.g., Sports Day"}
                />
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date ? format(newEvent.date, "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: new Date(e.target.value) })
                    }
                  />
                </div>
              </div>

              {newEvent.type === "exam" && (
                <>
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Select
                      value={newEvent.grade}
                      onValueChange={(value) =>
                        setNewEvent({ ...newEvent, grade: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(12)].map((_, i) => (
                          <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                            Grade {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newEvent.subject || ""}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, subject: e.target.value })
                      }
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder="Add additional details..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
              modifiers={{
                hasEvent: eventDates,
              }}
              modifiersClassNames={{
                hasEvent: "bg-primary/20 font-bold",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border bg-card space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={event.type === "exam" ? "default" : "secondary"}>
                            {event.type === "exam" ? "Exam" : "Event"}
                          </Badge>
                        </div>
                        <h4 className="font-semibold">{event.title}</h4>
                        {event.grade && (
                          <p className="text-sm text-muted-foreground">{event.grade}</p>
                        )}
                        {event.subject && (
                          <p className="text-sm text-muted-foreground">{event.subject}</p>
                        )}
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No events scheduled for this date
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {events
              .filter(e => e.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 10)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{format(event.date, "d")}</div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {format(event.date, "MMM")}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={event.type === "exam" ? "default" : "secondary"} className="text-xs">
                          {event.type === "exam" ? "Exam" : "Event"}
                        </Badge>
                      </div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.grade && event.subject ? `${event.grade} - ${event.subject}` : event.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            {events.filter(e => e.date >= new Date()).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming events
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolCalendar;
