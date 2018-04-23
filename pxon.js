onmessage = function (message) {
  var imageData = message.data.imageData.data
  var width = message.data.imageData.width
  var height = message.data.imageData.height
  var pixelSize = message.data.pixelSize

  const getPixelColor = function (data, x, y, width) {
    var red = data[(y * width * 4) + (x * 4)]
    var green = data[(y * width * 4) + (x * 4) + 1]
    var blue = data[(y * width * 4) + (x * 4) + 2]

    return `rgb(${red}, ${green}, ${blue})`
  }

  var pxon = {
    exif: {
      datetime : new Date()
    },
    pxif: {
      pixels: []
    }
  }

  for (let x = 0; x < width; x += pixelSize) {
    for (let y = 0; y < height; y += pixelSize) {
      var color = getPixelColor(imageData, x, y, width)

      pxon.pxif.pixels.push({
        x,
        y,
        color,
        size: pixelSize
      })
    }
  }
  postMessage({pxon})
}
