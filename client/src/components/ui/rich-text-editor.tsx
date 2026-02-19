import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
}

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'link', 'image'
];

export default function RichTextEditor({ value, onChange, placeholder, className, style }: RichTextEditorProps) {
    return (
        <div className={`rich-text-editor ${className}`} style={style}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="h-full"
            />
            <style>{`
        .ql-container {
          font-family: inherit;
          font-size: 1.1rem;
          line-height: 1.8;
          min-height: 300px;
        }
        .ql-editor {
          min-height: 300px;
          direction: rtl;
          text-align: right;
        }
        .ql-toolbar {
          direction: ltr; /* Toolbar icons LTR */
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
          background: #f8fafc;
          border-color: #e2e8f0 !important;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        .ql-container.ql-snow {
          border-color: #e2e8f0 !important;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          background: white;
        }
      `}</style>
        </div>
    );
}
