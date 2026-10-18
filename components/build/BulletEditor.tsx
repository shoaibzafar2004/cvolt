"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import DOMPurify from "dompurify";
import { List } from "lucide-react";
import { useEffect } from "react";

const ALLOWED_TAGS = ["strong", "em", "u", "b", "i", "br"];

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: [] });
}

interface BulletEditorProps {
  value: string[];
  onChange: (bullets: string[]) => void;
}

/** Convert string[] → TipTap HTML (bullet list).
 *  Handles legacy data where all bullets were stored as one newline-separated string. */
function bulletsToHtml(bullets: string[]): string {
  const items = bullets
    .flatMap((b) => b.split("\n"))
    .map((b) => b.trim())
    .filter(Boolean);
  if (items.length === 0) return "<ul><li><p></p></li></ul>";
  return `<ul>${items.map((b) => `<li><p>${b}</p></li>`).join("")}</ul>`;
}

/** Parse TipTap HTML → string[] (one HTML string per bullet) */
function htmlToBullets(html: string): string[] {
  if (typeof document === "undefined") return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  const items = div.querySelectorAll("li");
  return Array.from(items)
    .map((li) => {
      const p = li.querySelector("p");
      return sanitize((p ? p.innerHTML : li.innerHTML).trim());
    })
    .filter((s) => s && s !== "<br>" && s !== "<br/>");
}

export default function BulletEditor({ value, onChange }: BulletEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
    content: bulletsToHtml(value),
    onUpdate: ({ editor }) => {
      onChange(htmlToBullets(editor.getHTML()));
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[120px] px-3 py-2.5 text-sm leading-relaxed",
      },
    },
  });

  // Sync value when form resets or hydrates from store
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = htmlToBullets(editor.getHTML());
    const same =
      current.length === value.length &&
      current.every((b, i) => b === value[i]);
    if (!same)
      editor.commands.setContent(bulletsToHtml(value), { emitUpdate: false });
  }, [value, editor]);

  return (
    <div className="overflow-hidden rounded-xl border focus-within:ring-1 focus-within:ring-ring">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b bg-muted/40 px-2.5 py-1.5">
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold") ?? false}
          title="Bold"
        >
          <span className="text-xs leading-none font-bold">B</span>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic") ?? false}
          title="Italic"
        >
          <span className="text-xs leading-none italic">I</span>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive("underline") ?? false}
          title="Underline"
        >
          <span className="text-xs leading-none underline">U</span>
        </ToolBtn>
        <div className="mx-1 h-3.5 w-px bg-border" />
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList") ?? false}
          title="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </ToolBtn>
      </div>

      {/* Editor */}
      <div className="[&_li]:my-0.5 [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor blur on toolbar click
        onClick();
      }}
      className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
