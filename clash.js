/**
 * 个人备份使用，该脚本适用与Mihomo Party和 Clash Verge Rev
 * Clash Verge Rev 全局扩展脚本（懒人配置）/ Mihomo Party 覆写脚本
 * URL: https://github.com/wanswu/my-backup
 */

// 多订阅合并，这里添加额外的地址
// const proxyProviders = {
//   "p1": {
//     "type": "http",
//     // 订阅 链接
//     "url": "https://baidu.com",
//     // 自动更新时间 86400(秒) / 3600 = 24小时
//     "interval": 86400,
//     "override": {
//       // 节点名称前缀 p1，用于区别机场节点
//       "additional-prefix": "p1 |"
//     }
//   },
//   "p2": {
//     "type": "http",
//     "url": "https://google.com",
//     "interval": 86400,
//     "override": {
//       "additional-prefix": "p2 |"
//     }
//   },
// }

// 程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const originalProviders = config?.["proxy-providers"] || {};
  const proxyProviderCount = typeof originalProviders === "object" ? Object.keys(originalProviders).length : 0;

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 合并而非覆盖
  config["proxy-providers"] = {
    ...originalProviders,  // 保留原有配置
    // ...proxyProviders       // 合并新配置（同名则覆盖）
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
  config["external-controller"] = ":9090";
  // 返回修改后的配置
  return config;
}
// DNS配置
const dnsConfig = {
  "enable": true,
  "ipv6": false,
  "use-hosts": false,
  "respect-rules": true,
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "192.18.0.1/16",
  "fallback": ["1.1.1.1", "8.8.8.8"],
  "fake-ip-filter-mode": "blacklist",
  "fake-ip-filter": [
    "+.lan", 
    "+.local", 
    "geosite:private",
    "geosite:cn"
  ],
  "default-nameserver": [
    "223.5.5.5", 
    "119.29.29.29", 
    "114.114.114.114"
  ],
  "proxy-server-nameserver": [
    "223.5.5.5", 
    "119.29.29.29", 
    "114.114.114.114"
  ],
  "nameserver": [
    "223.5.5.5", 
    "119.29.29.29", 
    "114.114.114.114"
  ],
  "nameserver-policy": {
    "rule-set:private_domain,china_domain": [
      "223.5.5.5",
      "119.29.29.29",
      "114.114.114.114"
    ],
    "rule-set:geolocation-!cn": [
      "https://dns.cloudflare.com/dns-query",
      "https://dns.google/dns-query"
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
      "name": "Domestic",
      "type": "select",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/refs/heads/master/IconSet/Color/Domestic.png",
      "proxies": ["DIRECT"]
    },
    {
      "name": "OpenAi", 
      "type": "select", 
      "hidden": false, 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png",
      "filter": "(GPT|美国)",
      "include-all": true 
    },
    { 
      "name": "Others", 
      "type": "select", 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png",
      "proxies": ["Proxy", "Domestic"]
    },
    // 其他分流策略组
    {
      "name": "YouTube", 
      "type": "select", 
      "hidden": true, 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png",
      "proxies": ["Proxy"] 
    },

    { 
      "name": "Telegram", 
      "type": "select", 
      "hidden": true, 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png",
      "proxies": ["Proxy"] 
    },
    { 
      "name": "Google", 
      "type": "select", 
      "hidden": true, 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google.png",
      "proxies": ["Proxy"] 
    },
    { 
      "name": "Github", 
      "type": "select", 
      "hidden": true, 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/GitHub.png",
      "proxies": ["Proxy"] 
    },
    { 
      "name": "Microsoft", 
      "type": "select", 
      "hidden": true, 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png",
      "proxies": ["Domestic", "Proxy"]
    },
    { 
      "name": "Netflix", 
      "type": "select", 
      "hidden": true, 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Netflix.png",
      "proxies": ["Proxy"] 
    },
    { 
      "name": "Apple", 
      "type": "select", 
      "hidden": true, 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple.png",
      "proxies": ["Domestic", "Proxy"]
    },
    { 
      "name": "OneDrive", 
      "type": "select", 
      "hidden": true, 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/OneDrive.png",
      "proxies": ["Domestic", "Proxy"]
    },

];



// 规则集配置
const ruleProviders = {
   "private_domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/private.mrs",
    "path": "./ruleset/private_domain.mrs",
    "interval": 86400
  },
  "china_domain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs",
    "path": "./ruleset/china_domain.mrs",
    "interval": 86400
  },
  "china_ip": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs",
    "path": "./ruleset/china_ip.mrs",
    "interval": 86400
  },
  "custom_proxy": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/senhao-xu/Rule/master/Clash/proxy.yaml",
    "path": "./ruleset/custom_proxy.yaml",
    "interval": 86400
  },
  "custom_domestic": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/senhao-xu/Rule/master/Clash/domestic.yaml",
    "path": "./ruleset/custom_domestic.yaml",
    "interval": 86400
  },
  "open_ai": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Providers/Ruleset/OpenAi.yaml",
    "path": "./ruleset/open_ai.yaml",
    "interval": 86400
  },
  "youtube": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/youtube.mrs",
    "path": "./ruleset/youtube.mrs",
    "interval": 86400
  },
  "telegram": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/telegram.mrs",
    "path": "./ruleset/telegram.mrs",
    "interval": 86400
  },
  "google": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/google.mrs",
    "path": "./ruleset/google.mrs",
    "interval": 86400
  },
  "github": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/github.mrs",
    "path": "./ruleset/github.mrs",
    "interval": 86400
  },
  "microsoft": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft.mrs",
    "path": "./ruleset/microsoft.mrs",
    "interval": 86400
  },
  "apple": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/apple-cn.mrs",
    "path": "./ruleset/apple.mrs",
    "interval": 86400
  },
  "netflix": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/netflix.mrs",
    "path": "./ruleset/netflix.mrs",
    "interval": 86400
  },
  "onedrive": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/onedrive.mrs",
    "path": "./ruleset/onedrive.mrs",
    "interval": 86400
  },
  "geolocation-!cn": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/geolocation-!cn.mrs",
    "path": "./ruleset/geolocation-!cn.mrs",
    "interval": 86400
  }
};

// 规则
const rules = [
  // 自定义规则
  'RULE-SET,private_domain,Domestic',
  'RULE-SET,onedrive,OneDrive',
  'RULE-SET,netflix,Netflix',
  'RULE-SET,open_ai,OpenAi',
  'RULE-SET,apple,Apple',
  'RULE-SET,youtube,YouTube',
  'RULE-SET,google,Google',
  'RULE-SET,github,Github',
  'RULE-SET,microsoft,Microsoft',
  'RULE-SET,telegram,Telegram',
  'RULE-SET,custom_proxy,Proxy',
  'RULE-SET,custom_domestic,Domestic',
  'RULE-SET,china_domain,Domestic',
  'RULE-SET,china_ip,Domestic',
  'RULE-SET,geolocation-!cn,Proxy',
  'GEOIP,LAN,Domestic',
  'GEOIP,CN,Domestic',
  'MATCH,Others'
];
