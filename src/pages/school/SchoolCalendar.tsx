import { useState, useMemo } from "react";
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
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, Info } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useUserWithProfile } from "@/hooks/users/user.hook";
import { useEvents, useCreateEvent, useDeleteEvent } from "@/hooks/calendar.hook";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: userProfile } = useUserWithProfile(user?.sub || '');
  const schoolId = userProfile?.schoolAdminProfile?.school?.id || '';
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { data: eventsData, isLoading } = useEvents(schoolId);
  const events = eventsData || [];
  
  const { mutate: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutate: deleteEvent } = useDeleteEvent(schoolId);

  const [newEvent, setNewEvent] = useState<any>({
    type: "event",
    startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!newEvent.title) newErrors.title = "Title is required";
    if (!newEvent.startDate) newErrors.startDate = "Start date is required";
    if (!newEvent.endDate) newErrors.endDate = "End date is required";
    if (new Date(newEvent.startDate) >= new Date(newEvent.endDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    if (newEvent.type === "exam") {
      if (!newEvent.grade) newErrors.grade = "Grade is required";
      if (!newEvent.subject) newErrors.subject = "Subject is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEvent = () => {
    if (!validate()) return;
    
    createEvent(
      {
        ...newEvent,
        schoolId,
        startDate: new Date(newEvent.startDate).toISOString(),
        endDate: new Date(newEvent.endDate).toISOString(),
      },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Event created successfully" });
          setIsDialogOpen(false);
          setErrors({});
          setNewEvent({
            type: "event",
            startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            endDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          });
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message;
          toast({ 
            title: "Error", 
            description: Array.isArray(message) ? message.join(", ") : "Failed to create event", 
            variant: "destructive" 
          });
        },
      }
    );
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event: any) => isSameDay(parseISO(event.startDate), date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id, {
      onSuccess: () => toast({ title: "Success", description: "Event deleted" }),
      onError: () => toast({ title: "Error", description: "Failed to delete event", variant: "destructive" }),
    });
  };

  const onDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const dayEvents = getEventsForDate(date);
      if (dayEvents.length === 0) {
        setNewEvent({
          ...newEvent,
          startDate: format(date, "yyyy-MM-dd'T'08:00"),
          endDate: format(date, "yyyy-MM-dd'T'09:00"),
        });
        setIsDialogOpen(true);
      }
    }
  };

  const eventDates = useMemo(() => {
    return events.map((e: any) => parseISO(e.startDate));
  }, [events]);

  const DayWithTooltip = (props: any) => {
    const { date, ...buttonProps } = props;
    const dayEvents = getEventsForDate(date);
    const hasEvents = dayEvents.length > 0;

    const content = (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{format(date, "d")}</span>
        {hasEvents && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
        )}
      </div>
    );

    if (!hasEvents) return <button {...buttonProps}>{content}</button>;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button {...buttonProps}>{content}</button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {dayEvents.map((e: any) => (
                <div key={e.id} className="text-xs">
                  <span className="font-bold">[{e.type.toUpperCase()}]</span> {e.title}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

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
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title" className={errors.title ? "text-destructive" : ""}>Title</Label>
                <Input
                  id="title"
                  value={newEvent.title || ""}
                  onChange={(e) => {
                    setNewEvent({ ...newEvent, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: "" });
                  }}
                  placeholder={newEvent.type === "exam" ? "e.g., Mathematics Final Exam" : "e.g., Sports Day"}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className={errors.startDate ? "text-destructive" : ""}>Start Date & Time</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={newEvent.startDate}
                    onChange={(e) => {
                      const start = e.target.value;
                      let end = newEvent.endDate;
                      // Ensure end date is at least 1 hour after start date
                      if (new Date(end) <= new Date(start)) {
                         const endDateObj = new Date(new Date(start).getTime() + 60 * 60 * 1000);
                         end = format(endDateObj, "yyyy-MM-dd'T'HH:mm");
                      }
                      setNewEvent({ ...newEvent, startDate: start, endDate: end });
                      setErrors({ ...errors, startDate: "", endDate: "" });
                    }}
                    className={errors.startDate ? "border-destructive" : ""}
                  />
                  {errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <Label htmlFor="endDate" className={errors.endDate ? "text-destructive" : ""}>End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={newEvent.endDate}
                    min={newEvent.startDate}
                    onChange={(e) => {
                      setNewEvent({ ...newEvent, endDate: e.target.value });
                      if (errors.endDate) setErrors({ ...errors, endDate: "" });
                    }}
                    className={errors.endDate ? "border-destructive" : ""}
                  />
                  {errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate}</p>}
                </div>
              </div>

              {newEvent.type === "exam" && (
                <>
                   <div>
                    <Label htmlFor="grade" className={errors.grade ? "text-destructive" : ""}>Grade</Label>
                    <Select
                      value={newEvent.grade}
                      onValueChange={(value) => {
                        setNewEvent({ ...newEvent, grade: value });
                        if (errors.grade) setErrors({ ...errors, grade: "" });
                      }}
                    >
                      <SelectTrigger className={errors.grade ? "border-destructive" : ""}>
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
                    {errors.grade && <p className="text-xs text-destructive mt-1">{errors.grade}</p>}
                  </div>

                  <div>
                    <Label htmlFor="subject" className={errors.subject ? "text-destructive" : ""}>Subject</Label>
                    <Input
                      id="subject"
                      value={newEvent.subject || ""}
                      onChange={(e) => {
                        setNewEvent({ ...newEvent, subject: e.target.value });
                        if (errors.subject) setErrors({ ...errors, subject: "" });
                      }}
                      placeholder="e.g., Mathematics"
                      className={errors.subject ? "border-destructive" : ""}
                    />
                    {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent} disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Event
                </Button>
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
              onSelect={onDateSelect}
              className="rounded-md border w-full"
              modifiers={{
                hasEvent: eventDates,
              }}
              modifiersClassNames={{
                hasEvent: "bg-primary/20 font-bold text-primary",
              }}
              components={{
                Day: DayWithTooltip,
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
                          <Badge variant={event.type === "exam" ? "destructive" : "secondary"}>
                            {event.type.toUpperCase()}
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
              .filter((e: any) => parseISO(e.startDate) >= new Date())
              .sort((a: any, b: any) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
              .slice(0, 10)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[50px]">
                      <div className="text-2xl font-bold">{format(parseISO(event.startDate), "d")}</div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {format(parseISO(event.startDate), "MMM")}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={event.type === "exam" ? "destructive" : "secondary"} className="text-xs">
                          {event.type.toUpperCase()}
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
            {events.filter((e: any) => parseISO(e.startDate) >= new Date()).length === 0 && (
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
