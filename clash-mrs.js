/**
 * 个人备份使用，该脚本适用于 Mihomo Party 和 Clash Verge Rev
 * Clash Verge Rev 全局扩展脚本 / Mihomo Party 覆写脚本
 * URL: https://github.com/wanswu/my-backup
 */

function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const originalProviders = config?.["proxy-providers"] || {};
  const proxyProviderCount = typeof originalProviders === "object" ? Object.keys(originalProviders).length : 0;

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  config["proxy-providers"] = {
    ...originalProviders,
  };

  config["dns"] = dnsConfig;
  config["proxy-groups"] = proxyGroupConfig;
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;

  config["mixed-port"] = 7890;
  config["allow-lan"] = true;
  config["bind-address"] = "*";
  config["mode"] = "rule";
  config["ipv6"] = false;
  config["unified-delay"] = true;
  config["tcp-concurrent"] = true;
  config["external-controller"] = "9090";

  config["profile"] = {
    ...(config["profile"] || {}),
    "store-selected": true,
    "store-fake-ip": true,
  };

  config["tun"] = {
    ...(config["tun"] || {}),
    "dns-hijack": config?.tun?.["dns-hijack"] || ["any:53"],
  };

  return config;
}

const dnsConfig = {
  "enable": true,
  "listen": "0.0.0.0:1053",
  "ipv6": false,
  "prefer-h3": false,
  "respect-rules": true,
  "use-hosts": true,
  "use-system-hosts": true,
  "cache-algorithm": "arc",
  "cache-size": 2048,
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    "*.lan",
    "*.local",
    "localhost.ptlogin2.qq.com",
    "*.msftconnecttest.com",
    "*.msftncsi.com",
    "*.senhao.xyz",
    "*.112320.xyz",
    "geosite:private",
    "geosite:cn"
  ],
  "default-nameserver": [
    "223.5.5.5",
    "119.29.29.29"
  ],
  "nameserver": [
    "https://cloudflare-dns.com/dns-query#Proxy",
    "https://8.8.8.8/dns-query#Proxy"
  ],
  "proxy-server-nameserver": [
    "https://223.5.5.5/dns-query",
    "https://doh.pub/dns-query"
  ],
  "direct-nameserver": [
    "https://223.5.5.5/dns-query",
    "https://doh.pub/dns-query"
  ],
  "direct-nameserver-follow-policy": false,
  "nameserver-policy": {
    "geosite:cn": [
      "https://223.5.5.5/dns-query",
      "https://doh.pub/dns-query"
    ],
    "geosite:private": [
      "system"
    ]
  }
};

const proxyGroupConfig = [
  {
    "name": "AutoSelect",
    "type": "url-test",
    "url": "http://www.gstatic.com/generate_204",
    "interval": 300,
    "tolerance": 50,
    "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png",
    "include-all": true,
    "filter": "(香港|日本|东京)"
  },
  {
    "name": "Proxy",
    "type": "select",
    "include-all": true,
    "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png",
    "proxies": ["AutoSelect", "DIRECT"]
  },
  {
    "name": "OpenAi",
    "type": "select",
    "include-all": true,
    "filter": "(GPT|OpenAI|美国|LA|洛杉矶|德国|家宽|US|USA)",
    "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png",
    "proxies": ["Proxy"]
  },
  {
    "name": "Others",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png",
    "proxies": ["Proxy", "DIRECT"]
  }
];

const ruleProviders = {
  "ads": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-ads-all.mrs",
    "path": "./ruleset/ads.mrs"
  },
  "private": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/private.mrs",
    "path": "./ruleset/private.mrs"
  },
  "ai": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-ai-!cn.mrs",
    "path": "./ruleset/ai.mrs"
  },
  "microsoft-cn": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft@cn.mrs",
    "path": "./ruleset/microsoft-cn.mrs"
  },
  "microsoft": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft.mrs",
    "path": "./ruleset/microsoft.mrs"
  },
  "youtube": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/youtube.mrs",
    "path": "./ruleset/youtube.mrs"
  },
  "github": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/github.mrs",
    "path": "./ruleset/github.mrs"
  },
  "google": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/google.mrs",
    "path": "./ruleset/google.mrs"
  },
  "telegram": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/telegram.mrs",
    "path": "./ruleset/telegram.mrs"
  },
  "twitter": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/twitter.mrs",
    "path": "./ruleset/twitter.mrs"
  },
  "discord": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/discord.mrs",
    "path": "./ruleset/discord.mrs"
  },
  "pixiv": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/pixiv.mrs",
    "path": "./ruleset/pixiv.mrs"
  },
  "apple-cn": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/apple-cn.mrs",
    "path": "./ruleset/apple-cn.mrs"
  },
  "steam-cn": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/steam@cn.mrs",
    "path": "./ruleset/steam-cn.mrs"
  },
  "games-cn": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-games@cn.mrs",
    "path": "./ruleset/games-cn.mrs"
  },
  "scholar": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-scholar-!cn.mrs",
    "path": "./ruleset/scholar.mrs"
  },
  "geolocation-cn": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/geolocation-cn.mrs",
    "path": "./ruleset/geolocation-cn.mrs"
  },
  "cn": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs",
    "path": "./ruleset/cn.mrs"
  },
  "geolocation-!cn": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/geolocation-!cn.mrs",
    "path": "./ruleset/geolocation-!cn.mrs"
  },
  "private-ip": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/private.mrs",
    "path": "./ruleset/private-ip.mrs"
  },
  "cn-ip": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs",
    "path": "./ruleset/cn-ip.mrs"
  },
  "telegram-ip": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/telegram.mrs",
    "path": "./ruleset/telegram-ip.mrs"
  },
  "google-ip": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "interval": 86400,
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/google.mrs",
    "path": "./ruleset/google-ip.mrs"
  }
};

const rules = [
  "DOMAIN-SUFFIX,tempmail.cn,DIRECT",
  "DOMAIN-SUFFIX,senhao.xyz,DIRECT",
  "DOMAIN-SUFFIX,hostdzire.com,Proxy",
  "DOMAIN-SUFFIX,22112211.xyz,Proxy",
  "DOMAIN-SUFFIX,112320.xyz,Proxy",

  "RULE-SET,ads,REJECT",
  "RULE-SET,private,DIRECT",
  "RULE-SET,private-ip,DIRECT,no-resolve",

  "RULE-SET,ai,OpenAi",

  "RULE-SET,microsoft-cn,DIRECT",
  "RULE-SET,microsoft,Proxy",

  "RULE-SET,youtube,Proxy",
  "RULE-SET,github,Proxy",
  "RULE-SET,google,Proxy",
  "RULE-SET,telegram,Proxy",
  "RULE-SET,twitter,Proxy",
  "RULE-SET,discord,Proxy",
  "RULE-SET,pixiv,Proxy",
  "RULE-SET,scholar,Proxy",

  "RULE-SET,apple-cn,DIRECT",
  "RULE-SET,steam-cn,DIRECT",
  "RULE-SET,games-cn,DIRECT",
  "RULE-SET,geolocation-cn,DIRECT",
  "RULE-SET,cn,DIRECT",
  "RULE-SET,cn-ip,DIRECT",

  "RULE-SET,telegram-ip,Proxy,no-resolve",
  "RULE-SET,google-ip,Proxy,no-resolve",

  "RULE-SET,geolocation-!cn,Proxy",

  "MATCH,Others"
];
