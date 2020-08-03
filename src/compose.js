const compose = (...fns) => {
  return (arg) => {
    fns.reduce((composed, f) => {
      return f(composed)
    }, arg)
  }
}

export default compose