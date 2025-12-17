import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Bold, Italic, List, ListOrdered, Undo, Redo, Code, Link2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReportItemAttribute } from '@/store/reporting.store';
import React, { useEffect } from 'react';

interface DynamicAttributeEditorProps {
    attribute: ReportItemAttribute;
    onSave: (value: string) => void;
    isLocked?: boolean;
    mode?: 'edit' | 'read';
}

export const DynamicAttributeEditor: React.FC<DynamicAttributeEditorProps> = ({ attribute, onSave, isLocked, mode = 'edit' }) => {

    // Force read mode if locked, or if explicitly in read mode
    const effectiveMode = isLocked ? 'read' : mode;

    // --- 1. Rich Text ---
    if (attribute.type === 'RICH_TEXT') {
        if (effectiveMode === 'read') {
            return (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">{attribute.name}</label>
                    <div
                        className="prose prose-invert max-w-none bg-slate-900/30 p-6 rounded-xl border border-white/5"
                        dangerouslySetInnerHTML={{ __html: attribute.value }}
                    />
                </div>
            );
        }
        return <RichTextEditor initialValue={attribute.value} onSave={onSave} isLocked={isLocked} />;
    }

    // --- 2. String ---
    if (attribute.type === 'STRING') {
        if (effectiveMode === 'read') {
            return (
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">{attribute.name}</label>
                    <div className="p-3 bg-slate-900/30 rounded-lg border border-white/5 text-slate-200">
                        {attribute.value || <span className="text-slate-600 italic">Vide</span>}
                    </div>
                </div>
            );
        }
        return (
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">{attribute.name}</label>
                <input
                    type="text"
                    defaultValue={attribute.value}
                    disabled={isLocked}
                    onBlur={(e) => onSave(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                />
            </div>
        );
    }

    // --- 3. Enum ---
    if (attribute.type === 'ENUM') {
        const options = (attribute as any).attribute_enums || [];
        const label = options.find((o: any) => o.value === attribute.value)?.description || attribute.value;

        if (effectiveMode === 'read') {
            return (
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">{attribute.name}</label>
                    <div className="p-3 bg-slate-900/30 rounded-lg border border-white/5 text-slate-200">
                        {label || <span className="text-slate-600 italic">Non défini</span>}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">{attribute.name}</label>
                <select
                    defaultValue={attribute.value}
                    disabled={isLocked}
                    onChange={(e) => onSave(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                >
                    <option value="">Sélectionner...</option>
                    {options.length > 0 ? (
                        options.map((opt: any) => (
                            <option key={opt.id || opt.value} value={opt.value}>
                                {opt.description || opt.value}
                            </option>
                        ))
                    ) : (
                        /* Fallback Demo Options if no config found */
                        <>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </>
                    )}
                </select>
            </div>
        );
    }

    // Fallback info
    return <div className="text-red-500">Type non supporté: {attribute.type}</div>;
};

// --- Sous-composant Tiptap ---
const RichTextEditor = ({ initialValue, onSave, isLocked }: { initialValue: string, onSave: (v: string) => void, isLocked?: boolean }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Image
        ],
        content: initialValue,
        editable: !isLocked,
        onBlur: ({ editor }) => {
            onSave(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4'
            }
        }
    });

    useEffect(() => {
        if (editor && initialValue !== editor.getHTML()) {
            // Avoid loop if content matches
            // editor.commands.setContent(initialValue); 
        }
        editor?.setEditable(!isLocked);
    }, [isLocked, editor]);

    if (!editor) return null;

    return (
        <div className={cn("border border-slate-700 rounded-lg overflow-hidden bg-slate-900/50", isLocked && "opacity-75 pointer-events-none")}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-slate-800 border-b border-slate-700 overflow-x-auto">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
                <div className="w-px h-4 bg-slate-600 mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
                <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} icon={Code} />
                <div className="w-px h-4 bg-slate-600 mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={Undo} />
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={Redo} />
            </div>

            {/* Content */}
            <EditorContent editor={editor} />
        </div>
    );
};

const ToolbarButton = ({ onClick, isActive, disabled, icon: Icon }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "p-1.5 rounded hover:bg-slate-700 hover:text-white text-slate-400 transition-colors",
            isActive && "bg-blue-600 text-white hover:bg-blue-700",
            disabled && "opacity-50 cursor-not-allowed"
        )}
    >
        <Icon className="w-4 h-4" />
    </button>
);
