import "./style.css";

const canvas = document.querySelector("#game");

if (canvas == null) {
  throw new Error("could not find game canvas HTML element");
} else if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("expected game canvas HTML element to be HTMLCanvasElement");
}

const context = canvas.getContext("2d");

if (context == null) {
  throw new Error("could not get game canvas 2d context");
}

context.fillStyle = "pink";
context.fillRect(0, 0, canvas.width, canvas.height);
