const glob = require("glob")
const path = require("path")
const chalk = require("chalk")


const sourceRoot = path.resolve(__dirname, "./template")

const patterns = {
    '1': {
        p: '/{*,*/*,!(a1)/!(a2)/**/*}.txt',
        t: '列出除了a2文件夹外的所有文件'
    },
    '2':  {
        p: '/{*,!(a1)/**/*}.txt',
        t: '列出除了a1文件夹外的所有文件'
    }
}
const runKey = [1]
for(const key in patterns) {
    if (!~runKey.indexOf(+key)) {
        continue
    }
    const item = patterns[key]
    console.log(chalk.magenta(`example: ${key}`), chalk.yellow(`${item.t}`))
    const pattern = path.join(sourceRoot, item.p)
    const fileList = glob.sync(pattern)
    console.log(chalk.cyan(pattern))
    console.log(fileList)
}

