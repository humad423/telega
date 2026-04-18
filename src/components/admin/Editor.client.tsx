'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Typography } from '@tiptap/extension-typography';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export function ProfessionalEditor({ 
    value, 
    onChange, 
    locale 
}: { 
    value: any, 
    onChange: (val: any) => void, 
    locale: string 
}) {
    const [isUploading, setIsUploading] = useState(false);
    const [editMode, setEditMode] = useState<'compose' | 'html'>('compose');
    const [htmlValue, setHtmlValue] = useState('');
    const [forceUpdate, setForceUpdate] = useState(0);
    const [currentHeading, setCurrentHeading] = useState('p');
    const [mounted, setMounted] = useState(false);
    const [activePicker, setActivePicker] = useState<'color' | 'highlight' | null>(null);
    const hasInitialized = useRef(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const highlightPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle outside click to close pickers
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                if (activePicker === 'color') setActivePicker(null);
            }
            if (highlightPickerRef.current && !highlightPickerRef.current.contains(event.target as Node)) {
                if (activePicker === 'highlight') setActivePicker(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activePicker]);

    // Validated content for Initial Load
    const safeContent = typeof value === 'string' 
        ? (value.startsWith('{') ? JSON.parse(value) : value) 
        : (value && typeof value === 'object' && Object.keys(value).length > 0 ? value : '');

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            TextStyle,
            FontFamily,
            Color,
            Highlight.configure({ multicolor: true }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({ openOnClick: false }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Subscript,
            Superscript,
            Typography,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full my-4 mx-auto block h-auto shadow-md',
                },
            }),
            Placeholder.configure({ placeholder: 'Start drafting your masterpiece...' }),
        ],
        content: safeContent,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        onTransaction: ({ editor }) => {
            const { selection } = editor.state;
            const $pos = selection.$from;
            let level: string = 'p';
            
            for (let d = $pos.depth; d >= 0; d--) {
                const node = $pos.node(d);
                if (node && node.type.name === 'heading') {
                    level = node.attrs.level.toString();
                    break;
                }
            }
            
            if (level !== currentHeading) {
                setCurrentHeading(level);
                setForceUpdate(prev => prev + 1);
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[800px] p-12 lg:p-20 font-["Inter","Tajawal"] leading-relaxed',
            },
        },
    });

    // Handle initial load
    useEffect(() => {
        if (editor && value && !hasInitialized.current) {
            // Support both JSON (legacy) and HTML
            let incomingContent = value;
            if (typeof value === 'string' && value.startsWith('{')) {
                try {
                    incomingContent = JSON.parse(value);
                } catch (e) {
                    incomingContent = value;
                }
            }
            editor.commands.setContent(incomingContent, { emitUpdate: false });
            setHtmlValue(editor.getHTML());
            hasInitialized.current = true;
        }
    }, [value, editor]);

    // Mode Toggle Logic
    const toggleEditMode = (mode: 'compose' | 'html') => {
        if (!editor) return;
        if (mode === 'compose' && editMode === 'html') {
            editor.commands.setContent(htmlValue);
        } else if (mode === 'html' && editMode === 'compose') {
            setHtmlValue(editor.getHTML());
        }
        setEditMode(mode);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `articles/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('blog')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('blog')
                .getPublicUrl(filePath);

            editor.chain().focus().setImage({ src: publicUrl }).run();
        } catch (err) {
            console.error('[Upload Error]:', err);
            alert('Failed to upload image.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!mounted || !editor) return (
        <div className="flex-1 min-h-[800px] bg-white dark:bg-slate-900 flex items-center justify-center">
             <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!editor) return null;

    return (
        <div className="flex flex-col bg-[#F8F9FA] dark:bg-slate-950 min-h-[800px]">
            {/* ABSOLUTE VISUAL HIERARCHY INJECTION */}
            <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
                .ProseMirror h1 { 
                    font-size: 5rem !important; 
                    line-height: 1 !important; 
                    font-weight: 900 !important; 
                    letter-spacing: -0.05em !important; 
                    margin-bottom: 2.5rem !important;
                    margin-top: 3rem !important;
                    color: #000 !important;
                    display: block !important;
                }
                .ProseMirror h2 { 
                    font-size: 3.5rem !important; 
                    line-height: 1.1 !important; 
                    font-weight: 900 !important; 
                    letter-spacing: -0.025em !important; 
                    margin-bottom: 1.8rem !important;
                    margin-top: 2.5rem !important;
                    color: #111 !important;
                    display: block !important;
                }
                .ProseMirror h3 { 
                    font-size: 2.25rem !important; 
                    line-height: 1.2 !important; 
                    font-weight: 800 !important; 
                    margin-bottom: 1.2rem !important;
                    margin-top: 2rem !important;
                    color: #222 !important;
                    display: block !important;
                }
                .dark .ProseMirror h1, .dark .ProseMirror h2, .dark .ProseMirror h3 {
                    color: #fff !important;
                }
                .ProseMirror p {
                    font-size: 1.25rem !important;
                    line-height: 1.8 !important;
                    margin-bottom: 1.5rem !important;
                    color: #374151 !important;
                }
                .dark .ProseMirror p {
                    color: #d1d5db !important;
                }
            `}} />
            
            {/* Professional Blogger Toolbar */}
            <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 h-12 flex items-center gap-1">
                
                {/* 1. Mode Switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-0.5 mr-2">
                    <button 
                        onClick={() => toggleEditMode('compose')}
                        className={`h-8 px-3 rounded flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${editMode === 'compose' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Compose View"
                    >
                        <span className="material-symbols-outlined text-sm">edit_note</span>
                        Compose
                    </button>
                    <button 
                        onClick={() => toggleEditMode('html')}
                        className={`h-8 px-3 rounded flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${editMode === 'html' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        title="HTML View"
                    >
                        <span className="material-symbols-outlined text-sm">code</span>
                        HTML
                    </button>
                </div>

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

                {/* 2. Undo/Redo */}
                <ToolbarButton icon="undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)" />
                <ToolbarButton icon="redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)" />

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

                {/* 3. Heading Selector */}
                <select 
                    key={`heading-sync-${forceUpdate}`}
                    className="h-8 px-2 bg-transparent text-[11px] font-black border-none focus:ring-0 cursor-pointer text-slate-700 dark:text-slate-300 min-w-[120px] uppercase tracking-wider"
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'p') editor.chain().focus().setParagraph().run();
                        else editor.chain().focus().toggleHeading({ level: parseInt(val) as any }).run();
                    }}
                    value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : 'p'}
                >
                    <option value="p">Normal Text</option>
                    <option value="1">Heading 1 (Main)</option>
                    <option value="2">Heading 2 (Sub)</option>
                    <option value="3">Heading 3 (Minor)</option>
                </select>

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

                {/* 4. Font Family */}
                <select 
                    className="h-8 px-2 bg-transparent text-[11px] font-bold border-none focus:ring-0 cursor-pointer text-slate-700 dark:text-slate-300 min-w-[100px]"
                    onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                    value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
                >
                    <option value="Inter">Default (Inter)</option>
                    <option value="Tajawal">Tajawal (Arabic)</option>
                    <option value="Georgia, serif">Serif (Classic)</option>
                    <option value="monospace">Monospaced</option>
                    <option value="Comic Sans MS, Comic Sans">Handwriting</option>
                </select>

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

                {/* 5. Text Formatting */}
                <ToolbarButton active={editor.isActive('bold')} icon="format_bold" onClick={() => editor.chain().focus().toggleBold().run()} title="Bold" />
                <ToolbarButton active={editor.isActive('italic')} icon="format_italic" onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" />
                <ToolbarButton active={editor.isActive('underline')} icon="format_underlined" onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline" />
                <ToolbarButton active={editor.isActive('strike')} icon="format_strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough" />

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

                {/* 6. Colors (Visual Palette) */}
                <div className="relative" ref={colorPickerRef}>
                    <button 
                        type="button"
                        onClick={() => setActivePicker(activePicker === 'color' ? null : 'color')}
                        className={`h-9 w-9 rounded-lg flex flex-col items-center justify-center p-0 transition-all ${activePicker === 'color' ? 'bg-orange-50 dark:bg-orange-600/10 shadow-inner' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} 
                        title="Text Color"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${activePicker === 'color' ? 'text-orange-600' : 'text-slate-600'}`}>format_color_text</span>
                        <div className="w-5 h-1 bg-black rounded-full -mt-0.5" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000' }} />
                    </button>
                    {activePicker === 'color' && (
                        <div className="absolute top-12 left-0 min-w-[280px] p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] z-[999] animate-in fade-in zoom-in-95 duration-150 border-t-4 border-t-orange-500">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Text Color</span>
                                <button onClick={() => setActivePicker(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-3 mb-5">
                                {['#000000', '#444444', '#666666', '#999999', '#cccccc', '#eeeeee', '#ffffff', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3'].map(c => (
                                    <button 
                                        key={c} 
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().setColor(c).run();
                                            setActivePicker(null);
                                        }} 
                                        className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all shadow-sm cursor-pointer hover:ring-2 hover:ring-orange-200 dark:hover:ring-orange-900 shrink-0" 
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => (document.getElementById('custom-color-input') as HTMLInputElement)?.click()}
                                    className="w-full flex items-center justify-between gap-3 px-3 h-10 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-orange-500 transition-colors text-lg">colorize</span>
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Custom Color</span>
                                    </div>
                                    <div className="relative w-7 h-7 rounded-lg overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200">
                                        <input 
                                            id="custom-color-input"
                                            type="color" 
                                            className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer" 
                                            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} 
                                        />
                                    </div>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().unsetColor().run();
                                        setActivePicker(null);
                                    }}
                                    className="w-full h-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-orange-600 bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700"
                                >
                                    Reset to Default
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative" ref={highlightPickerRef}>
                    <button 
                        type="button"
                        onClick={() => setActivePicker(activePicker === 'highlight' ? null : 'highlight')}
                        className={`h-9 w-9 rounded-lg flex flex-col items-center justify-center p-0 transition-all ${activePicker === 'highlight' ? 'bg-orange-50 dark:bg-orange-600/10 shadow-inner' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} 
                        title="Highlight Color"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${activePicker === 'highlight' ? 'text-orange-600' : 'text-slate-600'}`}>border_color</span>
                        <div className="w-5 h-1 bg-yellow-400 rounded-full -mt-0.5" />
                    </button>
                    {activePicker === 'highlight' && (
                        <div className="absolute top-12 left-0 min-w-[280px] p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] z-[999] animate-in fade-in zoom-in-95 duration-150 border-t-4 border-t-yellow-400">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Background</span>
                                <button onClick={() => setActivePicker(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-3 mb-5">
                                {['#ffffff', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8'].map(c => (
                                    <button 
                                        key={c} 
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().toggleHighlight({ color: c }).run();
                                            setActivePicker(null);
                                        }} 
                                        className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all shadow-sm cursor-pointer hover:ring-2 hover:ring-yellow-200 dark:hover:ring-yellow-900 shrink-0"
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
                            <button 
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().unsetHighlight().run();
                                    setActivePicker(null);
                                }} 
                                className="w-full h-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-yellow-700 bg-slate-50 dark:bg-slate-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700"
                            >
                                Clear Highlight
                            </button>
                        </div>
                    )}
                </div>

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

                {/* 6. Links & Media */}
                <ToolbarButton icon="link" onClick={() => {
                    const url = prompt('Insert Link URL:');
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                }} active={editor.isActive('link')} title="Insert Link" />
                <ToolbarButton icon="image" onClick={() => document.getElementById('editor-image-upload')?.click()} title="Insert Image" />
                <ToolbarButton icon="smart_display" onClick={() => {
                    const url = prompt('YouTube Video URL:');
                    if (url) {
                        const videoId = url.split('v=')[1]?.split('&')[0];
                        if (videoId) editor.chain().focus().insertContent(`<div data-type="youtube" data-video-id="${videoId}"></div>`).run();
                    }
                }} title="Embed Video" />

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

                {/* 7. Alignment */}
                <ToolbarButton active={editor.isActive({ textAlign: 'left' })} icon="format_align_left" onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left" />
                <ToolbarButton active={editor.isActive({ textAlign: 'center' })} icon="format_align_center" onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center" />
                <ToolbarButton active={editor.isActive({ textAlign: 'right' })} icon="format_align_right" onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right" />
                <ToolbarButton active={editor.isActive({ textAlign: 'justify' })} icon="format_align_justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify" />
                
                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

                {/* 8. Lists & Tables */}
                <ToolbarButton active={editor.isActive('bulletList')} icon="format_list_bulleted" onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List" />
                <ToolbarButton active={editor.isActive('orderedList')} icon="format_list_numbered" onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List" />
                <ToolbarButton icon="table_chart" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table" />
                <ToolbarButton icon="format_quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote" />

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

                {/* 9. Specialized */}
                <ToolbarButton icon="horizontal_rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Insert Divider" />
                <ToolbarButton icon="superscript" onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript" />
                <ToolbarButton icon="subscript" onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript" />

                <div className="flex-1" />

                {/* 10. Utility */}
                <ToolbarButton icon="format_color_reset" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear Formatting" />
            </div>

            {/* Editor Canvas Container */}
            <div className="flex-1 flex justify-center py-6 lg:py-10 px-4 transition-all duration-300">
                {/* The "Paper" Area */}
                <div className="w-full max-w-[900px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] min-h-[1100px] relative transition-all">
                    
                    <input type="file" id="editor-image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />

                    {editMode === 'compose' ? (
                        <div className="relative group">
                            {isUploading && (
                                <div className="absolute inset-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Uploading Media...</p>
                                    </div>
                                </div>
                            )}
                            <EditorContent editor={editor} />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full min-h-[1100px] bg-[#0A0A0A] text-[#D4D4D4] selection:bg-primary/30">
                            {/* Simple Code Editor Simulation */}
                            <div className="p-4 bg-[#1A1A1A] border-b border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">HTML Source Code</span>
                                <div className="flex gap-2 text-[10px] text-slate-500">
                                    <span>Line numbers enabled</span>
                                </div>
                            </div>
                            <textarea 
                                value={htmlValue}
                                onChange={(e) => setHtmlValue(e.target.value)}
                                className="flex-1 bg-transparent border-none focus:ring-0 resize-none w-full h-full min-h-[1000px] leading-[1.8] p-10 font-mono text-sm antialiased"
                                spellCheck={false}
                                placeholder="Write your raw HTML here..."
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ToolbarButton({ icon, onClick, active, disabled, title, className = '' }: any) {
    return (
        <button 
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                active 
                    ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            } ${disabled ? 'opacity-20 cursor-not-allowed grayscale' : ''} ${className}`}
        >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </button>
    );
}
