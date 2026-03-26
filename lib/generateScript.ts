export type OSType =
  | "centos6"
  | "almalinux"
  | "rockylinux"
  | "centos_stream"
  | "ubuntu";

interface ScriptParams {
  proxyUser: string;
  proxyPassword: string;
  proxyPort: number;
  os: OSType;
}

function squidConfBlock(proxyPort: number, authProgram: string): string {
  return `cat > /etc/squid/squid.conf << 'SQUIDCONF'
#
# Recommended minimum configuration:
#
acl manager proto cache_object
acl localhost src 127.0.0.1/32 ::1
acl to_localhost dst 127.0.0.0/8 0.0.0.0/32 ::1

acl localnet src 10.0.0.0/8
acl localnet src 172.16.0.0/12
acl localnet src 192.168.0.0/16
acl localnet src fc00::/7
acl localnet src fe80::/10

acl SSL_ports port 443
acl SSL_ports port 80
acl Safe_ports port 80
acl Safe_ports port 21
acl Safe_ports port 443
acl Safe_ports port 70
acl Safe_ports port 210
acl Safe_ports port 1025-65535
acl Safe_ports port 280
acl Safe_ports port 488
acl Safe_ports port 591
acl Safe_ports port 777
acl CONNECT method CONNECT

# Basic Auth
auth_param basic program ${authProgram} /etc/squid/.htpasswd
auth_param basic children 5
auth_param basic realm Squid Basic Authentication
auth_param basic credentialsttl 5 hours
acl password proxy_auth REQUIRED
http_access allow password

http_access allow manager localhost
http_access deny manager
http_access deny !Safe_ports
http_access deny CONNECT !SSL_ports
http_access allow localnet
http_access allow localhost
http_access deny all

http_port ${proxyPort}

coredump_dir /var/spool/squid

refresh_pattern ^ftp:           1440    20%     10080
refresh_pattern ^gopher:        1440    0%      1440
refresh_pattern -i (/cgi-bin/|\\?) 0     0%      0
refresh_pattern .               0       20%     4320

# for anonymous proxy server
visible_hostname unknown
forwarded_for off
request_header_access X-FORWARDED-FOR deny all
request_header_access Via deny all
request_header_access Cache-Control deny all
SQUIDCONF`;
}

function completionBlock(
  proxyUser: string,
  proxyPassword: string,
  proxyPort: number
): string {
  return `echo ""
echo "===== セットアップ完了 ====="
echo "プロキシ: \\$(hostname -I | awk '{print \\$1}'):${proxyPort}"
echo "ユーザー: ${proxyUser}"
echo "パスワード: ${proxyPassword}"`;
}

function generateCentos6(p: ScriptParams): string {
  return `#!/bin/bash
set -e

echo "===== Squid Proxy セットアップ開始 (CentOS 6) ====="

# 1. パッケージインストール
echo "[1/7] squid インストール中..."
yum install -y nano squid

# 2. yum キャッシュクリア
echo "[2/7] yum clean all..."
yum clean all

# 3. squid.conf バックアップ
echo "[3/7] squid.conf バックアップ..."
cp /etc/squid/squid.conf /etc/squid/squid.conf.orig

# 4. squid.conf 書き込み
echo "[4/7] squid.conf 生成..."
${squidConfBlock(p.proxyPort, "/usr/lib64/squid/ncsa_auth")}

# 5. htpasswd ユーザー作成
echo "[5/7] プロキシ認証ユーザー作成..."
htpasswd -cb /etc/squid/.htpasswd ${p.proxyUser} ${p.proxyPassword}

# 6. squid 起動
echo "[6/7] Squid 起動..."
/usr/sbin/squid start
/etc/rc.d/init.d/squid start

# 7. 自動起動設定
echo "[7/7] 自動起動設定..."
chkconfig squid on

${completionBlock(p.proxyUser, p.proxyPassword, p.proxyPort)}
`;
}

function generateRHEL(p: ScriptParams, osLabel: string): string {
  return `#!/bin/bash
set -e

echo "===== Squid Proxy セットアップ開始 (${osLabel}) ====="

# 1. パッケージインストール
echo "[1/8] squid インストール中..."
dnf install -y squid httpd-tools

# 2. dnf キャッシュクリア
echo "[2/8] dnf clean all..."
dnf clean all

# 3. squid.conf バックアップ
echo "[3/8] squid.conf バックアップ..."
cp /etc/squid/squid.conf /etc/squid/squid.conf.orig

# 4. squid.conf 書き込み
echo "[4/8] squid.conf 生成..."
${squidConfBlock(p.proxyPort, "/usr/lib64/squid/basic_ncsa_auth")}

# 5. htpasswd ユーザー作成
echo "[5/8] プロキシ認証ユーザー作成..."
htpasswd -cb /etc/squid/.htpasswd ${p.proxyUser} ${p.proxyPassword}

# 6. ファイアウォール設定
echo "[6/8] ファイアウォール設定..."
systemctl enable firewalld
systemctl start firewalld
firewall-cmd --permanent --add-port=${p.proxyPort}/tcp
firewall-cmd --reload

# 7. squid 起動
echo "[7/8] Squid 起動..."
systemctl start squid

# 8. 自動起動設定
echo "[8/8] 自動起動設定..."
systemctl enable squid

${completionBlock(p.proxyUser, p.proxyPassword, p.proxyPort)}
`;
}

function generateUbuntu(p: ScriptParams): string {
  return `#!/bin/bash
set -e

echo "===== Squid Proxy セットアップ開始 (Ubuntu) ====="

# 1. パッケージインストール
echo "[1/8] squid インストール中..."
apt-get update
apt-get install -y squid apache2-utils

# 2. squid.conf バックアップ
echo "[2/8] squid.conf バックアップ..."
cp /etc/squid/squid.conf /etc/squid/squid.conf.orig

# 3. squid.conf 書き込み
echo "[3/8] squid.conf 生成..."
${squidConfBlock(p.proxyPort, "/usr/lib/squid/basic_ncsa_auth")}

# 4. htpasswd ユーザー作成
echo "[4/8] プロキシ認証ユーザー作成..."
htpasswd -cb /etc/squid/.htpasswd ${p.proxyUser} ${p.proxyPassword}

# 5. ファイアウォール設定
echo "[5/8] ファイアウォール設定..."
ufw allow ${p.proxyPort}/tcp
ufw reload

# 6. squid 起動
echo "[6/8] Squid 起動..."
systemctl start squid

# 7. 自動起動設定
echo "[7/8] 自動起動設定..."
systemctl enable squid

# 8. 動作確認
echo "[8/8] Squid ステータス確認..."
systemctl status squid --no-pager

${completionBlock(p.proxyUser, p.proxyPassword, p.proxyPort)}
`;
}

const OS_LABELS: Record<OSType, string> = {
  centos6: "CentOS 6",
  almalinux: "AlmaLinux",
  rockylinux: "Rocky Linux",
  centos_stream: "CentOS Stream",
  ubuntu: "Ubuntu",
};

export function generateWebarenaScript(params: {
  proxyUser: string;
  proxyPassword: string;
  proxyPort: number;
  os?: OSType;
}): string {
  const os = params.os || "centos6";
  const p: ScriptParams = { ...params, os };

  switch (os) {
    case "centos6":
      return generateCentos6(p);
    case "almalinux":
      return generateRHEL(p, OS_LABELS.almalinux);
    case "rockylinux":
      return generateRHEL(p, OS_LABELS.rockylinux);
    case "centos_stream":
      return generateRHEL(p, OS_LABELS.centos_stream);
    case "ubuntu":
      return generateUbuntu(p);
  }
}
