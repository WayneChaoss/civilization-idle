/**
 * 存档系统 - 支持 localStorage 和导入/导出
 */
const SaveManager = {
    SAVE_KEY: 'civilization_idle_save',
    VERSION: '1.0.0',

    // 保存游戏
    save(game) {
        const saveData = {
            version: this.VERSION,
            timestamp: Date.now(),
            state: game.state
        };

        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            game.state.lastSave = Date.now();
            console.log('游戏已保存');
        } catch (e) {
            console.error('保存失败:', e);
            alert('保存失败，可能是存储空间不足');
        }
    },

    // 加载游戏
    load(game) {
        try {
            const saveData = localStorage.getItem(this.SAVE_KEY);
            if (saveData) {
                const parsed = JSON.parse(saveData);
                
                // 版本检查
                if (parsed.version !== this.VERSION) {
                    console.log(`存档版本 ${parsed.version} 与当前版本 ${this.VERSION} 不同`);
                    // 这里可以添加版本迁移逻辑
                }

                // 恢复状态
                if (parsed.state) {
                    game.state = this.mergeState(game.state, parsed.state);
                    console.log('存档已加载');
                }
            }
        } catch (e) {
            console.error('加载失败:', e);
        }
    },

    // 合并存档状态（处理新增字段）
    mergeState(defaultState, savedState) {
        // 创建默认状态的深拷贝
        const merged = JSON.parse(JSON.stringify(defaultState));
        
        // 遍历保存的状态，覆盖默认值
        for (let key in savedState) {
            if (savedState[key] !== null && typeof savedState[key] === 'object' && !Array.isArray(savedState[key])) {
                // 递归合并对象
                merged[key] = this.mergeState(merged[key] || {}, savedState[key]);
            } else {
                // 直接覆盖值（包括数组）
                merged[key] = savedState[key];
            }
        }
        
        return merged;
    },

    // 导出存档（生成可复制/保存的字符串）
    exportSave(game) {
        const saveData = {
            version: this.VERSION,
            timestamp: Date.now(),
            state: game.state
        };

        const saveString = btoa(JSON.stringify(saveData));
        
        // 复制到剪贴板
        navigator.clipboard.writeText(saveString).then(() => {
            alert('存档已复制到剪贴板！请妥善保存这段文本。');
        }).catch(() => {
            // 如果复制失败，显示对话框让用户手动复制
            prompt('请复制以下存档代码（Ctrl+C）：', saveString);
        });
    },

    // 导入存档
    importSave(game) {
        const saveString = prompt('请输入存档代码：');
        if (!saveString) return;

        try {
            const saveData = JSON.parse(atob(saveString));
            
            if (confirm(`确定要加载存档吗？\n存档时间: ${new Date(saveData.timestamp).toLocaleString()}\n这将覆盖当前进度！`)) {
                game.state = this.mergeState(game.state, saveData.state);
                game.render();
                this.save(game);
                alert('存档加载成功！');
            }
        } catch (e) {
            alert('存档代码无效，请检查后重试。');
            console.error('导入失败:', e);
        }
    },

    // 清除存档
    clear() {
        localStorage.removeItem(this.SAVE_KEY);
    },

    // 检查是否有存档
    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
};
