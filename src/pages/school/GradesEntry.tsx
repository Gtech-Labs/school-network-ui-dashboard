import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, 
    ChevronRight, 
    ChevronLeft, 
    Loader2, 
    AlertCircle, 
    BookOpen, 
    Users, 
    Calendar, 
    Target, 
    Save, 
    ArrowLeft,
    Check,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 'class' | 'subject' | 'term' | 'assessment' | 'marks' | 'preview' | 'success';

interface TeacherInfo {
    teacherId: string;
    teacherName: string;
    schoolId: string;
    assignedClasses: string[];
    subjects: string[]; // We'll add this if possible or fetch it
}

interface Student {
    id: string;
    fullName: string;
    idNumber: string;
}

export default function GradesEntry() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
    const [step, setStep] = useState<Step>('class');
    const [progress, setProgress] = useState(0);

    // Form Data
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedTerm, setSelectedTerm] = useState<string>('');
    const [assessmentType, setAssessmentType] = useState<string>('');
    const [assessmentTitle, setAssessmentTitle] = useState<string>('');
    const [maxScore, setMaxScore] = useState<number>(100);
    const [assessmentDate, setAssessmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    
    const [students, setStudents] = useState<Student[]>([]);
    const [marks, setMarks] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState(false);

    const steps: Step[] = ['class', 'subject', 'term', 'assessment', 'marks', 'preview', 'success'];
    const currentStepIndex = steps.indexOf(step);

    useEffect(() => {
        if (!token) {
            setError("No access token provided. Please use the link sent to your WhatsApp.");
            setLoading(false);
            return;
        }

        const verifyToken = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${baseUrl}/academic-records/verify-magic-link?token=${token}`);
                
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || "Invalid or expired link.");
                }

                const data = await response.json();
                setTeacherInfo(data);
                
                // Fetch subjects for this school/teacher if not in data
                // For now, let's assume we fetch them separately if needed
                // data.subjects = ... 
                
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    useEffect(() => {
        setProgress(((currentStepIndex) / (steps.length - 1)) * 100);
    }, [step]);

    // Fetch students when class is selected
    useEffect(() => {
        if (selectedClass && teacherInfo?.schoolId) {
            const fetchStudents = async () => {
                try {
                    const baseUrl = import.meta.env.VITE_API_URL;
                    const response = await fetch(`${baseUrl}/students/profiles-per-school?schoolId=${teacherInfo.schoolId}`);
                    if (!response.ok) throw new Error("Failed to fetch students");
                    const responseData = await response.json();
                    const allStudents = responseData.data || [];
                    // Filter by class (case insensitive and trimmed)
                    const filtered = allStudents.filter((s: any) => 
                        s.grade?.toString().toLowerCase().trim() === selectedClass.toLowerCase().trim()
                    );
                    setStudents(filtered);
                } catch (err) {
                    toast.error("Could not load students for this class.");
                }
            };
            fetchStudents();
        }
    }, [selectedClass, teacherInfo?.schoolId]);

    const handleNext = () => {
        if (step === 'class' && !selectedClass) return toast.error("Please select a class");
        if (step === 'subject' && !selectedSubject) return toast.error("Please select a subject");
        if (step === 'term' && !selectedTerm) return toast.error("Please select a term");
        if (step === 'assessment' && (!assessmentType || !assessmentTitle || !maxScore)) return toast.error("Please fill all assessment details");
        
        const nextStep = steps[currentStepIndex + 1];
        if (nextStep) setStep(nextStep);
    };

    const handleBack = () => {
        const prevStep = steps[currentStepIndex - 1];
        if (prevStep) setStep(prevStep);
    };

    const handleMarkChange = (studentId: string, value: string) => {
        const score = parseFloat(value);
        if (isNaN(score)) {
            const newMarks = { ...marks };
            delete newMarks[studentId];
            setMarks(newMarks);
            return;
        }
        if (score > maxScore) {
            toast.warning(`Score cannot exceed max mark (${maxScore})`);
            return;
        }
        setMarks(prev => ({ ...prev, [studentId]: score }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const records = students.map(student => ({
                studentId: student.id,
                grade: selectedClass,
                subject: selectedSubject,
                term: selectedTerm,
                assessmentType,
                assessmentTitle,
                maxScore,
                achievedScore: marks[student.id] || 0,
                date: assessmentDate,
                capturedBy: teacherInfo?.teacherName
            }));

            const response = await fetch(`${baseUrl}/academic-records/bulk-grades?token=${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ records })
            });

            if (!response.ok) throw new Error("Failed to submit grades");

            setStep('success');
            toast.success("Grades submitted successfully!");
        } catch (err) {
            toast.error("Submission failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-muted/50">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse font-medium">Verifying your magic link...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
                <div className="max-w-sm w-full space-y-6 text-center">
                    <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                        Go to Homepage
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-12">
            {/* Header */}
            <div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-primary/5">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none">Grades Entry</h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">
                                {teacherInfo?.teacherName}
                            </p>
                        </div>
                    </div>
                    {step !== 'success' && (
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-1">Progress</p>
                            <div className="flex items-center gap-2">
                                <Progress value={progress} className="w-20 h-1.5" />
                                <span className="text-xs font-bold">{Math.round(progress)}%</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-6 pt-8">
                <div className="space-y-8">
                    {/* Step Content */}
                    {step === 'class' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2 text-center md:text-left">
                                <h2 className="text-2xl font-bold tracking-tight">Which class are you marking?</h2>
                                <p className="text-muted-foreground">Select one of your assigned classes to continue.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {teacherInfo?.assignedClasses?.map((cls) => (
                                    <button
                                        key={cls}
                                        onClick={() => setSelectedClass(cls)}
                                        className={cn(
                                            "flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 text-left group",
                                            selectedClass === cls 
                                                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]" 
                                                : "border-muted bg-card hover:border-primary/30 hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                                selectedClass === cls ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                            )}>
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{cls}</p>
                                                <p className="text-xs text-muted-foreground">Homeroom Class</p>
                                            </div>
                                        </div>
                                        {selectedClass === cls && <CheckCircle2 className="h-5 w-5 text-primary" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'subject' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">Select the Subject</h2>
                                <p className="text-muted-foreground">Choose the course for which you are entering marks.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {teacherInfo?.subjects && teacherInfo.subjects.length > 0 ? (
                                    teacherInfo.subjects.map((subject) => (
                                        <button
                                            key={subject}
                                            onClick={() => setSelectedSubject(subject)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                                                selectedSubject === subject 
                                                    ? "border-primary bg-primary/5" 
                                                    : "border-muted hover:border-primary/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-10 w-10 rounded-lg flex items-center justify-center",
                                                selectedSubject === subject ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            )}>
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <span className="font-bold">{subject}</span>
                                            {selectedSubject === subject && <Check className="ml-auto h-5 w-5 text-primary" />}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-12 text-center border-2 border-dashed rounded-2xl">
                                        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">No subjects assigned to your profile. Please contact admin.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'term' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">Academic Term</h2>
                                <p className="text-muted-foreground">Select the current grading period.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {["Term 1", "Term 2", "Term 3"].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => setSelectedTerm(term)}
                                        className={cn(
                                            "flex items-center justify-between p-6 rounded-2xl border-2 transition-all",
                                            selectedTerm === term 
                                                ? "border-primary bg-primary/5" 
                                                : "border-muted hover:border-primary/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Calendar className={cn("h-6 w-6", selectedTerm === term ? "text-primary" : "text-muted-foreground")} />
                                            <span className="font-bold text-lg">{term}</span>
                                        </div>
                                        {selectedTerm === term && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"><Check className="h-4 w-4 text-white" /></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'assessment' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">Assessment Details</h2>
                                <p className="text-muted-foreground">Provide context for this grading entry.</p>
                            </div>
                            <Card className="border-2 border-primary/5 shadow-xl shadow-primary/5 overflow-hidden">
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Type</Label>
                                            <Select value={assessmentType} onValueChange={setAssessmentType}>
                                                <SelectTrigger className="h-12 border-muted-foreground/20">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Test">Class Test</SelectItem>
                                                    <SelectItem value="Exam">Final Exam</SelectItem>
                                                    <SelectItem value="Assignment">Assignment</SelectItem>
                                                    <SelectItem value="Project">Project</SelectItem>
                                                    <SelectItem value="Quiz">Quick Quiz</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Max Mark</Label>
                                            <div className="relative">
                                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    type="number" 
                                                    value={maxScore} 
                                                    onChange={(e) => setMaxScore(parseInt(e.target.value))} 
                                                    className="pl-10 h-12 border-muted-foreground/20 font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Assessment Title</Label>
                                        <Input 
                                            placeholder="e.g. Mid-term Algebra Quiz" 
                                            value={assessmentTitle} 
                                            onChange={(e) => setAssessmentTitle(e.target.value)}
                                            className="h-12 border-muted-foreground/20 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Date Conducted</Label>
                                        <Input 
                                            type="date" 
                                            value={assessmentDate} 
                                            onChange={(e) => setAssessmentDate(e.target.value)}
                                            className="h-12 border-muted-foreground/20"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {step === 'marks' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2 sticky top-20 bg-background/95 backdrop-blur-md pb-4 z-20">
                                <h2 className="text-2xl font-bold tracking-tight">Enter Student Marks</h2>
                                <p className="text-muted-foreground">Recording grades for <span className="text-primary font-bold">{selectedClass}</span> — <span className="text-primary font-bold">{selectedSubject}</span></p>
                                <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                                    <div className="text-xs">
                                        <p className="text-muted-foreground font-medium uppercase tracking-tighter">Students Loaded</p>
                                        <p className="font-bold text-lg">{students.length}</p>
                                    </div>
                                    <div className="text-right text-xs">
                                        <p className="text-muted-foreground font-medium uppercase tracking-tighter">Max Mark</p>
                                        <p className="font-bold text-lg">{maxScore}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pb-24">
                                {students.length === 0 ? (
                                    <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
                                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                        <p className="text-muted-foreground font-medium">No students found for {selectedClass}.</p>
                                        <p className="text-xs text-muted-foreground mt-1">Please ensure students are assigned to this grade in the system.</p>
                                    </div>
                                ) : (
                                    students.map((student) => (
                                    <div key={student.id} className="group relative flex items-center justify-between p-4 rounded-2xl border-2 border-muted bg-card hover:border-primary/30 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {student.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm leading-none">{student.fullName}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-medium">{student.idNumber}</p>
                                            </div>
                                        </div>
                                        <div className="w-24 relative">
                                            <Input
                                                type="number"
                                                placeholder="0.0"
                                                value={marks[student.id] ?? ''}
                                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                className="h-12 text-right pr-4 font-bold rounded-xl border-muted-foreground/10 focus-visible:ring-primary text-lg"
                                            />
                                            {marks[student.id] !== undefined && (
                                                <div className="absolute -top-2 -right-2 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )))}
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">Review & Submit</h2>
                                <p className="text-muted-foreground">Verify the details before finalizing the entry.</p>
                            </div>

                            <Card className="border-2 border-primary/10 shadow-2xl shadow-primary/5">
                                <CardHeader className="bg-primary/5 border-b border-primary/5">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        Summary Report
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Class</p>
                                            <p className="font-bold">{selectedClass}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Subject</p>
                                            <p className="font-bold">{selectedSubject}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Term</p>
                                            <p className="font-bold">{selectedTerm}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Assessment</p>
                                            <p className="font-bold">{assessmentType}: {assessmentTitle}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-muted">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Statistics</p>
                                            <Badge variant="outline" className="font-bold">{students.length} Students</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-3 rounded-xl bg-muted/50 text-center">
                                                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter mb-1">Avg Score</p>
                                                <p className="text-lg font-bold">
                                                    {Object.values(marks).length > 0 
                                                        ? (Object.values(marks).reduce((a, b) => a + b, 0) / Object.values(marks).length).toFixed(1) 
                                                        : '0.0'}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-muted/50 text-center">
                                                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter mb-1">Highest</p>
                                                <p className="text-lg font-bold">
                                                    {Object.values(marks).length > 0 ? Math.max(...Object.values(marks)) : '0'}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-muted/50 text-center">
                                                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter mb-1">Lowest</p>
                                                <p className="text-lg font-bold">
                                                    {Object.values(marks).length > 0 ? Math.min(...Object.values(marks)) : '0'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/30 p-4">
                                    <div className="flex items-start gap-3 text-xs text-muted-foreground">
                                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                        <p>Confirming this will post grades to student profiles and notify parents immediately via the mobile app.</p>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-12 space-y-8 text-center animate-in zoom-in-95 fade-in duration-700">
                            <div className="relative mx-auto h-24 w-24">
                                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                                <div className="relative h-24 w-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
                                    <Check className="h-12 w-12 text-white stroke-[3px]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-extrabold tracking-tight">Successfully Posted!</h2>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    Grades for <span className="font-bold text-foreground">{selectedClass}</span> have been securely saved and parent notifications are being sent.
                                </p>
                            </div>
                            <div className="pt-4 flex flex-col gap-3 max-w-xs mx-auto">
                                <Button className="h-12 rounded-xl shadow-lg" onClick={() => window.location.reload()}>
                                    Enter More Grades
                                </Button>
                                <Button variant="outline" className="h-12 rounded-xl" onClick={() => navigate('/')}>
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Sticky Action Footer */}
            {step !== 'success' && (
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-primary/5 z-40">
                    <div className="max-w-2xl mx-auto flex items-center gap-4">
                        {currentStepIndex > 0 && (
                            <Button variant="outline" className="h-14 w-14 rounded-2xl border-2" onClick={handleBack} disabled={submitting}>
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        )}
                        {step === 'preview' ? (
                            <Button 
                                className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90" 
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                {submitting ? "Posting Grades..." : "Finalize & Post Grades"}
                            </Button>
                        ) : (
                            <Button 
                                className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90" 
                                onClick={handleNext}
                            >
                                Next Step
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
