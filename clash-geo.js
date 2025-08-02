/**
 * 个人备份使用，该脚本适用与Mihomo Party和 Clash Verge Rev
 * Clash Verge Rev 全局扩展脚本（懒人配置）/ Mihomo Party 覆写脚本
 * URL: https://github.com/wanswu/my-backup
 */
const providersOptions = {
    "type": "http",
    "interval": 3600,
    "health-check": {
      "enable": true,
      "url": "http://www.gstatic.com/generate_204",
      "interval": 300
    }
}

// 多订阅合并，这里添加额外的地址
const proxyProviders = {
  "node": {
    ...providersOptions,
    // 订阅 链接
    "url": "http://127.0.0.1:38324/download/node?target=ClashMeta",
    // 自动更新时间 86400(秒) / 3600 = 24小时
    "override": {
      // 节点名称前缀 p1，用于区别机场节点
      "additional-prefix": "node | "
    }
  },
}

const myCustomNode = {
  "🇯🇵 Japan-microsoft" :{"type":"vless","name":"🇯🇵 Japan-microsoft","server":"xxx","port":50002,"uuid":"6db481df-a87a-4d49-aa16-a0afc200ab80","tls":true,"flow":"xtls-rprx-vision","client-fingerprint":"chrome","skip-cert-verify":false,"reality-opts":{"public-key":"QQ0ib3Jkc__V4oqbYTZ1B4DWdE_jMzkyfHUoC_eA-hA","short-id":"22c740","_spider-x":"/"},"network":"tcp","servername":"go.microsoft.com"}
};

// 程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const originalProviders = config?.["proxy-providers"] || {};
  const proxyProviderCount = typeof originalProviders === "object" ? Object.keys(originalProviders).length : 0;

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }
  // 添加所有自定义节点到 proxies 数组
  config.proxies.push(...Object.values(myCustomNode));
  // 合并而非覆盖
  config["proxy-providers"] = {
    ...originalProviders,  // 保留原有配置
    ...proxyProviders       // 合并新配置（同名则覆盖）
  };
  // 覆盖原配置中DNS配置
  config["dns"] = dnsConfig;
  // 覆盖原配置中的代理组
  config["proxy-groups"] = proxyGroupConfig;
  // 覆盖原配置中的规则
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;
  //覆盖通用配置
  config["mixed-port"] = 7890;
  config["allow-lan"] = true;
  config["bind-address"] = "*";
  config["ipv6"] = false;
  config["unified-delay"] = true;
  config["tcp-concurrent"] = true;
  config["external-controller"] = "9090";
  // 返回修改后的配置
  return config;
}
// DNS配置
const dnsConfig = {
  "enable": true,
  "listen": "0.0.0.0:1053",
  "ipv6": false,
  "prefer-h3": false,
  "respect-rules": true,
  "use-system-hosts": false,
  "cache-algorithm": "arc",
  "cache-size": 2048,
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    "*.senhao.xyz",
    "geosite:private",
    "geosite:cn",
    "geosite:geolocation-!cn"
  ],
  "default-nameserver": [
    "223.5.5.5",
    "119.29.29.29"
  ],
// 默认的域名解析服务器，如不配置 fallback/proxy-server-nameserver , 则所有域名都由 nameserver 解析
  "nameserver": [
    "https://cloudflare-dns.com/dns-query#Proxy", // CloudflareDNS
    "https://8.8.8.8/dns-query#Proxy" // Google公共DNS
  ],
// 代理节点域名解析服务器，仅用于解析代理节点的域名
  "proxy-server-nameserver": [
    "https://223.5.5.5/dns-query", // 阿里DoH
    "https://doh.pub/dns-query" // 腾讯DoH
  ],
  "direct-nameserver": [
    "https://223.5.5.5/dns-query", // 阿里DoH
    "https://doh.pub/dns-query" // 腾讯DoH
  ],
// 指定域名查询的解析服务器，可使用 geosite, 优先于 nameserver/fallback 查询
  "direct-nameserver-follow-policy": false,
  "nameserver-policy": {
    'geosite:cn': [
      "https://223.5.5.5/dns-query",
      "https://doh.pub/dns-query"
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
      "interval": 300,
      "include-all": true,
      "filter": "(香港|日本|东京)",
    },
    {
      "name": "Proxy",
      "type": "select",
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Global.png",
      "proxies": ["AutoSelect"]
    },
    {
      "name": "OpenAi", 
      "type": "url-test",
      "url": "http://www.gstatic.com/generate_204",
      "interval": 300,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png",
      "filter": "(GPT|美国)",
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
  'DOMAIN-SUFFIX,senhao.xyz,DIRECT',

  'RULE-SET,reject-list,REJECT',
  'GEOSITE,category-ads-all,REJECT',
  'GEOSITE,private,DIRECT',
  'GEOSITE,youtube,Proxy',
  'GEOSITE,google,Proxy',
  'GEOSITE,github,Proxy',
  'GEOSITE,twitter,Proxy',
  'GEOSITE,pixiv,Proxy',
  'GEOSITE,category-scholar-!cn,Proxy',
  'GEOSITE,category-ai-!cn,OpenAi',
  'GEOSITE,biliintl,Proxy',
  'GEOSITE,onedrive,DIRECT',
  'GEOSITE,microsoft,DIRECT',
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
