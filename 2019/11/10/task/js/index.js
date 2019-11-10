
// 获取插空数值
const getInsertValue = (arr = []) => {
    const set = new Set(arr)
    arr = Array.from(set)
    arr = arr.map(itm => + itm)
    arr = arr.sort((a, b) => {
        return a - b
    })
    if (!arr.length) {
        return 1
    }
    if (arr[0] !== 1) {
        return 1
    }
    let result
    for (let [index, value] of arr.entries()) {
        if (arr[index + 1] - value !== 1) {
            result = value + 1
            break
        }
    }
    return result
}
const getStorageKeys = () => {
    const res = []
    for (let i = 0, l = localStorage.length; i < l; i++){
        const key = localStorage.key(i)
        if(/^task--\d+$/.test(key)) {
            res.push(key.match(/^task--(\d+)$/)[1])
        }
    }
    return res
}
const getTargetKeyword = (text = '') => {
    const arr = text.match(/(function\s+?(.+?)\()|(console\.\w+?\(\s*['"](.*?)['"]\s*\))/) || []
    return arr[2] || arr[4]
}
window.ln = new Vue({
    el: '#app',
    data: {
        tasks: [],
        editTasks: [{
            tasks: [],
            jobs: [],
            jsStack: [],
            log: []
        }],
        addTasks: [{
            tasks: [],
            jobs: [],
            jsStack: [],
            log: []
        }],
        index: 0,
        editIndex: 0,
        addIndex: 0,
        addCode: '',
        editCode: '',
        code: ``,
        edit: false,
        // 编辑输入框
        inputVisibletasks: false,
        inputValuetasks: '',
        inputVisiblejobs: false,
        inputValuejobs: '',
        inputVisiblejsStack: false,
        inputValuejsStack: '',
        inputVisiblelog: false,
        inputValuelog: '',
        // 记录
        storages: [],
        storageIndex: 0
    },
    computed: {
        current() {
            if(!this.edit) {
                return this.tasks[this.index] || []
            } else {
                if(this.isAddStyle) {
                    return this.addTasks[this.addIndex] || []
                } else {
                    return this.editTasks[this.editIndex] || []
                }
            }
        },
        setpNum() {
            if(this.edit) {
                if(this.isAddStyle) {
                    return this.addIndex
                } else {
                    return this.editIndex
                }
            } else {
                return this.index
            }
        },
        totalSetpNum() {
            if(this.edit) {
                if(this.isAddStyle) {
                    return this.addTasks.length
                } else {
                    return this.editTasks.length
                }
            } else {
                return (this.tasks || []).length
            }
        },
        isAddStyle() {
            return this.storageIndex == null
        },
        codeFormat() {
            let code
            if(this.edit) {
                if(this.isAddStyle) {
                    code = 'addCode'
                } else {
                    code = 'editCode'
                }
            } else {
                code = 'code'
            }
            const codeArr = this[code].split('\n')
            return codeArr
        }
    },
    watch: {
        edit(nVal) {
            // if (nVal) {
            //     const {
            //         editTasks
            //     } = this
            //     const lastItm = editTasks[editTasks.length - 1]
            //     if (lastItm.id) {
            //         document.getElementById(lastItm.id).scrollIntoView()
            //     }
            // } else {
                
            // }
        }
    },
    created() {
        this.init()
        this.$watch('storageIndex', (nVal) => {
            if(nVal == null) {
                return
            }
            if(!this.storages.length) {
                return
            }
            const { tasks, code } = this.storages[nVal]
            this.tasks = _.merge({}, tasks)
            this.code = code
            this.editTasks = _.merge({}, tasks)
            this.editCode = code
        }, {
            immediate: true
        })
    },
    mounted() {
        this.$watch('current.id', (nVal, oVal) => {
            if (nVal != null && oVal) {
                document.getElementById(nVal).scrollIntoView()
            }
        })
    },
    methods: {
        init(newKey) {
            const res = []
            let storageIndex
            for (let i = 0, l = localStorage.length; i < l; i++){
                const key = localStorage.key(i)
                if(/^task--\d+$/.test(key)) {
                    res.push(JSON.parse(localStorage.getItem(key)))
                    if(newKey && newKey === key) {
                        storageIndex = i
                    }
                }
            }
            this.storages = res
            if(storageIndex != null) {
                this.storageIndex = storageIndex
            }
        },
        onPre() {
            if (this.edit) {
                const indexName = [this.isAddStyle ? 'addIndex' : 'editIndex']
                if (this[indexName]) {
                    this[indexName]--
                }
            } else {
                if (this.index === 0) {
                    this.index = this.tasks.length - 1
                } else {
                    this.index--
                }
                const target = this.tasks[this.index]
                if(target.toast) {
                    this.$message({
                        message: target.toast,
                        type: 'warning'
                    })
                }
            }
        },
        onNext() {
            if (this.edit) {
                const taskName = [this.isAddStyle ? 'addTasks' : 'editTasks']
                const indexName = [this.isAddStyle ? 'addIndex' : 'editIndex']
                if (this[indexName] === this[taskName].length - 1) {
                    this[taskName].push(_.merge({}, this[taskName][this[indexName]], {
                        id: null
                    }))
                }
                this[indexName]++
            } else {
                if (this.index === this.tasks.length - 1) {
                    this.index = 0
                } else {
                    this.index++
                }
                const target = this.tasks[this.index]
                if(target.toast) {
                    this.$message({
                        message: target.toast,
                        type: 'warning'
                    })
                }
            }
        },
        onClickCode(id) {
            if (!this.edit) {
                return
            }
            const taskName = [this.isAddStyle ? 'addTasks' : 'editTasks']
            const indexName = [this.isAddStyle ? 'addIndex' : 'editIndex']
            const target = this[taskName][this[indexName]]
            if (target.id !== undefined) {
                target.id = id
            }
        },
        onCloseInfoTag(type, i) {
            const taskName = [this.isAddStyle ? 'addTasks' : 'editTasks']
            const indexName = [this.isAddStyle ? 'addIndex' : 'editIndex']
            const target = this[taskName][this[indexName]]
            target[type].splice(i, 1)
        },
        handleInputConfirm(type) {
            let inputValue = this[`inputValue${type}`]
            if (inputValue) {
                const taskName = [this.isAddStyle ? 'addTasks' : 'editTasks']
                const indexName = [this.isAddStyle ? 'addIndex' : 'editIndex']
                const target = this[taskName][this[indexName]]
                target[type].push(inputValue)
            }
            this[`inputVisible${type}`] = false
            this[`inputValue${type}`] = ''
        },
        showInput(type) {
            this[`inputVisible${type}`] = true
            const id = this.current.id
            if(id) {
                this[`inputValue${type}`] = getTargetKeyword(document.getElementById(id).textContent) || 'script'
            }
            this.$nextTick(_ => {
                this.$refs[`saveTagInput${type}`].$refs.input.focus();
            })
        },
        onSelectStorage(i) {
            this.storageIndex = i
        },
        onCloseStorage(key) {
            localStorage.removeItem(key)
            this.init()
            this.storageIndex = 0
        },
        addNewStorage() {
            this.code = ''
            this.tasks = []
            this.edit = true
            this.storageIndex = null
        },
        saveStorage() {
            if(this.isAddStyle) {
                const keys = getStorageKeys()
                const key = `task--${getInsertValue(keys)}`
                localStorage.setItem(key, JSON.stringify({
                    key,
                    tasks: this.addTasks,
                    code: this.addCode
                }))
                this.init(key)
            } else {
                const key = this.storages[this.storageIndex].key
                localStorage.setItem(key, JSON.stringify({
                    key,
                    tasks: this.editTasks,
                    code: this.editCode
                }))
                this.init(key)
            }
            this.edit = false
        }
    }
})