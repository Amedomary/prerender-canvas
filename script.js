"use strict";

// stats
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = "absolute";
stats.domElement.style.left = "0px";
stats.domElement.style.top = "0px";
document.body.appendChild(stats.domElement);

const image = document.createElement("img");
image.src = image64;

const getImageData = function(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);

  return ctx.getImageData(0, 0, image.width, image.height);
};

setTimeout(() => {
  const imagedata = getImageData(image);
  const canvas = document.getElementById("amedomary");
  canvas.width = innerWidth - 20;
  canvas.height = innerHeight - 20;
  const ctx = canvas.getContext("2d");

  // Prerender canvas
  const canvasPrerender = document.createElement("canvas");
  canvasPrerender.width = canvas.width;
  canvasPrerender.height = canvas.height;
  const ctxPrerender = canvasPrerender.getContext("2d");

  const paddingTop = canvas.width / 2 - image.width / 2;
  const paddingLeft = canvas.height / 2 - image.height / 2;
  const centerW = canvas.width / 2;

  const mash = [];
  let doneDots = 0;
  const dotSize = 4;
  const imgStep = dotSize;
  const speed = {
    down: 4,
    top: 6
  };

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getAngle(x1, y1, x2, y2) {
    const a = y1 - y2;
    const b = x1 - x2;
    const c = Math.sqrt(a ** 2 + b ** 2);
    const cos = a / c;
    const sin = b / c;

    return { cos, sin };
  }

  class Dot {
    constructor(x, y, color) {
      this._x = x + paddingTop;
      this._y = y + paddingLeft;

      this.x = getRandomArbitrary(0, canvas.width);
      this._dx2 = Math.abs(centerW - this.x) ** 2;
      this._radius2 = (canvas.width / 2) ** 2;
      this._dy = Math.sqrt(this._radius2 - this._dx2);
      this.y = getRandomArbitrary(0, canvas.height);

      this._color = color;
      this.color = color;
      this.state = "passive";
      this.d = 0;
      this.v = getRandomArbitrary(speed.down, speed.top);
      this.move = true;
      this.angle = getAngle(this.x, this.y, this._x, this._y);
    }

    checkPosition() {
      if (this.move) {
        let newX;
        let newY;
        const xIsOnPosition = Math.abs(this.x - this._x) < speed.top + 1;
        const yIsOnPosition = Math.abs(this.y - this._y) < speed.top + 1;

        if (xIsOnPosition && yIsOnPosition) {
          newX = this._x;
          newY = this._y;
          this.move = false;
          doneDots = doneDots + 1;

          ctxPrerender.fillStyle = this.color;
          ctxPrerender.fillRect(newX, newY, dotSize, dotSize);
        } else {
          newX = this.x - this.v * this.angle.sin;
          newY = this.y - this.v * this.angle.cos;
        }

        this.x = Math.fround(newX);
        this.y = Math.fround(newY);
      }
    }

    reDraw() {
      ctxPrerender.fillStyle = this.color;
      ctxPrerender.fillRect(this.x, this.y, dotSize, dotSize);
    }
  }

  function getPixel(imagedata, x, y) {
    const position = (x + imagedata.width * y) * 4;
    const data = imagedata.data;
    return {
      r: data[position],
      g: data[position + 1],
      b: data[position + 2],
      a: data[position + 3]
    };
  }

  function createDataMash() {
    for (let y = 0, y2 = imagedata.height; y < y2; y += imgStep) {
      for (let x = 0, x2 = imagedata.width; x < x2; x += imgStep) {
        const pixelColor = getPixel(imagedata, x, y);
        const color =
          "rgb(" +
          pixelColor.r +
          ", " +
          pixelColor.g +
          ", " +
          pixelColor.b +
          ")";

        if (pixelColor.r == 255 && pixelColor.g == 255 && pixelColor.b == 255) {
        } else {
          mash.push(new Dot(x, y, color));
        }
      }
    }
    requestAnimationFrame(renderLoop);
  }

  function reDrawDots() {
    for (let i in mash) {
      mash[i].reDraw();
    }
  }

  function reCalculateDot(params) {
    for (let i in mash) {
      mash[i].checkPosition();
    }
  }

  function draw() {
    ctxPrerender.clearRect(0, 0, canvas.width, canvas.height);
    reDrawDots();
  }

  const prerenderArr = [];

  function renderLoop() {
    stats.begin();

    reCalculateDot();
    draw();

    if (true) {
      let blob;
      canvasPrerender.toBlob(e => {
        blob = e;

        const reader = new FileReader();
        reader.readAsDataURL(blob); // конвертирует Blob в base64 и вызывает onload

        reader.onload = function() {
          const image = document.createElement("img");
          image.src = reader.result;
          prerenderArr.push(image);
        };
      });
    }

    stats.end();
    if (doneDots !== mash.length) {
      requestAnimationFrame(renderLoop);
    } else {
      console.log("finally");
      requestAnimationFrame(drawPreImg);
    }
  }

  let i = 0;
  function drawPreImg() {
    stats.begin();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(prerenderArr[i], 0, 0);
    i = i + 1;

    if (i < prerenderArr.length) {
      stats.end();
      requestAnimationFrame(drawPreImg);
    }
  }

  createDataMash();
}, 300);
