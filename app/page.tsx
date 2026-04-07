"use client";

import { useState, useEffect, useRef } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // LocalStorageから読み込み
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // LocalStorageへ保存
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addTodo();
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const doneCount = todos.filter((t) => t.completed).length;

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-16 px-4">
      {/* ヘッダー */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-800">
          やること
        </h1>
        <p className="mt-2 text-sm text-stone-400">
          {activeCount > 0
            ? `残り ${activeCount} 件`
            : todos.length > 0
            ? "すべて完了！"
            : "タスクを追加しましょう"}
        </p>
      </div>

      {/* 入力エリア */}
      <div className="w-full max-w-md mb-6">
        <div className="flex gap-2 items-center bg-white rounded-2xl shadow-sm border border-stone-200 px-4 py-3 focus-within:border-stone-400 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="新しいタスクを入力..."
            className="flex-1 bg-transparent text-stone-800 placeholder-stone-300 outline-none text-base"
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-stone-800 text-white disabled:opacity-30 hover:bg-stone-700 active:scale-95 transition-all"
            aria-label="追加"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* フィルタータブ */}
      {todos.length > 0 && (
        <div className="flex gap-1 mb-6 bg-stone-100 rounded-xl p-1 w-full max-w-md">
          {(
            [
              { key: "all", label: `すべて (${todos.length})` },
              { key: "active", label: `未完了 (${activeCount})` },
              { key: "done", label: `完了 (${doneCount})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-all ${
                filter === key
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* タスクリスト */}
      <div className="w-full max-w-md flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-stone-300 text-sm">
            {filter === "done"
              ? "完了したタスクはありません"
              : filter === "active"
              ? "未完了のタスクはありません"
              : "タスクがありません"}
          </div>
        )}

        {filtered.map((todo) => (
          <div
            key={todo.id}
            className={`group flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border shadow-sm transition-all ${
              todo.completed
                ? "border-stone-100 opacity-60"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            {/* チェックボックス */}
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                todo.completed
                  ? "border-emerald-400 bg-emerald-400"
                  : "border-stone-300 hover:border-stone-500"
              }`}
              aria-label={todo.completed ? "未完了に戻す" : "完了にする"}
            >
              {todo.completed && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>

            {/* テキスト */}
            <span
              className={`flex-1 text-base leading-snug ${
                todo.completed
                  ? "line-through text-stone-400"
                  : "text-stone-800"
              }`}
            >
              {todo.text}
            </span>

            {/* 削除ボタン */}
            <button
              onClick={() => deleteTodo(todo.id)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-stone-300 hover:text-rose-400 hover:bg-rose-50 transition-all"
              aria-label="削除"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* フッター */}
      <p className="mt-16 text-xs text-stone-300">
        Enterキーまたは＋ボタンでタスクを追加
      </p>
    </main>
  );
}
