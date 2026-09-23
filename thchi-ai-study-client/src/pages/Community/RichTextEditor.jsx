import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Underline as UnderlineIcon,
} from "lucide-react";
const ToolbarBtn = ({ onClick, isActive, children, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`p-1.5 rounded-lg transition-colors cursor-pointer
      ${
        isActive
          ? "bg-blue-100 text-blue-600"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      }`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Chia sẻ bài viết của bạn tới cộng đồng Thchi ngay nào",
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-[140px] p-4 focus:outline-none text-gray-700 text-[15px] leading-7",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.({
        html: editor.getHTML(),
        text: editor.getText().trim(),
      });
    },
  });

  return (
    <div className="border border-gray-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <ToolbarBtn
          title="In đậm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor?.isActive("bold")}
        >
          <Bold size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="In nghiêng"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive("italic")}
        >
          <Italic size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Gạch chân"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor?.isActive("underline")}
        >
          <UnderlineIcon size={16} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-gray-300 mx-1.5" />
        <ToolbarBtn
          title="Danh sách có thứ tự"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive("orderedList")}
        >
          <ListOrdered size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Danh sách"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive("bulletList")}
        >
          <List size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Trích dẫn"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor?.isActive("blockquote")}
        >
          <Quote size={16} />
        </ToolbarBtn>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
