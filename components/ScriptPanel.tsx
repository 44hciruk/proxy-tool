"use client";

import { useState, useCallback } from "react";

interface Props {
  ip: string;
  proxyUser: string;
  proxyPassword: string;
  proxyPort: number;
  script: string;
}

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
      {copied ? "コピー済み ✓" : label || "📋 コピー"}
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

export default function ScriptPanel({
  ip,
  proxyUser,
  proxyPassword,
  proxyPort,
  script,
}: Props) {
  const sshCommand = `ssh root@${ip}`;
  const proxyInfo = `${ip}:${proxyPort}`;
  const curlCommand = `curl -x http://${proxyUser}:${proxyPassword}@${ip}:${proxyPort} http://httpbin.org/ip`;
  const proxyInfoFull = `${proxyInfo}\n${proxyUser}\n${proxyPassword}`;

  return (
    <div className="space-y-6">
      {/* ① SSH接続コマンド */}
      <Section title="① SSH接続コマンド">
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

      {/* ② セットアップスクリプト */}
      <Section title="② セットアップスクリプト">
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

      {/* ③ プロキシ接続情報 */}
      <Section title="③ プロキシ接続情報">
        <div className="rounded-lg border border-green-800 bg-green-950/40 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">プロキシ</span>
              <span className="font-mono text-gray-100">{proxyInfo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ユーザー</span>
              <span className="font-mono text-gray-100">{proxyUser}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">パスワード</span>
              <span className="font-mono text-gray-100">{proxyPassword}</span>
            </div>
          </div>
          <div className="mt-3">
            <CopyButton text={proxyInfoFull} label="📋 接続情報をコピー" />
          </div>
        </div>
      </Section>

      {/* ④ 動作確認用curlコマンド */}
      <Section title="④ 動作確認用 curl コマンド">
        <div className="flex items-start gap-2 rounded-lg border border-gray-700 bg-gray-900 p-3">
          <pre className="flex-1 text-xs text-yellow-300 overflow-x-auto whitespace-pre-wrap break-all">
            {curlCommand}
          </pre>
          <CopyButton text={curlCommand} />
        </div>
        <p className="text-xs text-gray-500">
          ローカルPCのターミナルで実行してプロキシの動作を確認
        </p>
      </Section>
    </div>
  );
}
