export function generateWebarenaScript(params: {
  proxyUser: string;
  proxyPassword: string;
  proxyPort: number;
}): string {
  const { proxyUser, proxyPassword, proxyPort } = params;

  return `#!/bin/bash
set -e

echo "===== Squid Proxy セットアップ開始 ====="

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
cat > /etc/squid/squid.conf << 'SQUIDCONF'
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
auth_param basic program /usr/lib64/squid/ncsa_auth /etc/squid/.htpasswd
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
SQUIDCONF

# 5. htpasswd ユーザー作成
echo "[5/7] プロキシ認証ユーザー作成..."
htpasswd -cb /etc/squid/.htpasswd ${proxyUser} ${proxyPassword}

# 6. squid 起動
echo "[6/7] Squid 起動..."
/usr/sbin/squid start
/etc/rc.d/init.d/squid start

# 7. 自動起動設定
echo "[7/7] 自動起動設定..."
chkconfig squid on

echo ""
echo "===== セットアップ完了 ====="
echo "プロキシ: \$(hostname -I | awk '{print \$1}'):${proxyPort}"
echo "ユーザー: ${proxyUser}"
echo "パスワード: ${proxyPassword}"
`;
}
