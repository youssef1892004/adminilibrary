import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    folder?: "books" | "authors" | "users";
    className?: string;
    placeholder?: string;
}

export default function ImageUpload({
    value,
    onChange,
    folder = "books",
    className = "",
    placeholder = "Click or drag image to upload"
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFile = async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "خطأ في الملف",
                description: "يرجى تحميل ملف صورة صالح (JPG, PNG, WEBP)",
                variant: "destructive"
            });
            return;
        }

        // Validate size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "حجم الملف كبير جداً",
                description: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('cover', file);

        try {
            const response = await fetch(`/api/upload?folder=${folder}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            onChange(data.url);
            toast({
                title: "تم التحميل",
                description: "تم تحميل الصورة بنجاح",
            });
        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: "فشل التحميل",
                description: "حدث خطأ أثناء تحميل الصورة. يرجى المحاولة مرة أخرى.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleRemove = () => {
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={`space-y-4 w-full ${className}`}>
            <div
                className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 text-center ${dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                    } ${value ? "h-auto" : "h-48 flex flex-col items-center justify-center cursor-pointer"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !value && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                    disabled={isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-2" />
                        <p className="text-sm text-slate-500 font-medium">جاري تحميل الصورة...</p>
                    </div>
                ) : value ? (
                    <div className="relative group w-full">
                        <div className="relative w-full aspect-video md:aspect-[3/2] rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-900/5">
                            <img
                                src={value}
                                alt="Uploaded image"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                    className="bg-white/90 hover:bg-white text-slate-800"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    تغيير
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove();
                                    }}
                                    className="bg-red-500/90 hover:bg-red-600"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    حذف
                                </Button>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            تم تحميل الصورة بنجاح
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 p-6">
                        <div className="p-3 bg-blue-50 rounded-full mb-3 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-700 mb-1">اضغط للتحميل أو اسحب الصورة هنا</p>
                        <p className="text-xs text-slate-400">JPG, PNG, GIF up to 5MB</p>
                    </div>
                )}
            </div>
        </div>
    );
}
