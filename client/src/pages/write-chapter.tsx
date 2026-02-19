import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save, Upload, FileText, Layout, Type, Hash, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { libraryApi } from "@/lib/api";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Link, useLocation } from "wouter";

export default function WriteChapterPage() {
    const [params] = useLocation();
    // Extract chapterId from URL path: /author/write-chapter/:chapterId
    const chapterId = params.split("/").pop();

    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch chapter data
    const { data: chapter, isLoading } = useQuery({
        queryKey: [`/api/chapters/${chapterId}`],
        queryFn: async () => {
            // Assuming we have an endpoint for single chapter or filter via list
            // For now, let's use the list filter if single endpoint doesn't exist, 
            // but ideally we should add GET /api/chapters/:id. 
            // Since it's not confirmed, I will check if routes has it.
            // Based on previous context, routes has GET /api/users/:id but maybe not chapters/:id?
            // Wait, standard CRUD usually has it. 
            // If not, I'll filter from list or add endpoint.
            // Let's assume GET /api/chapters/:id exists or add it.
            const res = await fetch(`/api/chapters/${chapterId}`);
            if (!res.ok) throw new Error("Failed to fetch chapter");
            return res.json();
        },
        enabled: !!chapterId
    });

    // Fetch book details for context
    const { data: book } = useQuery({
        queryKey: [`/api/books/${chapter?.book__id}`],
        queryFn: async () => {
            const res = await fetch(`/api/books/${chapter?.book__id}`);
            if (!res.ok) throw new Error("Failed to fetch book");
            return res.json();
        },
        enabled: !!chapter?.book__id
    });

    useEffect(() => {
        if (chapter) {
            let contentStr = "";
            if (Array.isArray(chapter.content)) {
                // Join array elements to form the HTML string. 
                // If elements are just text, this might need <p> wrapping, but assuming it's stored as HTML segments:
                contentStr = chapter.content.join("");
            } else if (typeof chapter.content === 'string') {
                contentStr = chapter.content;
            }
            setContent(contentStr);
        }
    }, [chapter]);

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            return libraryApi.updateChapter(chapterId!, data);
        },
        onSuccess: () => {
            toast({
                title: "تم الحفظ",
                description: "تم حفظ محتوى الفصل بنجاح",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
            setIsSaving(false);
        },
        onError: (error: any) => {
            toast({
                title: "خطأ في الحفظ",
                description: error.message || "حدث خطأ أثناء حفظ الفصل",
                variant: "destructive",
            });
            setIsSaving(false);
        }
    });

    const handleSave = () => {
        if (!chapter) return;
        setIsSaving(true);
        // Include existing fields to prevent "unexpected null value" errors for non-nullable fields
        updateMutation.mutate({
            content,
            title: chapter.title,
            chapter_num: chapter.chapter_num,
            book__id: chapter.book__id
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!chapter) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <h1 className="text-2xl font-bold text-slate-800">الفصل غير موجود</h1>
                <Link href="/author-chapters">
                    <Button variant="outline">عودة للفصول</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col" dir="rtl">
            {/* Header / Toolbar */}
            <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/author-chapters">
                        <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full">
                            <ArrowRight className="w-5 h-5 text-slate-600" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-0.5">
                            <span className="font-medium text-blue-600">{book?.title || "جار التحميل..."}</span>
                            <span>/</span>
                            <span>الفصل {chapter.chapter_num}</span>
                        </div>
                        <h1 className="text-lg font-bold text-slate-900">{chapter.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-4 text-xs text-slate-400 ml-4 border-l border-slate-100 pl-4">
                        <span className="flex items-center gap-1">
                            <Type className="w-3 h-3" />
                            {content.replace(/<[^>]*>/g, '').length} حرف
                        </span>
                        <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {content.split(/\s+/).filter(Boolean).length} كلمة
                        </span>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 min-w-[100px]"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>حفظ</span>
                    </Button>
                </div>
            </header>

            {/* Editor Area */}
            <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
                <div className="prose prose-lg max-w-none focus:outline-none min-h-[500px]">
                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="ابدأ كتابة فصلك الجديد هنا..."
                        className="min-h-[60vh]"
                    />
                </div>
            </main>
        </div>
    );
}
