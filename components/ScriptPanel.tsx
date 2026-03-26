"use client";

import { useState, useCallback } from "react";

type Props =
  | { mode: "done"; compactInfo: string; ip?: never; script?: never; defaultOpen?: never }
  | { mode: "manual"; compactInfo: string; ip: string; script: string; defaultOpen?: boolean };

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

export default function ScriptPanel(props: Props) {
  const [manualOpen, setManualOpen] = useState(props.defaultOpen ?? false);

  if (props.mode === "done") {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">プロキシが作成されました</h3>
        <div className="rounded-lg border border-green-800 bg-green-950/40 p-4">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-gray-100 break-all">
              {props.compactInfo}
            </code>
            <CopyButton text={props.compactInfo} />
          </div>
        </div>
      </div>
    );
  }

  // mode === "manual"
  const sshCommand = `ssh root@${props.ip}`;

  return (
    <div className="space-y-4">
      {/* 折りたたみトグル */}
      <button
        onClick={() => setManualOpen((v) => !v)}
        className="flex items-center gap-3 w-full group"
      >
        <div className="flex-1 border-t border-gray-800" />
        <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
          または手動で作成する {manualOpen ? "-" : "+"}
        </span>
        <div className="flex-1 border-t border-gray-800" />
      </button>

      {manualOpen && (
        <div className="space-y-5">
          {/* SSH接続コマンド */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">SSH接続コマンド</h3>
            <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 p-3">
              <code className="flex-1 text-sm text-green-400 overflow-x-auto">
                {sshCommand}
              </code>
              <CopyButton text={sshCommand} />
            </div>
            <p className="text-xs text-gray-500">
              ターミナルで実行し、rootパスワードを入力してVPSに接続してください
            </p>
          </div>

          {/* セットアップスクリプト */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">セットアップスクリプト</h3>
            <div className="rounded-lg border border-gray-700 bg-gray-900">
              <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
                <span className="text-xs text-gray-500">
                  VPSのターミナルに貼り付けて実行
                </span>
                <CopyButton text={props.script} />
              </div>
              <pre className="max-h-72 overflow-auto p-3 text-xs leading-relaxed text-gray-300">
                {props.script}
              </pre>
            </div>
          </div>

          {/* プロキシ接続情報 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">プロキシ接続情報</h3>
            <div className="rounded-lg border border-green-800 bg-green-950/40 p-4">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-gray-100 break-all">
                  {props.compactInfo}
                </code>
                <CopyButton text={props.compactInfo} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
