(function(){
  // init
  const DOM = {
    pixelSizeInput: document.getElementById('pixel-size-input'),
    pseudoPixel: document.getElementById('pseudo-pixel'),
    pseudoPixelSize: document.getElementById('pseudo-pixel-size'),
    uploadImageInput: document.getElementById('image-input'),
    feedback: document.getElementById('feedback'),
    previewImage: document.getElementById('preview-image'),
    svgContainer: document.querySelector('svg'),
    svgFilter: document.getElementById('pixel-filter'),
    generatePxonButton: document.getElementById('generate-pxon'),
    copyPxonButton: document.getElementById('copy-pxon'),
    downloadPxonButton: document.getElementById('download-pxon')
  }

  const generatePXON = function (image) {
    // draw image on a canvas
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = image.width
    tempCanvas.height = image.height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.drawImage(image, 0, 0)

    // get image data from the canvas
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)

    var pxonWorker = new Worker('pxon.js')

    pxonWorker.onmessage = function (message) {
      localStorage.pxon = JSON.stringify(message.data.pxon)
      DOM.generatePxonButton.classList.add('hidden')
      DOM.generatePxonButton.innerText = 'Generate PXON'
      DOM.copyPxonButton.classList.remove('hidden')
      DOM.downloadPxonButton.classList.remove('hidden')
    }

    pxonWorker.postMessage({
      imageData,
      pixelSize: Number(DOM.pixelSizeInput.value)
    })
  }

  const pixelizePreviewImage = function () {
    var pixelSize = DOM.pixelSizeInput.value

    // just render the image without a filter
    if (pixelSize === "1") {
      DOM.previewImage.setAttribute('filter', '')
    } else {
      var flood = DOM.svgFilter.querySelector('feFlood')
      var composite = DOM.svgFilter.querySelector('feComposite')
      var morphology = DOM.svgFilter.querySelector('feMorphology')

      flood.setAttribute('x', pixelSize * .4)
      flood.setAttribute('y', pixelSize * .4)
      flood.setAttribute('width', pixelSize * .2)
      flood.setAttribute('height', pixelSize * .2)
      composite.setAttribute('width', pixelSize)
      composite.setAttribute('height', pixelSize)
      morphology.setAttribute('radius', pixelSize * .5)

      DOM.previewImage.setAttribute('filter', 'url(#pixel-filter)')
    }
  }

  const resetButtons = function () {
    DOM.generatePxonButton.innerText = 'Generate PXON'
    DOM.generatePxonButton.classList.remove('hidden')
    DOM.copyPxonButton.classList.add('hidden')
    DOM.downloadPxonButton.classList.add('hidden')
  }

  // event listeners
  document.addEventListener('copy', function (e) {
    e.preventDefault()
    e.clipboardData.setData('text/plain', localStorage.pxon)
  })

  DOM.generatePxonButton.onclick = function () {
    DOM.generatePxonButton.innerHTML = '<span>Generating PXON</span><span class="spinner"></span>'
    var imageFile = DOM.uploadImageInput.files[0]
    var img = new Image()

    img.onload = function () {
      generatePXON(img)
    }

    img.src = URL.createObjectURL(imageFile)
  }

  DOM.copyPxonButton.onclick = function () {
    document.execCommand('copy')
  }

  DOM.downloadPxonButton.onclick = function () {
    DOM.downloadPxonButton.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorage.pxon))
    DOM.downloadPxonButton.setAttribute('download', 'pxon.json')
  }

  DOM.pixelSizeInput.oninput = function (e) {
    DOM.pseudoPixel.style = `width: ${e.target.value}px; height: ${e.target.value}px`
    DOM.pseudoPixelSize.innerText = `${e.target.value}px`
    resetButtons()
    pixelizePreviewImage()
  }

  DOM.uploadImageInput.onchange = function () {
    var imageFile = DOM.uploadImageInput.files[0]
    var imageHref = URL.createObjectURL(imageFile)
    var img = new Image()
    img.src = imageHref

    img.onload = function () {
      DOM.svgContainer.setAttribute('width', img.naturalWidth)
      DOM.svgContainer.setAttribute('height', img.naturalHeight)
      DOM.previewImage.setAttribute('xlink:href', imageHref)
      DOM.pixelSizeInput.disabled = false
      resetButtons()
    }

    pixelizePreviewImage()
  }
})()