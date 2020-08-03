import './styles/main.sass'
import compose from './compose'
import dragndrop from './dragndrop'

const getData = async() => {
  const response = await fetch('https://api.jsonbin.io/b/5e6b40e207f1954acedf3427/1', {
    headers: {
      'Secret-key': '$2b$10$zeNmy2u803VjpcCj2JEa8uzC4t9YjXuLm3izVwWlCLigtPBES89dG'
    }
  })
  return await response.json()
}

const rack = {
  elem: document.getElementById('rack'),
  shelvs: {
    elem: document.getElementById('shelvs'),
    amount: 5,
    data: null
  }
}
const stateView = {
  elem: document.getElementById('state')
}

const createBlankShelvs = amount => {
  const shelvs = []
  for (let i = 0; i < amount; i++) {
    shelvs.push({
      shelfOrder: i,
      shelfId: Math.round(Math.random() * 100),
      products: []
    })
  }
  return shelvs
}

const mergeShelvs = createBlank => data => {
  const blankShelvs = createBlank(rack.shelvs.amount)
  return blankShelvs.map(shelf => {
    const found = data.find(elem => elem.shelfOrder === shelf.shelfOrder)
    return found ? found : shelf
  })

}

const merge = mergeShelvs(createBlankShelvs)

const createProduct = ({ productId, productOrder, productUrl }) => {
  const product = document.createElement('img')
  product.className = 'product-image'
  product.src = productUrl
  product.alt = `product-${productId}`
  product.setAttribute('data-id', productId)
  product.setAttribute('data-order', productOrder)
  product.setAttribute('data-droppable', true)
  product.setAttribute('data-role', 'product')
  return product
}

const createShelf = ({ shelfId, shelfOrder, products }) => {
  const shelf = document.createElement('div')
  shelf.className = 'shelf'
  shelf.setAttribute('data-id', shelfId)
  shelf.setAttribute('data-order', shelfOrder)
  shelf.setAttribute('data-droppable', true)
  shelf.setAttribute('data-role', 'shelf')
  shelf.id = 'shelf'
  const order = document.createElement('span')
  order.className = 'shelf-order'
  order.textContent = shelfOrder
  shelf.append(order)
  products.forEach(product => shelf.append(createProduct(product)))
  return shelf
}

const createShelvs = shelvs => shelvs.map(createShelf)

const createSeparator = () => {
  const hr = document.createElement('hr')
  hr.className = 'separator'
  return hr
}

const renderShelvs = shelvs => {
  while (rack.shelvs.elem.firstChild) {
    rack.shelvs.elem.firstChild.remove()
  }
  shelvs.forEach(shelf => {
    rack.shelvs.elem.append(shelf)
    rack.shelvs.elem.append(createSeparator())
  })
}

const sortData = data => {
  data.forEach(shelf => {
    shelf.products.sort((a, b) => a.productOrder - b.productOrder)
  })
  data.sort((a, b) => b.shelfOrder - a.shelfOrder)
  return data
}

const renderState = data => {
  stateView.elem.textContent = JSON.stringify(data, null, 2)
  return data
}

const changePlace = ({ drop: from, below: to }) => {
  const state = rack.shelvs.data

  const recalculateProducts = products => {
    products.forEach((item, index) => {
      item.productOrder = index + 1
    })
  }

  const remove = () => {
    from.elem.remove()
    const shelf = state.find(elem => elem.shelfOrder === from.shelf.order)
    const { products } = shelf
    const index = products.findIndex(elem => elem.productOrder === from.order)
    const product = {...products[index] }
    products.splice(index, 1)
    if (from.shelf.order !== to.shelf.order) {
      recalculateProducts(products)
    }
    return product
  }

  const append = product => {
    const shelf = state.find(elem => elem.shelfOrder === to.shelf.order)
    const { products } = shelf

    if (to.isShelf) {
      product.productOrder = products.length + 1
      products.push(product)
      return
    }

    const index = products.findIndex(elem => elem.productOrder === to.order)
    product.productOrder = index + 1
    products.splice(index, 0, product)
    recalculateProducts(products)
  }

  const product = remove()
  append(product)

  renderData(rack.shelvs.data)
}

const save = data => {
  localStorage.setItem('state', JSON.stringify(data))
  return data
}

const renderData = compose(
  sortData,
  save,
  renderState,
  createShelvs,
  renderShelvs
)

const start = async() => {
  const data = JSON.parse(localStorage.getItem('state')) || await getData()
  rack.shelvs.data = merge(data)
  renderData(rack.shelvs.data)
}

start()
dragndrop({
  rack,
  changePlace
})