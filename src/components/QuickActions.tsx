import { UserPlus, MessageSquare, FileText, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface QuickActionsProps {
  onAddStudent?: () => void;
  onSendMessage?: () => void;
  onGenerateReport?: () => void;
  onScheduleEvent?: () => void;
}

export function QuickActions({
  onAddStudent,
  onSendMessage,
  onGenerateReport,
  onScheduleEvent,
}: QuickActionsProps) {
  const { t } = useTranslation();

  const actions = [
    {
      label: t('quickActions.addStudent', 'Add Student'),
      icon: UserPlus,
      onClick: onAddStudent,
    },
    {
      label: t('quickActions.sendMessage', 'Send Message'),
      icon: MessageSquare,
      onClick: onSendMessage,
    },
    {
      label: t('quickActions.generateReport', 'Generate Report'),
      icon: FileText,
      onClick: onGenerateReport,
    },
    {
      label: t('quickActions.scheduleEvent', 'Schedule Event'),
      icon: CalendarPlus,
      onClick: onScheduleEvent,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          className="gap-2 border-border/60 hover:bg-accent/50"
          onClick={action.onClick}
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
