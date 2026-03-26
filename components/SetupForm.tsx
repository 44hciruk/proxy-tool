"use client";

import { useState } from "react";
import type { OSType } from "@/lib/generateScript";
import Tooltip from "@/components/Tooltip";

export interface FormData {
  provider: string;
  os: OSType;
  ip: string;
  rootPassword: string;
  proxyUser: string;
  proxyPassword: string;
  proxyPort: number;
}

interface Props {
  onGenerate: (data: FormData) => void;
}

const OS_OPTIONS: { value: OSType; label: string; badge?: string }[] = [
  { value: "centos6", label: "CentOS 6（レガシー）" },
  { value: "almalinux", label: "AlmaLinux 8/9/10", badge: "推奨" },
  { value: "rockylinux", label: "Rocky Linux 8/9/10", badge: "推奨" },
  { value: "centos_stream", label: "CentOS Stream 9/10" },
  { value: "ubuntu", label: "Ubuntu 20.04/22.04/24.04" },
];

export default function SetupForm({ onGenerate }: Props) {
  const [form, setForm] = useState<FormData>({
    provider: "webarena",
    os: "almalinux",
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
  const labelClass = "flex items-center text-sm font-medium text-gray-300 mb-1";

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
          <option value="webarena">WebArena</option>
        </select>
      </div>

      {/* OS選択 */}
      <div>
        <label className={labelClass}>OS</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {OS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition ${
                form.os === opt.value
                  ? "border-blue-500 bg-blue-950/40 text-blue-300"
                  : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name="os"
                value={opt.value}
                checked={form.os === opt.value}
                onChange={(e) => set("os", e.target.value)}
                className="sr-only"
              />
              <span
                className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                  form.os === opt.value
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-500"
                }`}
              />
              <span>{opt.label}</span>
              {opt.badge && (
                <span className="ml-auto rounded-full bg-green-900/60 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                  {opt.badge}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* IP アドレス */}
      <div>
        <label className={labelClass}>
          IP アドレス
          <Tooltip text="VPSのコントロールパネルに表示されているサーバーのIPアドレスを入力してください" />
        </label>
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
        <label className={labelClass}>
          root パスワード
          <Tooltip text="VPS契約時・インスタンス作成時に設定したサーバー管理者パスワードです。SSHログインに使用します" />
        </label>
        <input
          type="password"
          required
          placeholder="VPS作成時に設定したパスワード"
          value={form.rootPassword}
          onChange={(e) => set("rootPassword", e.target.value)}
          className={inputClass}
        />
      </div>

      {/* プロキシ認証 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            プロキシ ユーザー名
            <Tooltip text="プロキシ接続時のBasic認証IDです。自由に決めてください" />
          </label>
          <input
            type="text"
            required
            placeholder="squid_test"
            value={form.proxyUser}
            onChange={(e) => set("proxyUser", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            プロキシ パスワード
            <Tooltip text="プロキシ接続時のBasic認証パスワードです。自由に決めてください" />
          </label>
          <input
            type="password"
            required
            placeholder="プロキシ認証用パスワード"
            value={form.proxyPassword}
            onChange={(e) => set("proxyPassword", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* プロキシポート */}
      <div className="w-full sm:w-1/3">
        <label className={labelClass}>
          プロキシ ポート
          <Tooltip text="プロキシの接続ポート番号です。50000のままで問題ありません（1025〜65535の範囲で変更可）" />
        </label>
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
        スクリプト生成
      </button>
    </form>
  );
}
