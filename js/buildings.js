/**
 * 建筑定义
 */
const BuildingDefinitions = {
    // 基础建筑
    tent: {
        name: '帐篷',
        icon: '⛺',
        description: '简陋的住所，提供2人口上限',
        cost: { wood: 20 },
        effects: { popCap: 2 },
        requireTech: null
    },
    hut: {
        name: '茅屋',
        icon: '🛖',
        description: '更好的住所，提供5人口上限',
        cost: { wood: 50, stone: 10 },
        effects: { popCap: 5 },
        requireTech: 'construction'
    },
    house: {
        name: '房屋',
        icon: '🏠',
        description: '舒适的住所，提供10人口上限',
        cost: { wood: 100, stone: 50, metal: 10 },
        effects: { popCap: 10 },
        requireTech: 'masonry'
    },

    // 生产建筑
    farm: {
        name: '农场',
        icon: '🚜',
        description: '自动生产食物 (+0.5/秒)',
        cost: { wood: 30, stone: 10 },
        production: { food: 0.5 },
        requireTech: 'agriculture'
    },
    lumberMill: {
        name: '锯木厂',
        icon: '🏭',
        description: '自动生产木材 (+0.4/秒)',
        cost: { wood: 50, stone: 20 },
        production: { wood: 0.4 },
        requireTech: 'tools'
    },
    quarry: {
        name: '采石场',
        icon: '🏗️',
        description: '自动生产石料 (+0.3/秒)',
        cost: { wood: 80, metal: 10 },
        production: { stone: 0.3 },
        requireTech: 'mining'
    },
    mine: {
        name: '矿井',
        icon: '⛏️',
        description: '自动生产金属 (+0.2/秒)',
        cost: { wood: 100, stone: 50 },
        production: { metal: 0.2 },
        requireTech: 'mining'
    },

    // 储存建筑
    barn: {
        name: '粮仓',
        icon: '🌾',
        description: '增加食物储存上限 +200',
        cost: { wood: 40 },
        effects: { resourceMax: { food: 200 } },
        requireTech: null
    },
    warehouse: {
        name: '仓库',
        icon: '📦',
        description: '增加所有资源储存上限 +100',
        cost: { wood: 100, stone: 50 },
        effects: { resourceMax: { wood: 100, stone: 100, metal: 100, gold: 100 } },
        requireTech: 'construction'
    },

    // 特殊建筑
    library: {
        name: '图书馆',
        icon: '📖',
        description: '自动生产科研点 (+0.2/秒)',
        cost: { wood: 150, stone: 100 },
        production: { research: 0.2 },
        requireTech: 'writing'
    },
    temple: {
        name: '神殿',
        icon: '⛪',
        description: '自动生产信仰和文化 (+0.1/秒)',
        cost: { stone: 200, gold: 20, metal: 30 },
        production: { faith: 0.1, culture: 0.1 },
        requireTech: 'religion'
    },
    market: {
        name: '市场',
        icon: '🏪',
        description: '自动生产黄金 (+0.3/秒)，提升商人效率',
        cost: { wood: 100, stone: 50, gold: 10 },
        production: { gold: 0.3 },
        requireTech: 'currency'
    },
    academy: {
        name: '学院',
        icon: '🎓',
        description: '大幅提升科研点产出 (+0.5/秒)',
        cost: { wood: 300, stone: 200, metal: 50 },
        production: { research: 0.5 },
        requireTech: 'philosophy'
    }
};
