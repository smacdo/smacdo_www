# TODO

- Add linter rule to break lines longer than 100 characters.
- Resize the canvas and game when the window changes dimensions.
- A game should declare its target dimensions (width, height), aspect ratio requirements (lock to
  vertical, horizontal, or none), and then the engine will handle implementation.
    - Engine will render at a multiple of the desired dimension (1x, 2x etc. scale)
    - If current dimensions in between two multiples, engine will render at higher multiple and then
      downscale to fit.
        - Consider applying this if current dims >~ 20% or so to avoid fuzziness.
    - Engine will add border padding as needed when scaling.
    - UI can be rendered at native resolution if game desires
        - Provide `onDrawUI` which draws directly to canvas at DPR adjusted dims

## Viewport

- Add option to use canvas width or height when determining output size.

## Debug Mode

- When the canvas is resized, draw the new size briefly in the window corner.

## Debug Menu

- Viewport
    - Physical size: $width x $height
    - Render size: $width x $height
    - Output size: $width x $height
    - Render aspect ratio: $ratio
    - Device Pixel Ratio: $dpr
    - <button: Show physical, render and output regions>