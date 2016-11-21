const raf = require('raf')
const now = require('performance-now')

const loadImage = imagePath => new Promise(resolve => {
  const image = new Image()
  const onLoad = () => {
    image.removeEventListener('load', onLoad)
    resolve(image)
  }
  image.addEventListener('load', onLoad)
  image.src = imagePath
})

const startFpsControlledLoop = (callback, fps = 60) => {
  let startTime = null
  let lastFrame = -1

  const loop = () => {
    raf(loop)

    if (!startTime) {
      startTime = now()
    }

    const currentTime = now()
    const elapsedTime = currentTime - startTime
    const currentFrame = Math.floor(elapsedTime / (1000 / fps))

    if (lastFrame !== currentFrame) {
      callback()
      lastFrame = currentFrame
    }
  }

  raf(loop)
}

const lake = (imagePath, options = {}) => {
  const waves = options.waves || 10
  const speed = (options.speed || 1) / 4
  const scale = (options.scale || 1) / 2
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  let offset = 0
  let frame = 0
  let maxFrames = 0
  const frames = []

  loadImage(imagePath).then(image => {
    ctx.save()

    const width = canvas.width = image.width
    const height = canvas.height = image.height * 2

    ctx.drawImage(image, 0, 0)
    ctx.scale(1, -1)
    ctx.drawImage(image, 0, - image.height * 2)

    ctx.restore()

    const dw = width
    const dh = height / 2

    const id = ctx.getImageData(0, height / 2, width, height).data
    let isFinished = false

    ctx.save()

    while (!isFinished) {
      const odd = ctx.getImageData(0, height / 2, width, height)
      const od = odd.data
      let pixel = 0

      for (let y = 0; y < dh; y++) {
        for (let x = 0; x < dw; x++) {
          const displacement = (scale * 10 * (Math.sin((dh / (y / waves)) + (- offset)))) | 0
          let j = ((displacement + y) * width + x + displacement) * 4

          if (j < 0) {
            pixel += 4
            continue
          }

          const m = j % (width * 4)
          const n = scale * 10 * (y / waves)

          if (m < n || m > (width * 4) - n) {
            const sign = y < width / 2 ? 1 : -1
            od[pixel]   = od[pixel + 4 * sign]
            od[++pixel] = od[pixel + 4 * sign]
            od[++pixel] = od[pixel + 4 * sign]
            od[++pixel] = od[pixel + 4 * sign]
            pixel++
            continue
          }

          if (id[j + 3] !== 0) {
            od[pixel]   = id[j]
            od[++pixel] = id[++j]
            od[++pixel] = id[++j]
            od[++pixel] = id[++j]
            pixel++
          } else {
            od[pixel]   = od[pixel - width * 4]
            od[++pixel] = od[pixel - width * 4]
            od[++pixel] = od[pixel - width * 4]
            od[++pixel] = od[pixel - width * 4]
            pixel++
          }
        }
      }

      if (offset > speed * (6 / speed)) {
        offset = 0
        maxFrames = frame - 1
        frame = 0
        isFinished = true
      } else {
        offset += speed
        frame++
      }
      frames.push(odd)
    }

    ctx.restore()

    startFpsControlledLoop(() => {
      ctx.putImageData(frames[frame], 0, height / 2)

      if (frame < maxFrames) {
        frame++
      } else {
        frame = 0
      }
    }, 30)
  })

  return canvas
}

export default lake
