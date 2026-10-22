/**
 * 个人备份使用，该脚本适用与Mihomo Party和 Clash Verge Rev
 * Clash Verge Rev 全局扩展脚本（懒人配置）/ Mihomo Party 覆写脚本
 * URL: https://github.com/wanswu/my-backup
 * Clash Verge Rev 2.5.8：端口、IPv6、统一延迟及 TUN 请在应用中设置。
 * 升级操作见同目录 UPGRADE-2.5.8.md。
 */
// 链式代理配置：本机 -> entry（入口）-> exit（出口）-> 目标网站。
// name 是新增节点的名称；entry / exit 支持原始名称或带订阅前后缀的完整显示名称。
// 两个节点名都为空的示例会跳过；只填一个会报错。复制一项即可增加链路，[] 表示不启用链路。
// entryProvider / exitProvider 可选：指定动态提供器，避免不同订阅中的同名节点混淆。
// 动态入口使用隐藏辅助组；动态出口仍是真实协议节点，随原订阅自动更新。
// 链式节点在 Proxy / OpenAi 中置顶；多条链路按下面的填写顺序排列。
// 入口未匹配时拒绝连接；出口未匹配时不会出现对应的新节点。
const chainDefinitions = [
  {
    name: "DMIT->Lisa",
    entry: "DMIT-V6",
    exit: "【家宽】Lisa美国【0.5x】",
    entryProvider: "node", // 可选，当前入口的订阅来源
    exitProvider: "free"   // 可选，当前出口的订阅来源
  }
];

// 程序入口
function main(config) {
  try {
    return applyConfig(config);
  } catch (error) {
    // Clash Verge Rev 会将异常统一显示为 Script execution failed，先记录具体原因。
    console.error(`配置脚本错误：${error.message || String(error)}`);
    throw error;
  }
}

function applyConfig(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const originalProviders = config?.["proxy-providers"] || {};
  const proxyProviderCount = typeof originalProviders === "object" ? Object.keys(originalProviders).length : 0;

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }
  const chainConfig = createChainConfig(config?.proxies || [], originalProviders);
  config["proxies"] = [
    ...(config?.proxies || []),
    ...chainConfig.proxies
  ];
  // 保留原有订阅；出口副本使用相同来源及更新周期。
  config["proxy-providers"] = {
    ...originalProviders,
    ...chainConfig.providers
  };
  // 覆盖 DNS 配置，保留应用/上游传入的 IPv6 开关，避免与 DNS 覆写冲突。
  const dnsIpv6 = config["dns"]?.["ipv6"];
  config["dns"] = { ...dnsConfig };
  if (typeof dnsIpv6 === "boolean") config["dns"]["ipv6"] = dnsIpv6;
  // 保留传入的 TUN 配置；协议栈建议在应用的 TUN 设置中选择 Mips。
  // 覆盖原配置中的代理组
  config["proxy-groups"] = createProxyGroupConfig(chainConfig);
  // 覆盖原配置中的规则
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;
  // 端口、局域网访问、IPv6、统一延迟和外部控制器由应用设置管理。
  // 脚本只修改未由应用接管的通用字段。
  config["bind-address"] = "*";
  config["tcp-concurrent"] = true;
  config["find-process-mode"] = "strict";
  // 返回修改后的配置
  return config;
}

