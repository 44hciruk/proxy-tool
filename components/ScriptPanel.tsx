"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface Props {
  ip: string;
  rootPassword: string;
  proxyUser: string;
  proxyPassword: string;
  proxyPort: number;
  sshPort: number;
  script: string;
}

interface LogEntry {
  step: string;
  status: "running" | "ok" | "error" | "done";
}

const STATUS_ICON: Record<string, string> = {
  running: "...",
  ok: "OK",
  error: "NG",
  done: "OK",
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded-md bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-gray-600 active:bg-gray-500"
    >
      {copied ? "コピー済み" : label || "コピー"}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
      {children}
    </div>
  );
}

function ProxyInfoBox({ compactInfo }: { compactInfo: string }) {
  return (
    <Section title="プロキシ接続情報">
      <div className="rounded-lg border border-green-800 bg-green-950/40 p-4">
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm font-mono text-gray-100 break-all">
            {compactInfo}
          </code>
          <CopyButton text={compactInfo} />
        </div>
      </div>
    </Section>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ScriptPanel({
  ip,
  rootPassword,
  proxyUser,
  proxyPassword,
  proxyPort,
  sshPort,
  script,
}: Props) {
  const sshCommand = `ssh root@${ip}`;
  const compactInfo = `${ip}:${proxyPort}:${proxyUser}:${proxyPassword}`;

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoDone, setAutoDone] = useState(false);
  const [autoError, setAutoError] = useState(false);
  const [manualOpen, setManualOpen] = useState(!API_URL);
  const logBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleAutoSetup = async () => {
    if (!API_URL) {
      alert("NEXT_PUBLIC_API_URL が設定されていません");
      return;
    }

    setLogs([]);
    setAutoRunning(true);
    setAutoDone(false);
    setAutoError(false);

    try {
      const res = await fetch(`${API_URL}/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip,
          root_password: rootPassword,
          proxy_user: proxyUser,
          proxy_password: proxyPassword,
          proxy_port: proxyPort,
          ssh_port: sshPort,
        }),
      });

      if (!res.ok || !res.body) {
        setLogs([{ step: `HTTP ${res.status}: ${res.statusText}`, status: "error" }]);
        setAutoError(true);
        setAutoRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            setLogs((prev) => [...prev, { step: payload.step, status: payload.status }]);
            if (payload.status === "done") setAutoDone(true);
            if (payload.status === "error") setAutoError(true);
          } catch {
            // ignore malformed JSON
          }
        }
      }
    } catch (e) {
      setLogs((prev) => [...prev, { step: `接続エラー: ${e}`, status: "error" }]);
      setAutoError(true);
    } finally {
      setAutoRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 自動セットアップ */}
      {API_URL && (
        <Section title="自動セットアップ">
          <p className="text-xs text-gray-500">
            バックエンドAPI経由でVPSに自動接続し、プロキシをセットアップします
          </p>
          <button
            onClick={handleAutoSetup}
            disabled={autoRunning}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {autoRunning ? "セットアップ中..." : "自動セットアップ"}
          </button>

          {/* ログ表示 */}
          {logs.length > 0 && (
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 max-h-64 overflow-y-auto">
              <div className="space-y-1.5">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 w-6 text-center text-xs text-gray-500">
                      [{STATUS_ICON[log.status] || "•"}]
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

          {/* 完了結果 */}
          {autoDone && <ProxyInfoBox compactInfo={compactInfo} />}

          {autoError && !autoDone && (
            <div className="rounded-lg border border-red-800 bg-red-950/40 p-4">
              <p className="text-sm text-red-400">
                セットアップに失敗しました。ログを確認してください。
              </p>
            </div>
          )}
        </Section>
      )}

      {/* 手動セットアップ（アコーディオン） */}
      {API_URL && !autoDone && (
        <div>
          <button
            onClick={() => setManualOpen((v) => !v)}
            className="flex items-center gap-3 w-full group"
          >
            <div className="flex-1 border-t border-gray-800" />
            <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
              または手動セットアップ {manualOpen ? "-" : "+"}
            </span>
            <div className="flex-1 border-t border-gray-800" />
          </button>
        </div>
      )}

      {manualOpen && !autoDone && (
        <>
          {/* SSH接続コマンド */}
          <Section title="SSH接続コマンド">
            <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 p-3">
              <code className="flex-1 text-sm text-green-400 overflow-x-auto">
                {sshCommand}
              </code>
              <CopyButton text={sshCommand} />
            </div>
            <p className="text-xs text-gray-500">
              ターミナルで実行し、rootパスワードを入力してVPSに接続してください
            </p>
          </Section>

          {/* セットアップスクリプト */}
          <Section title="セットアップスクリプト">
            <div className="rounded-lg border border-gray-700 bg-gray-900">
              <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
                <span className="text-xs text-gray-500">
                  VPSのターミナルに貼り付けて実行
                </span>
                <CopyButton text={script} />
              </div>
              <pre className="max-h-72 overflow-auto p-3 text-xs leading-relaxed text-gray-300">
                {script}
              </pre>
            </div>
          </Section>
        </>
      )}

      {/* プロキシ接続情報（常に表示、自動完了時以外） */}
      {!autoDone && <ProxyInfoBox compactInfo={compactInfo} />}
    </div>
  );
}
