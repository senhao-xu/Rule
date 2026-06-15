/**
 * 个人备份使用，该脚本适用与Mihomo Party和 Clash Verge Rev
 * Clash Verge Rev 全局扩展脚本（懒人配置）/ Mihomo Party 覆写脚本
 * URL: https://github.com/wanswu/my-backup
 */
// 程序入口
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

// 代理组规则
const proxyGroupConfig = [
    {
      "name": "AutoSelect",
      "type": "url-test",
      "url": "http://www.gstatic.com/generate_204",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png",
      // "interval": 300,
      "include-all": true,
      "filter": "(香港|日本|东京)",
    },
    {
      "name": "Proxy",
      "type": "select",
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png",
      "proxies": ["AutoSelect"]
    },
    {
      "name": "OpenAi", 
      "type": "url-test",
      "url": "http://www.gstatic.com/generate_204",
      // "interval": 300,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png",
      "filter": "(GPT|美国|LA|德国|家宽|US)",
      "include-all": true 
    },
    { 
      "name": "Others", 
      "type": "select", 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png",
      "proxies": ["Proxy", "DIRECT"]
    },

];

// 规则集配置
const ruleProviders = {
  "reject-list": {
    "type": "http",
    "behavior": "domain",
    "format": "text",
    "interval": 86400,
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/reject-list.txt",
    "path": "./ruleset/reject-list.txt"
  }
};

// 规则
const rules = [
  // 自定义规则
  'DOMAIN-SUFFIX,tempmail.cn,DIRECT',
  // 'DOMAIN-SUFFIX,senhao.xyz,DIRECT',

  'RULE-SET,reject-list,REJECT',
  'GEOSITE,category-ads-all,REJECT',
  'GEOSITE,private,DIRECT',
  'GEOSITE,youtube,Proxy',
  'GEOSITE,google,Proxy',
  'GEOSITE,github,Proxy',
  'GEOSITE,twitter,Proxy',
  'GEOSITE,pixiv,Proxy',
  'GEOSITE,cloudflare,Proxy',
  'GEOSITE,cursor,OpenAi',
  'GEOSITE,category-scholar-!cn,Proxy',
  'GEOSITE,category-ai-!cn,OpenAi',
  'GEOSITE,discord,Proxy',
  'GEOSITE,onedrive,DIRECT',
  'GEOSITE,microsoft@cn,DIRECT',
  'GEOSITE,microsoft,OpenAi',
  'GEOSITE,apple-cn,DIRECT',
  'GEOSITE,steam@cn,DIRECT',
  'GEOSITE,category-games@cn,DIRECT',
  'GEOSITE,geolocation-cn,DIRECT',
  'GEOSITE,geolocation-cn@cn,DIRECT',
  'GEOSITE,geolocation-!cn,Proxy',
  'GEOSITE,cn,DIRECT',

  // GEOIP 规则
  'GEOIP,private,DIRECT,no-resolve',
  'GEOIP,telegram,Proxy,no-resolve',
  'GEOIP,google,Proxy,no-resolve',
  'GEOIP,lan,DIRECT,no-resolve',
  'GEOIP,CN,DIRECT',
  'MATCH,Others'
];
