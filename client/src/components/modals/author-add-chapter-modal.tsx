import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AuthorAddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (chapterData: any) => void;
  books: any[];
  isLoading: boolean;
}

export function AuthorAddChapterModal({ isOpen, onClose, onSubmit, books, isLoading }: AuthorAddChapterModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    chapter_num: "",
    content: "",
    book__id: "", // Author version uses book__id
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.chapter_num || !formData.book__id) {
      return; // Basic validation
    }

    const chapterData = {
      title: formData.title,
      chapter_num: parseInt(formData.chapter_num),
      content: formData.content || "", // Ensure content is not empty
      book__id: formData.book__id, // Keep book__id for author
    };

    console.log("Submitting author chapter data:", chapterData);
    onSubmit(chapterData);

    // Reset form
    setFormData({
      title: "",
      chapter_num: "",
      content: "",
      book__id: "",
    });
  };

  const handleClose = () => {
    setFormData({
      title: "",
      chapter_num: "",
      content: "",
      book__id: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة فصل جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book">الكتاب</Label>
            <Select value={formData.book__id} onValueChange={(value) => setFormData({ ...formData, book__id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الكتاب" />
              </SelectTrigger>
              <SelectContent>
                {books.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">عنوان الفصل</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: الفصل الأول"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter_num">رقم الفصل</Label>
            <Input
              id="chapter_num"
              type="number"
              min="1"
              value={formData.chapter_num}
              onChange={(e) => setFormData({ ...formData, chapter_num: e.target.value })}
              placeholder="1"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? "جاري الإنشاء..." : "إنشاء وبدء الكتابة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AuthorAddChapterModal;