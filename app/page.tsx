"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import SetupForm, { type FormData } from "@/components/SetupForm";
import ScriptPanel from "@/components/ScriptPanel";
import { generateWebarenaScript } from "@/lib/generateScript";

interface LogEntry {
  step: string;
  status: "running" | "ok" | "error" | "done";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function Home() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [script, setScript] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const logBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSubmit = useCallback(async (data: FormData) => {
    // スクリプト生成（手動用に常に保持）
    const s = generateWebarenaScript({
      proxyUser: data.proxyUser,
      proxyPassword: data.proxyPassword,
      proxyPort: data.proxyPort,
      os: data.os,
    });
    setFormData(data);
    setScript(s);
    setLogs([]);
    setDone(false);
    setError(false);

    if (!API_URL) {
      // APIなし → スクリプト表示のみ
      setDone(false);
      return;
    }

    // 自動セットアップ実行
    setRunning(true);
    try {
      const res = await fetch(`${API_URL}/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: data.ip,
          root_password: data.rootPassword,
          proxy_user: data.proxyUser,
          proxy_password: data.proxyPassword,
          proxy_port: data.proxyPort,
          ssh_port: 22,
        }),
      });

      if (!res.ok || !res.body) {
        setLogs([{ step: `HTTP ${res.status}: ${res.statusText}`, status: "error" }]);
        setError(true);
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            setLogs((prev) => [...prev, { step: payload.step, status: payload.status }]);
            if (payload.status === "done") setDone(true);
            if (payload.status === "error") setError(true);
          } catch {
            // ignore
          }
        }
      }
    } catch (e) {
      setLogs((prev) => [...prev, { step: `接続エラー: ${e}`, status: "error" }]);
      setError(true);
    } finally {
      setRunning(false);
    }
  }, []);

  const compactInfo = formData
    ? `${formData.ip}:${formData.proxyPort}:${formData.proxyUser}:${formData.proxyPassword}`
    : "";

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8 flex flex-col items-center">
        <Image src="/logo.svg" alt="Proxy Generator by Dr.SK" width={40} height={40} className="mb-3" />
        <h1 className="text-2xl sm:text-3xl font-bold">Proxy Generator by Dr.SK</h1>
        <p className="text-gray-400 text-sm mt-2">
          VPS情報を入力してプロキシを自動構築します
        </p>
      </div>

      <SetupForm onSubmit={handleSubmit} disabled={running} />

      {/* ログ表示 */}
      {logs.length > 0 && (
        <div className="mt-6 rounded-lg border border-gray-700 bg-gray-900 p-4 max-h-64 overflow-y-auto">
          <div className="space-y-1.5">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 w-6 text-center text-xs text-gray-500">
                  [{log.status === "running" ? "..." : log.status === "error" ? "NG" : "OK"}]
                </span>
                <span
                  className={
                    log.status === "error"
                      ? "text-red-400"
                      : log.status === "done"
                        ? "text-green-400 font-semibold"
                        : "text-gray-300"
                  }
                >
                  {log.step}
                </span>
              </div>
            ))}
            <div ref={logBottomRef} />
          </div>
        </div>
      )}

      {/* 完了表示 */}
      {done && (
        <div className="mt-6">
          <ScriptPanel mode="done" compactInfo={compactInfo} />
        </div>
      )}

      {/* エラー表示 */}
      {error && !done && logs.length > 0 && (
        <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 p-4">
          <p className="text-sm text-red-400">
            セットアップに失敗しました。ログを確認してください。
          </p>
        </div>
      )}

      {/* 手動セットアップ（API設定時: 折りたたみ / API未設定時: スクリプト表示） */}
      {formData && !done && (
        <div className="mt-6">
          <ScriptPanel
            mode="manual"
            compactInfo={compactInfo}
            ip={formData.ip}
            script={script}
            defaultOpen={!API_URL}
          />
        </div>
      )}
    </main>
  );
}
