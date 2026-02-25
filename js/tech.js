/**
 * 科技树定义
 */
const TechDefinitions = {
    // 石器时代
    tools: {
        name: '工具制作',
        icon: '🔨',
        description: '制作更好的工具，提升木材和石料产量20%',
        cost: { research: 20 },
        requires: [],
        startUnlocked: true
    },
    fire: {
        name: '生火',
        icon: '🔥',
        description: '掌握火焰，提升幸福度10%',
        cost: { research: 30 },
        requires: [],
        startUnlocked: true
    },

    // 农业时代
    agriculture: {
        name: '农业',
        icon: '🌾',
        description: '解锁农场建筑，食物产量+30%',
        cost: { research: 50 },
        requires: ['tools'],
        startUnlocked: false
    },
    construction: {
        name: '建筑学',
        icon: '🏗️',
        description: '解锁茅屋和仓库',
        cost: { research: 80 },
        requires: ['tools'],
        startUnlocked: false
    },

    // 铜器/石器时代
    mining: {
        name: '采矿',
        icon: '⛏️',
        description: '解锁矿工职业、采石场和矿井',
        cost: { research: 100 },
        requires: ['tools'],
        startUnlocked: false
    },
    masonry: {
        name: '石工',
        icon: '🧱',
        description: '解锁房屋建筑',
        cost: { research: 120 },
        requires: ['construction', 'mining'],
        startUnlocked: false
    },

    // 文明初期
    writing: {
        name: '文字',
        icon: '📜',
        description: '解锁图书馆，科研速度+20%',
        cost: { research: 200 },
        requires: ['agriculture'],
        startUnlocked: false
    },
    religion: {
        name: '宗教',
        icon: '✝️',
        description: '解锁神殿和祭司职业',
        cost: { research: 150, faith: 50 },
        requires: ['construction'],
        startUnlocked: false
    },
    currency: {
        name: '货币',
        icon: '🪙',
        description: '解锁市场和商人职业',
        cost: { research: 180 },
        requires: ['mining'],
        startUnlocked: false
    },

    // 古典时代
    philosophy: {
        name: '哲学',
        icon: '🤔',
        description: '解锁学院，大幅提升科研',
        cost: { research: 500 },
        requires: ['writing'],
        startUnlocked: false
    },
    engineering: {
        name: '工程学',
        icon: '⚙️',
        description: '所有建筑生产效率+20%',
        cost: { research: 400 },
        requires: ['masonry', 'mining'],
        startUnlocked: false
    },
    trade: {
        name: '贸易',
        icon: '🚢',
        description: '商人效率翻倍，探索获得更多资源',
        cost: { research: 350 },
        requires: ['currency'],
        startUnlocked: false
    }
};
