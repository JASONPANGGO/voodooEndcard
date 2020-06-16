const fetch = require('node-fetch')
const fs = require('fs')
const localURL = "./voodoo/voodoo.html"
const base64reg = /"data:video\/mp4;.*/g
const base64holder = "___BASE64___"
const voodooURL = process.argv[2]

async function getBase64(url) {
    console.log('正在解析地址');
    const res = await fetch(url)
    const html = await res.text()

    const base64 = html.match(base64reg)
    if (base64.length && base64.length === 1) return base64.join()
    else throw new Error('有多处base64，请手动判断')
}

async function run(url) {
    const base64 = await getBase64(url)
    console.log('base64获取成功');
    let html = fs.readFileSync(localURL).toString()
    fs.writeFileSync(localURL, html.replace(base64holder, base64))
    console.log('完成');
}
run(voodooURL)