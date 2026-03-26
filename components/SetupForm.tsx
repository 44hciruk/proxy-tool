"use client";

import { useState } from "react";

export interface FormData {
  provider: string;
  ip: string;
  rootPassword: string;
  proxyUser: string;
  proxyPassword: string;
  proxyPort: number;
}

interface Props {
  onGenerate: (data: FormData) => void;
}

export default function SetupForm({ onGenerate }: Props) {
  const [form, setForm] = useState<FormData>({
    provider: "webarena",
    ip: "",
    rootPassword: "",
    proxyUser: "squid_test",
    proxyPassword: "",
    proxyPort: 50000,
  });

  const set = (key: keyof FormData, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(form);
  };

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-800 bg-gray-900 p-5 sm:p-6 space-y-5"
    >
      {/* プロバイダー */}
      <div>
        <label className={labelClass}>VPS プロバイダー</label>
        <select
          value={form.provider}
          onChange={(e) => set("provider", e.target.value)}
          className={inputClass}
        >
          <option value="webarena">WebArena (CentOS 6)</option>
        </select>
      </div>

      {/* IP アドレス */}
      <div>
        <label className={labelClass}>IP アドレス</label>
        <input
          type="text"
          required
          placeholder="xxx.xxx.xxx.xxx"
          value={form.ip}
          onChange={(e) => set("ip", e.target.value)}
          className={inputClass}
        />
      </div>

      {/* rootパスワード */}
      <div>
        <label className={labelClass}>root パスワード</label>
        <input
          type="password"
          required
          placeholder="SSH接続用"
          value={form.rootPassword}
          onChange={(e) => set("rootPassword", e.target.value)}
          className={inputClass}
        />
      </div>

      {/* プロキシ認証 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>プロキシ ユーザー名</label>
          <input
            type="text"
            required
            value={form.proxyUser}
            onChange={(e) => set("proxyUser", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>プロキシ パスワード</label>
          <input
            type="password"
            required
            placeholder="プロキシ認証用"
            value={form.proxyPassword}
            onChange={(e) => set("proxyPassword", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* プロキシポート */}
      <div className="w-full sm:w-1/3">
        <label className={labelClass}>プロキシ ポート</label>
        <input
          type="number"
          value={form.proxyPort}
          onChange={(e) => set("proxyPort", Number(e.target.value))}
          className={inputClass}
        />
      </div>

      {/* 送信 */}
      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
      >
        🚀 スクリプト生成
      </button>
    </form>
  );
}
