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
  // 合并而非覆盖
  config["proxy-providers"] = {
    ...originalProviders,  // 保留原有配置
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
  "enable": true, // DNS开关
  "listen": "0.0.0.0:1053", // DNS监听地址
  "ipv6": false, // 禁用IPv6 DNS，避免部分应用IPv6异常
  "prefer-h3": false, // 不强制使用HTTP3 DoH
  "respect-rules": true, // DNS遵循规则匹配
  "use-hosts": true, // 使用hosts文件
  "use-system-hosts": true, // 使用系统hosts
  "cache-algorithm": "arc", // DNS缓存算法
  "cache-size": 8192, // DNS缓存数量
  "enhanced-mode": "fake-ip", // Fake-IP模式
  "fake-ip-range": "198.18.0.1/16", // Fake-IP地址池
  // 不进行Fake-IP替换的域名
  "fake-ip-filter": [
    "geosite:private", // 私有域名
    "*.lan", // 局域网域名
    // 微信 / 腾讯相关
    "*.qq.com",
    "*.qpic.cn",
    "*.qlogo.cn",
    "*.weixin.qq.com",
    "*.wechat.com",
    // 苹果服务
    "*.push.apple.com",
    "*.apple.com",
    "*.icloud.com",
    "*.mzstatic.com",
    // Windows网络检测
    "www.msftconnecttest.com",
    "www.msftncsi.com",
    // OneDrive
    "*.onedrive.live.com"
  ],
  // 用于解析DoH服务器地址
  "default-nameserver": [
    "223.5.5.5",
    "119.29.29.29"
  ],
  // 默认DNS（国外域名）
  "nameserver": [
    "https://cloudflare-dns.com/dns-query#Proxy",
    "https://dns.google/dns-query#Proxy"
  ],
  // 代理节点域名解析
  "proxy-server-nameserver": [
    "https://223.5.5.5/dns-query",
    "https://doh.pub/dns-query"
  ],
  // 直连DNS
  "direct-nameserver": [
    "https://223.5.5.5/dns-query",
    "https://doh.pub/dns-query"
  ],
  // DNS跟随规则
  "direct-nameserver-follow-policy": true,
  // DNS策略
  "nameserver-policy": {
    // 中国大陆域名
    "geosite:cn": [
      "https://223.5.5.5/dns-query",
      "https://doh.pub/dns-query"
    ],
    // 腾讯服务（微信、QQ）
    "geosite:tencent": [
      "https://223.5.5.5/dns-query",
      "https://doh.pub/dns-query"
    ],
    // Apple中国服务
    "geosite:apple-cn": [
      "https://223.5.5.5/dns-query"
    ],
    // Microsoft中国服务
    "geosite:microsoft@cn": [
      "https://223.5.5.5/dns-query"
    ],
    // OneDrive
    "geosite:onedrive": [
      "https://223.5.5.5/dns-query"
    ]
  },
  // 国外DNS备用
  "fallback": [
    "https://cloudflare-dns.com/dns-query#Proxy",
    "https://dns.google/dns-query#Proxy"
  ],
  // 防止DNS污染
  "fallback-filter": {
    "geoip": true,
    "geoip-code": "CN"
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
      "type": "select",
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
  // "reject-list": {
  //   "type": "http",
  //   "behavior": "domain",
  //   "format": "text",
  //   "interval": 86400,
  //   "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/reject-list.txt",
  //   "path": "./ruleset/reject-list.txt"
  // }
};

// 规则
const rules = [
  // 自定义规则
  // 'DOMAIN-SUFFIX,tempmail.cn,DIRECT',
  // 'DOMAIN-SUFFIX,hostdzire.com,Proxy',
  // 'DOMAIN-SUFFIX,22112211.xyz,Proxy',
  // 'DOMAIN-SUFFIX,112320.xyz,Proxy',
  // 'RULE-SET,reject-list,REJECT',

  // 本地
  'GEOSITE,private,DIRECT', // 私有域名、本地服务直连
  'GEOIP,private,DIRECT,no-resolve', // 私有IP直连，不解析域名
  'GEOIP,lan,DIRECT,no-resolve', // 局域网IP直连，不解析域名

  'GEOSITE,category-ads-all,REJECT', // 广告联盟、统计、追踪域名拦截
  'GEOSITE,tencent,DIRECT', // 腾讯服务直连（微信、QQ、腾讯相关服务）
  // AI
  'GEOSITE,openai,OpenAi', // OpenAI服务
  'GEOSITE,anthropic,OpenAi', // Anthropic Claude服务
  'GEOSITE,cursor,OpenAi', // Cursor AI编辑器服务
  'GEOSITE,category-ai-!cn,OpenAi', // 海外AI服务（排除中国大陆）

  'GEOSITE,category-scholar-!cn,Proxy', // 海外学术资源（排除中国大陆）
  
  'GEOSITE,google,Proxy', // Google全系列服务
  'GEOSITE,youtube,Proxy', // YouTube视频服务
  'GEOSITE,github,Proxy', // GitHub代码托管
  'GEOSITE,twitter,Proxy', // Twitter / X社交平台
  'GEOSITE,pixiv,Proxy', // Pixiv插画社区
  'GEOSITE,discord,Proxy', // Discord通信服务
  'GEOSITE,wallhaven,Proxy', // Wallhaven壁纸网站
  'GEOSITE,onedrive,DIRECT', // OneDrive云存储直连
  'GEOSITE,microsoft@cn,DIRECT', // Microsoft中国服务直连
  'GEOSITE,microsoft,Proxy', // Microsoft海外服务代理
  'GEOSITE,apple-cn,DIRECT', // Apple中国服务直连
  'GEOSITE,steam@cn,DIRECT', // Steam中国服务直连
  'GEOSITE,category-games@cn,DIRECT', // 中国游戏平台直连
  'GEOSITE,geolocation-cn,DIRECT', // 中国地区服务直连
  // 自定义规则
  'DOMAIN-SUFFIX,ipwho.is,Proxy', // IP地理位置查询服务
  'DOMAIN-SUFFIX,ipapi.co,Proxy', // IP信息查询服务
  'DOMAIN-SUFFIX,aloxaf.com,Proxy', // GeoViewer地理位置查询服务

  'GEOSITE,geolocation-!cn,Proxy', // 非中国地区服务代理
  'GEOSITE,cn,DIRECT', // 中国大陆网站直连
  'GEOIP,telegram,Proxy,no-resolve', // Telegram IP代理
  'GEOIP,google,Proxy,no-resolve', // Google IP代理
  'GEOIP,CN,DIRECT', // 中国大陆IP直连

  'MATCH,Others' // 未匹配流量走Others策略组
];
