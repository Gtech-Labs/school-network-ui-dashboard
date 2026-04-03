import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generatePdfBlob(startDate: string, endDate: string): Blob {
  const title = 'School Report';
  const subtitle = `Period: ${startDate} to ${endDate}`;
  const generated = `Generated on: ${new Date().toLocaleDateString()}`;

  // Minimal valid PDF with report content
  const lines = [
    '%PDF-1.4',
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj',
    '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
  ];

  const contentLines = [
    `BT /F1 24 Tf 50 780 Td (${title}) Tj ET`,
    `BT /F1 12 Tf 50 750 Td (${subtitle}) Tj ET`,
    `BT /F1 10 Tf 50 725 Td (${generated}) Tj ET`,
    `BT /F1 12 Tf 50 690 Td (Summary) Tj ET`,
    `BT /F1 10 Tf 50 670 Td (Total Students: 24) Tj ET`,
    `BT /F1 10 Tf 50 655 Td (Total Teachers: 4) Tj ET`,
    `BT /F1 10 Tf 50 640 Td (Total Parents: 5) Tj ET`,
    `BT /F1 10 Tf 50 625 Td (Average Attendance: 94%) Tj ET`,
    `BT /F1 10 Tf 50 610 Td (Fee Collection Rate: 73%) Tj ET`,
    `BT /F1 12 Tf 50 575 Td (Academic Performance) Tj ET`,
    `BT /F1 10 Tf 50 555 Td (Grade 5 Average: 78%) Tj ET`,
    `BT /F1 10 Tf 50 540 Td (Grade 6 Average: 82%) Tj ET`,
    `BT /F1 10 Tf 50 525 Td (Grade 7 Average: 75%) Tj ET`,
    `BT /F1 12 Tf 50 490 Td (Financial Overview) Tj ET`,
    `BT /F1 10 Tf 50 470 Td (Total Fees Billed: R240,000) Tj ET`,
    `BT /F1 10 Tf 50 455 Td (Total Collected: R175,200) Tj ET`,
    `BT /F1 10 Tf 50 440 Td (Outstanding: R64,800) Tj ET`,
  ];

  const stream = contentLines.join('\n');
  const streamObj = `4 0 obj<</Length ${stream.length}>>stream\n${stream}\nendstream\nendobj`;
  lines.push(streamObj);

  const body = lines.join('\n');
  const xrefOffset = body.length;
  const xref = [
    'xref',
    '0 6',
    '0000000000 65535 f ',
    '0000000009 00000 n ',
    '0000000058 00000 n ',
    '0000000115 00000 n ',
    `${String(body.indexOf('4 0 obj')).padStart(10, '0')} 00000 n `,
    `${String(body.indexOf('5 0 obj')).padStart(10, '0')} 00000 n `,
  ].join('\n');

  const trailer = `trailer<</Size 6/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`;
  const pdfContent = body + '\n' + xref + '\n' + trailer;

  return new Blob([pdfContent], { type: 'application/pdf' });
}

export function GenerateReportDialog({ open, onOpenChange }: GenerateReportDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setGenerating(true);

    // Simulate a brief generation delay
    setTimeout(() => {
      const blob = generatePdfBlob(startDate, endDate);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `School_Report_${startDate}_to_${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Report downloaded for ${startDate} to ${endDate}`);
      setStartDate('');
      setEndDate('');
      setGenerating(false);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">Select the date range for your report.</p>
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={generating}>
            <Download className="mr-2 h-4 w-4" />
            {generating ? 'Generating...' : 'Download PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
