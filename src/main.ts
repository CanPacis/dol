import "./style.css";

interface Vector {
  x: number;
  y: number;
}

interface Scene {
  context: CanvasRenderingContext2D;
  renderGuides: () => void;
}

function line(context: CanvasRenderingContext2D, from: Vector, to: Vector) {
  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();
}

function transformToEvenNumber(number: number) {
  return number % 2 === 0 ? number : number - 1;
}

function createScene(scale: Vector): Scene {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.querySelector("#app")!.appendChild(canvas);

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const renderGuides = () => {
    context.save();
    context.strokeStyle = "#3e3e3e";

    for (let i = 0; i < scale.x; i++) {
      line(
        context,
        { x: (i * canvas.width) / scale.x, y: 0 },
        { x: (i * canvas.width) / scale.x, y: canvas.height }
      );
    }

    for (let i = 0; i < scale.y; i++) {
      line(
        context,
        { x: 0, y: (i * canvas.height) / scale.y },
        { x: canvas.width, y: (i * canvas.height) / scale.y }
      );
    }

    context.strokeStyle = "rgba(255, 255, 255, .8)";

    // Horizontal center line
    line(
      context,
      { x: 0, y: canvas.height / 2 },
      { x: canvas.width, y: canvas.height / 2 }
    );

    // Vertical center line
    line(
      context,
      { x: canvas.width / 2, y: 0 },
      { x: canvas.width / 2, y: canvas.height }
    );

    context.restore();
  };

  return { context, renderGuides };
}

interface SliderController {
  value: number;
}

function createSlider(min: number = 1, max: number = 20): SliderController {
  const slider = document.createElement("input");
  slider.type = "range";
  slider.value = min.toString();
  slider.min = min.toString();
  slider.max = max.toString();

  document.querySelector(".slider-container")!.appendChild(slider);

  return {
    get value() {
      return parseInt(slider.value);
    },
  };
}

const xScale = transformToEvenNumber(Math.floor(window.innerWidth / 50));
const yScale = transformToEvenNumber(Math.floor(window.innerHeight / 50));

const { context, renderGuides } = createScene({
  x: xScale,
  y: yScale,
});

const stepSlider = createSlider(1, 20);
const toleranceSlider = createSlider(100, 1000);

function pointToCoordiateFactory() {
  const xLineCount = xScale / 2 - 1;
  const yLineCount = yScale / 2 - 1;
  const xCenter = Math.floor(context.canvas.width / 2);
  const yCenter = Math.floor(context.canvas.height / 2);

  return (point: Vector): Vector => {
    const xCoordinate = (xLineCount * (point.x - xCenter)) / xCenter;
    const yCoordinate = -(yLineCount * (point.y - yCenter)) / yCenter;

    return { x: xCoordinate, y: yCoordinate };
  };
}

function renderEquation(
  context: CanvasRenderingContext2D,
  equation: (coordinates: Vector) => boolean
) {
  const width = context.canvas.width;
  const height = context.canvas.height;
  const pointToCoordinates = pointToCoordiateFactory();
  const stepSize = stepSlider.value;

  for (let x = 0; x < width; x += stepSize) {
    for (let y = 0; y < height; y += stepSize) {
      const result = equation(pointToCoordinates({ x, y }));

      if (result) {
        context.fillStyle = "red";
        context.fillRect(x, y, 2, 2);
      }
    }
  }
}

// function equalsTo(a: number, b: number, tolarance?: number) {
//   let _tolarance = tolarance || toleranceSlider.value / 10000;
//   return Math.abs(a - b) <= _tolarance;
// }

const heartEquation = ({ x, y }: Vector) => {
  // (x^2 + y^2 - 1) ^ 3 - x^2 * y^3 = 0
  const leftSide = Math.pow(x, 2) + Math.pow(y, 2) - 1;
  const rightSide = Math.pow(x, 2) * Math.pow(y, 3);
  const equation = Math.pow(leftSide, 3) - rightSide;

  return equation <= 0;
};

// const linearEquation = ({ x, y }: Vector) => {
//   return equalsTo(y, x);
// };

// const quadraticEquation = ({ x, y }: Vector) => {
//   return equalsTo(y, Math.pow(x, 2));
// };

function render() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  renderGuides();
  renderEquation(context, heartEquation);
  // renderEquation(context, linearEquation);
  // renderEquation(context, quadraticEquation);

  requestAnimationFrame(render);
}

render();
