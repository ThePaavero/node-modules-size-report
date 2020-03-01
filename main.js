const execSync = require('child_process').execSync
const getSize = require('get-folder-size')
const {table} = require('table')
const _ = require('lodash')
require('colors')


const rootPath = process.argv[2] ? process.argv[2] : '/mnt/c/projects'

const modulesDirList = execSync('find ' + rootPath + ' -maxdepth 2 -mindepth 1 | grep node_modules').toString().split('\n')

console.log(`Finding node_modules dirs and calculating their size...`.green)
console.log('This might take a while...'.white)

const getDirsWithSizes = async () => {
  let processedCount = 0
  const data = []
  return new Promise((resolve, reject) => {
    modulesDirList.forEach(dir => {
      if (dir === '') {
        processedCount++
        return
      }
      const humanString = dir.replace(rootPath, '')
      getSize(dir, (err, size) => {
        if (err) {
          throw err
        }
        const sizeAsFloat = (size / 1024 / 1024).toFixed(2)
        processedCount++
        process.stdout.write(`\x1Bc\r${`${processedCount}/${modulesDirList.length}`.gray}`)
        data.push({
          dir,
          humanString,
          sizeAsFloat: parseFloat(sizeAsFloat),
        })
        if (processedCount === modulesDirList.length) {
          resolve(data)
        }
      })
    })
  })
}

const getSizeColor = (size) => {
  if (size < 1) {
    return 'green'
  } else if (size < 10) {
    return 'white'
  } else if (size < 50) {
    return 'yellow'
  } else {
    return 'red'
  }
}

getDirsWithSizes().then(data => {
  const output = []
  data = _.orderBy(data, 'sizeAsFloat', 'desc')
  data.forEach(dirObject => {
    const sizeColor = getSizeColor(dirObject.sizeAsFloat)
    const bits = dirObject.humanString.split('/')
    const formattedDirString = (bits[0].white) + (bits[1].gray)
    const tableObject = [formattedDirString, (dirObject.sizeAsFloat + ' MB')[sizeColor]]
    output.push(tableObject)
  })
  console.log('\n')
  console.log(' RESULTS '.bgGreen.black)
  console.log(table(output))
})