// Mihomo 的过滤器用反引号分隔；替换字符串中的 $ 需要转义。
function regexLiteral(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/`/g, "\\x60");
}

function exactNameFilter(names) {
  return `\\A(${[...new Set(names)].map(regexLiteral).join("|")})\\z`;
}

function replacementLiteral(value) {
  return value.replace(/\$/g, () => "$$");
}

function providerNodeNames(name, provider) {
  const override = provider?.override || {};
  return [name, `${override["additional-prefix"] || ""}${name}${override["additional-suffix"] || ""}`];
}

const chainInternalFilter = "\\[__chain_internal_[0-9]+__\\]\\z";

// 缓存同时绑定提供器名称、URL 和原路径，切换订阅后不会读取另一来源的旧节点。
function chainProviderCacheKey(source, provider) {
  const identity = JSON.stringify([source, provider.url || "", provider.path || ""]);
  let hash = 2166136261;
  for (let i = 0; i < identity.length; i++) {
    hash = Math.imul(hash ^ identity.charCodeAt(i), 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

// 静态出口直接复制；动态出口由提供器按原订阅生成并重命名，不增加出口策略组。
function createChainConfig(proxies, providers) {
  const originalProxies = proxies.filter(proxy => proxy && typeof proxy.name === "string");
  const originalProxyNames = originalProxies.map(proxy => proxy.name);
  const originalProviderNames = Object.keys(providers);
  const proxyByName = new Map(originalProxies.map(proxy => [proxy.name, proxy]));
  const chainedProxies = [];
  const chainedProviders = {};
  const groups = [];
  const chainProxyNames = [];
  const chainProviderNames = [];
  const definitions = chainDefinitions.filter((definition, index) => {
    if (!definition || typeof definition !== "object") {
      throw new Error(`第 ${index + 1} 条链路配置无效`);
    }
    if (definition.entry === "" && definition.exit === "") return false;
    for (const field of ["name", "entry", "exit"]) {
      if (typeof definition[field] !== "string" || !definition[field].trim()) {
        throw new Error(`第 ${index + 1} 条链路的 ${field} 必须填写，节点名按完整名称匹配`);
      }
    }
    return true;
  });
  const usedNames = new Set([
    ...originalProxyNames,
    ...originalProviderNames,
    "Proxy", "OpenAi", "Others", "GLOBAL", "DIRECT", "REJECT", "REJECT-DROP", "PASS", "COMPATIBLE", "default"
  ]);

  // 新节点名不能与原始节点、代理组或其他链式节点重名。
  for (const { name } of definitions) {
    if (usedNames.has(name)) {
      throw new Error(`链路显示名称重复或与现有名称冲突：${name}`);
    }
    usedNames.add(name);
  }
  function allocateName(base) {
    let name = base;
    while (usedNames.has(name)) name += "_";
    usedNames.add(name);
    return name;
  }
  function sourceProviders(providerName, chainName) {
    if (providerName === undefined || providerName === "") return [...originalProviderNames];
    if (typeof providerName !== "string" || !Object.prototype.hasOwnProperty.call(providers, providerName)) {
      throw new Error(`链路「${chainName}」的提供器不存在：${providerName}`);
    }
    return [providerName];
  }

  definitions.forEach(({ name, entry, exit, entryProvider, exitProvider }, index) => {
    const entrySources = sourceProviders(entryProvider, name);
    const exitSources = sourceProviders(exitProvider, name);
    const entryProxy = entryProvider ? undefined : proxyByName.get(entry);
    const exitProxy = exitProvider ? undefined : proxyByName.get(exit);
    for (const [role, nodeName, node, sources] of [
      ["入口", entry, entryProxy, entrySources],
      ["出口", exit, exitProxy, exitSources]
    ]) {
      if (!node && sources.length === 0) {
        throw new Error(`链路「${name}」的${role}节点不存在：${nodeName}，且没有可用的动态提供器`);
      }
    }

    let dialerName = entry;
    if (!entryProxy) {
      dialerName = allocateName(`__chain_${index + 1}_entry`);
      groups.push({
        "name": dialerName,
        "type": "select",
        "hidden": true,
        "use": entrySources,
        "filter": exactNameFilter(entrySources.flatMap(source => providerNodeNames(entry, providers[source]))),
        "empty-fallback": "REJECT"
      });
    }

    if (exitProxy) {
      chainedProxies.push({ ...exitProxy, "name": name, "dialer-proxy": dialerName });
      chainProxyNames.push(name);
      return;
    }

    const internalSuffix = ` [__chain_internal_${index + 1}__]`;
    exitSources.forEach((source, providerIndex) => {
      const provider = providers[source];
      const override = provider?.override || {};
      const cloneName = allocateName(`__chain_${index + 1}_exit_provider_${providerIndex + 1}`);
      // 先保留原来的重命名和前后缀，再只将指定出口改为用户名称。
      // 其余节点附加内部标记，在普通代理组中排除，避免订阅未匹配时产生空提供器错误。
      const clone = {
        ...provider,
        "health-check": { ...(provider?.["health-check"] || {}), "enable": false },
        "override": {
          ...override,
          "dialer-proxy": dialerName,
          "additional-prefix": "",
          "additional-suffix": "",
          "proxy-name": [
            ...(override["proxy-name"] || []),
            {
              "pattern": "\\A([\\s\\S]*)\\z",
              "target": `${replacementLiteral(override["additional-prefix"] || "")}$1${replacementLiteral(override["additional-suffix"] || "")}${internalSuffix}`
            },
            {
              "pattern": exactNameFilter(providerNodeNames(exit, provider).map(nodeName => `${nodeName}${internalSuffix}`)),
              "target": replacementLiteral(name)
            }
          ]
        }
      };
      // HTTP 独立缓存；file 读取原文件；inline 保留原 payload。
      if (provider?.type === "http") {
        const cacheKey = chainProviderCacheKey(source, provider);
        clone.path = `./proxy_providers/chain-${index + 1}-${providerIndex + 1}-${cacheKey}.yaml`;
      }
      chainedProviders[cloneName] = clone;
      chainProviderNames.push(cloneName);
    });
  });

  return {
    "proxies": chainedProxies,
    "providers": chainedProviders,
    "groups": groups,
    "chainProxyNames": chainProxyNames,
    "chainProviderNames": chainProviderNames,
    "chainNames": definitions.map(({ name }) => name),
    "originalProxyNames": originalProxyNames,
    "originalProviderNames": originalProviderNames
  };
}
// DNS配置
const dnsConfig = {
  "enable": true, // DNS开关
  "listen": "0.0.0.0:1053", // DNS监听地址
  "ipv6": false, // 上游未指定 DNS IPv6 时的默认值；已指定时保留其值
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
    "geosite:tencent", // 微信、QQ等腾讯服务返回真实IP
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
    "dns.msftncsi.com",
    "*.msftconnecttest.com",
    "*.msftncsi.com",
    // Windows系统服务
    "*.windows.com",
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
function createProxyGroupConfig(chainConfig) {
  const aiFilter = "(GPT|美国|LA|德国|家宽|US)";
  // Mihomo 按反引号分段的筛选顺序排列节点，可让动态链路排在原有静态节点之前。
  const chainFilters = chainConfig.chainNames.map(name => exactNameFilter([name]));
  const aiProxies = [
    ...chainConfig.chainProxyNames,
    ...chainConfig.originalProxyNames.filter(name => new RegExp(aiFilter).test(name))
  ];
  if (aiProxies.length === 0 && chainConfig.originalProviderNames.length === 0) {
    aiProxies.push("Proxy");
  }
  return [
    ...chainConfig.groups,
    {
      "name": "Proxy",
      "type": "select",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png",
      // 链式节点置顶，其余节点保留原顺序。
      "filter": chainFilters.length > 0 ? [...chainFilters, "[\\s\\S]*"].join("`") : "",
      "proxies": [...chainConfig.chainProxyNames, ...chainConfig.originalProxyNames],
      "use": [...chainConfig.originalProviderNames, ...chainConfig.chainProviderNames],
      "exclude-filter": chainInternalFilter
    },
    {
      "name": "OpenAi", 
      "type": "select",
      "url": "http://www.gstatic.com/generate_204",
      // "interval": 300,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png",
      "filter": [...chainFilters, aiFilter].join("`"),
      "proxies": aiProxies,
      "use": [...chainConfig.originalProviderNames, ...chainConfig.chainProviderNames],
      "exclude-filter": chainInternalFilter
    },
    { 
      "name": "Others", 
      "type": "select", 
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png",
      "proxies": ["Proxy", "DIRECT"]
    },

  ];
}

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

  // 微信新旧版本均强制直连，覆盖小程序等非腾讯域名请求
  'PROCESS-NAME,Weixin.exe,DIRECT',
  'PROCESS-NAME,WeChat.exe,DIRECT',
  
  'GEOSITE,category-ads-all,REJECT', // 广告联盟、统计、追踪域名拦截
  'GEOSITE,tencent,DIRECT', // 腾讯服务直连（微信、QQ、腾讯相关服务）
  // AI
  'PROCESS-NAME,ChatGPT.exe,OpenAi',
  'GEOSITE,openai,OpenAi', // OpenAI服务
  'GEOSITE,anthropic,OpenAi', // Anthropic Claude服务
  'GEOSITE,cursor,OpenAi', // Cursor AI编辑器服务
  'DOMAIN-SUFFIX,models.dev,OpenAi',
  'GEOSITE,huggingface,Proxy', //huggingface
  'GEOSITE,category-ai-!cn,OpenAi', // 海外AI服务（排除中国大陆）

  'GEOSITE,category-scholar-!cn,Proxy', // 海外学术资源（排除中国大陆）
  
  'GEOSITE,oracle,DIRECT', // oracle全系列服务
  'GEOSITE,google,Proxy', // Google全系列服务
  'GEOSITE,youtube,Proxy', // YouTube视频服务
  'GEOSITE,github,Proxy', // GitHub代码托管
  'GEOSITE,twitter,Proxy', // Twitter / X社交平台
  'GEOSITE,pixiv,Proxy', // Pixiv插画社区
  'GEOSITE,discord,Proxy', // Discord通信服务
  'GEOSITE,wallhaven,Proxy', // Wallhaven壁纸网站
  'GEOSITE,onedrive,DIRECT', // OneDrive云存储直连
  'GEOSITE,microsoft@cn,DIRECT', // Microsoft中国服务直连
  'GEOSITE,microsoft,DIRECT', // Microsoft海外服务代理
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
