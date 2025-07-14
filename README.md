# smacdo.com

This is the code powering https://smacdo.com/, and represents my first attempt at doing web
programming since I graduated from college in the 2000s. I'm not familiar with Typescript, React or
really any part of the web frontend so feel free to send me any feedback about how it could be
better.

All changes to the master branch are built, tested and pushed
to [staging.smacdo.com](https://staging.smacdo.com).
A production push to [smacdo.com](https://smacdo.com) happens when a new `releases-v*` tag is
created on the master branch.

# References

Some links that helped while working on `smacdo.com`:

## Setup

- [React: Navigation Without React-Router](https://ncoughlin.com/posts/react-navigation-without-react-router)
- [Vite + React + Ts + vitest + React Testing Library boilerplate](https://www.reddit.com/r/reactjs/comments/1hkf4vf/vite_react_ts_vitest_react_testing_library/)

## Canvas

- [Canvas with React JS](https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258)
- [Creating a VAnilla JS Canvas](https://medium.com/@ruse.marshall/converting-a-vanilla-js-canvas-animation-to-react-78443bad6d7b)
- [Ensuring our Canvas Looks Good on Retina High DPI Screens](https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm)

## Infra

- [Deploying to a server via SSH and Rsync in a Github Action
  ](https://zellwk.com/blog/github-actions-deploy/)