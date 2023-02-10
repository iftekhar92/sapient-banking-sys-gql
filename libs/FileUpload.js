const base64Img = require('base64-img')
const isBase64 = require('is-base64')
const randomstring = require('randomstring')

module.exports = {
    upload(base64) {
        return new Promise((resolve) => {
            if (isBase64(base64, { mimeRequired: true })) {
                const filePath = base64Img.imgSync(
                    base64,
                    'public/images/editor',
                    randomstring.generate(5).toLowerCase()
                )
                const opsys = process.platform
                const arrData = filePath.split(
                    opsys == 'win32' || opsys == 'win64' ? '\\' : '/'
                )
                return resolve({
                    src: arrData.length ? arrData[arrData.length - 1] : '',
                })
            } else {
                return resolve({ src: '' })
            }
        })
    },
    uploadImage(src, destination, name) {
        return new Promise((resolve) => {
            try {
                let filepath = base64Img.imgSync(src, destination, name)
                const relativePath = filepath
                filepath = filepath.replace(/\\/g, '/').split('/')
                return resolve({
                    filename: filepath[filepath.length - 1],
                    filepath: relativePath,
                })
            } catch (ex) {
                return resolve({ filename: '', filepath: '' })
            }
        })
    },
}
