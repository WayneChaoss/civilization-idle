/**
 * 资源定义
 */
const ResourceDefinitions = {
    food: {
        name: '食物',
        icon: '🌾',
        initial: 100,
        max: 500,
        description: '维持人口生存的基本资源'
    },
    wood: {
        name: '木材',
        icon: '🪵',
        initial: 50,
        max: 500,
        description: '基础建筑材料'
    },
    stone: {
        name: '石料',
        icon: '🪨',
        initial: 0,
        max: 300,
        description: '高级建筑材料'
    },
    metal: {
        name: '金属',
        icon: '⚙️',
        initial: 0,
        max: 200,
        description: '工具和武器的材料'
    },
    gold: {
        name: '黄金',
        icon: '🪙',
        initial: 0,
        max: 1000,
        description: '贸易和高级建筑的货币'
    },
    research: {
        name: '科研点',
        icon: '🔬',
        initial: 0,
        max: Infinity,
        description: '用于研究科技'
    },
    culture: {
        name: '文化',
        icon: '🎭',
        initial: 0,
        max: Infinity,
        description: '影响幸福度和政策'
    },
    faith: {
        name: '信仰',
        icon: '⛪',
        initial: 0,
        max: Infinity,
        description: '解锁宗教相关建筑和政策'
    }
};

/**
 * 职业定义
 */
const JobDefinitions = {
    gatherer: {
        name: '采集者',
        icon: '🧺',
        description: '采集野果和木材 (+0.5 食物, +0.3 木材)',
        production: { food: 0.5, wood: 0.3 },
        consumption: {}
    },
    farmer: {
        name: '农民',
        icon: '👨‍🌾',
        description: '在农田耕作 (+1.2 食物)',
        production: { food: 1.2 },
        consumption: {}
    },
    lumberjack: {
        name: '伐木工',
        icon: '🪓',
        description: '砍伐树木 (+1.0 木材)',
        production: { wood: 1.0 },
        consumption: {}
    },
    miner: {
        name: '矿工',
        icon: '⛏️',
        description: '开采矿石 (+0.5 石料, +0.2 金属)',
        production: { stone: 0.5, metal: 0.2 },
        consumption: {}
    },
    scholar: {
        name: '学者',
        icon: '📚',
        description: '研究科技 (+0.3 科研点, 消耗 0.5 食物)',
        production: { research: 0.3 },
        consumption: { food: 0.5 }
    },
    artisan: {
        name: '工匠',
        icon: '🔨',
        description: '制作工具和工艺品 (+0.3 金属, +0.1 黄金)',
        production: { metal: 0.3, gold: 0.1 },
        consumption: { wood: 0.3, stone: 0.2 }
    },
    priest: {
        name: '祭司',
        icon: '🙏',
        description: '传播信仰 (+0.2 信仰, +0.1 文化)',
        production: { faith: 0.2, culture: 0.1 },
        consumption: { food: 0.3 }
    },
    merchant: {
        name: '商人',
        icon: '💰',
        description: '贸易获得黄金 (+0.5 黄金)',
        production: { gold: 0.5 },
        consumption: { food: 0.2 }
    }
};
