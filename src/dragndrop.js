const dragndrop = options => {

  const { rack, changePlace } = options

  const getInfo = elem => ({
    elem,
    before: elem.previousElementSibling,
    isShelf: elem === elem.closest('#shelf'),
    id: +elem.dataset.id,
    order: +elem.dataset.order,
    shelf: {
      elem: elem.closest('#shelf'),
      id: +elem.closest('#shelf').dataset.id,
      order: +elem.closest('#shelf').dataset.order
    }
  })

  const extract = elem => {
    const { width, height } = getComputedStyle(elem)
    elem.style.position = 'absolute'
    elem.style.zIndex = 10
    elem.style.width = width
    elem.style.height = height
    document.body.append(elem)
  }

  const cancelMove = (drop) => {
    drop.before.after(drop.elem)
    drop.elem.style = ''
  }

  rack.elem.onmousedown = event => {
    event.target.ondragstart = () => false
    const drop = event.target.closest('.product-image')
    if (!drop) return
    let info = { drop: getInfo(drop) }
    const shiftX = event.clientX - drop.getBoundingClientRect().left
    const shiftY = event.clientY - drop.getBoundingClientRect().top

    extract(drop)
    move(event.pageX, event.pageY)
    drop.classList.add('grab')

    function move(x, y) {
      drop.style.left = x - shiftX + 'px'
      drop.style.top = y - shiftY + 'px'
    }

    let current = null
    let below = null

    const onMouseMove = event => {
      move(event.pageX, event.pageY)
      drop.style.display = 'none'
      const under = document.elementFromPoint(event.clientX, event.clientY)
      drop.style.display = 'block'

      if (!under) {
        cancelMove(info.drop)
        document.removeEventListener('mousemove', onMouseMove)
        drop.onmouseup = null
        drop.classList.remove('grab')
      }

      if (under && under.dataset.droppable) {
        below = under
      } else {
        below = null
      }

      if (current !== below) {
        if (current) { leave(getInfo(current)) }
        current = below
        if (current) { enter(getInfo(current)) }
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    drop.onmouseup = () => {

      if (below) {
        info = {...info, below: getInfo(below) }
        changePlace(info)
      } else {
        cancelMove(info.drop)
      }

      document.removeEventListener('mousemove', onMouseMove)
      drop.onmouseup = null
    }
  }
}

function enter(info) {
  info.elem.classList.add('drop')
}

function leave(info) {
  info.elem.classList.remove('drop')
}

export default dragndrop