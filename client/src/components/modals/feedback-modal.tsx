import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageSquarePlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: any; // Optional user context
}

export default function FeedbackModal({ isOpen, onClose, user }: FeedbackModalProps) {
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState<number | null>(null);
    const { toast } = useToast();

    const feedbackMutation = useMutation({
        mutationFn: async (data: { message: string; rating: number | null; user_id?: string }) => {
            const res = await apiRequest("POST", "/api/feedback", data);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "تم الإرسال بنجاح",
                description: "شكراً لمشاركتنا رأيك!",
            });
            onClose();
            setMessage("");
            setRating(null);
        },
        onError: () => {
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء إرسال ملاحظاتك. يرجى المحاولة مرة أخرى.",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = () => {
        if (!message.trim()) {
            toast({
                title: "تنبيه",
                description: "يرجى كتابة رسالتك قبل الإرسال",
                variant: "destructive",
            });
            return;
        }

        feedbackMutation.mutate({
            message,
            rating,
            user_id: user?.id,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <MessageSquarePlus className="w-5 h-5 text-blue-600" />
                        شكاوى ومقترحات
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="message">ما رأيك في الموقع؟ (شكوى / اقتراح)</Label>
                        <Textarea
                            id="message"
                            placeholder="اكتب ملاحظاتك هنا..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="h-32 resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>تقييمك لتجربتك (اختياري)</Label>
                        <div className="flex justify-center gap-2 rtl:flex-row-reverse">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`transition-colors duration-200 focus:outline-none ${rating && star <= rating ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                >
                                    <Star className="w-8 h-8 fill-current" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button onClick={handleSubmit} disabled={feedbackMutation.isPending}>
                        {feedbackMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        إرسال
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
