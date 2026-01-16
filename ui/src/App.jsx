import { useState } from 'react'
import './App.css'

// 임시 메뉴 데이터
const menuItems = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '간단한 설명...',
    image: '/images/americano-ice.jpg'
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '간단한 설명...',
    image: '/images/americano-hot.jpg'
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '간단한 설명...',
    image: '/images/caffe-latte.jpg'
  }
]

function App() {
  const [cart, setCart] = useState([])

  const addToCart = (item, options) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        cartItem => 
          cartItem.menuItem.id === item.id &&
          cartItem.options.shot === options.shot &&
          cartItem.options.syrup === options.syrup
      )

      if (existingItem) {
        // 같은 메뉴와 옵션 조합이 있으면 수량만 증가
        return prevCart.map(cartItem =>
          cartItem.id === existingItem.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        // 새로운 항목 추가
        const cartItem = {
          id: `${item.id}-${options.shot ? 'shot' : ''}-${options.syrup ? 'syrup' : ''}`,
          menuItem: item,
          options: { ...options },
          quantity: 1
        }
        return [...prevCart, cartItem]
      }
    })
  }

  const calculateItemPrice = (cartItem) => {
    let price = cartItem.menuItem.price
    if (cartItem.options.shot) price += 500
    if (cartItem.options.syrup) price += 0
    return price * cartItem.quantity
  }

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + calculateItemPrice(item), 0)
  }

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR')
  }

  const handleOrder = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }
    // TODO: 주문 API 호출
    alert('주문이 완료되었습니다!')
    setCart([])
  }

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="header">
        <div className="logo">COZY</div>
        <nav className="nav">
          <button className="nav-button active">주문하기</button>
          <button className="nav-button">관리자</button>
        </nav>
      </header>

      {/* 메뉴 영역 */}
      <main className="main-content">
        <div className="menu-grid">
          {menuItems.map(item => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              onAddToCart={addToCart} 
            />
          ))}
        </div>
      </main>

      {/* 장바구니 */}
      <div className="cart">
        <h2 className="cart-title">장바구니</h2>
        <div className="cart-content">
          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="cart-empty">장바구니가 비어있습니다.</p>
            ) : (
              cart.map(cartItem => {
                const optionsText = []
                if (cartItem.options.shot) optionsText.push('샷 추가')
                if (cartItem.options.syrup) optionsText.push('시럽 추가')
                const itemName = `${cartItem.menuItem.name}${optionsText.length > 0 ? ` (${optionsText.join(', ')})` : ''} X ${cartItem.quantity}`
                const itemPrice = calculateItemPrice(cartItem)

                return (
                  <div key={cartItem.id} className="cart-item">
                    <span>{itemName}</span>
                    <span>{formatPrice(itemPrice)}원</span>
                  </div>
                )
              })
            )}
          </div>
          <div className="cart-summary">
            <div className="total-amount">
              <span className="total-label">총 금액</span>
              <span className="total-price">{formatPrice(calculateTotalPrice())}원</span>
            </div>
            <button className="order-button" onClick={handleOrder}>
              주문하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 메뉴 아이템 카드 컴포넌트
function MenuItemCard({ item, onAddToCart }) {
  const [options, setOptions] = useState({
    shot: false,
    syrup: false
  })

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  const handleAddToCart = () => {
    onAddToCart(item, options)
    // 담기 후 옵션 초기화
    setOptions({ shot: false, syrup: false })
  }

  const calculatePrice = () => {
    let price = item.price
    if (options.shot) price += 500
    if (options.syrup) price += 0
    return price
  }

  const [imageError, setImageError] = useState(false)

  return (
    <div className="menu-card">
      <div className="menu-image">
        {item.image && !imageError ? (
          <img 
            src={item.image} 
            alt={item.name}
            onError={() => setImageError(true)}
            className="menu-image-img"
          />
        ) : (
          <div className="image-placeholder">
            <span>이미지</span>
          </div>
        )}
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{item.name}</h3>
        <p className="menu-price">{formatPrice(item.price)}원</p>
        <p className="menu-description">{item.description}</p>
        <div className="menu-options">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.shot}
              onChange={() => handleOptionChange('shot')}
            />
            <span>샷 추가 (+500원)</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.syrup}
              onChange={() => handleOptionChange('syrup')}
            />
            <span>시럽 추가 (+0원)</span>
          </label>
        </div>
        <button className="add-to-cart-button" onClick={handleAddToCart}>
          담기
        </button>
      </div>
    </div>
  )
}

function formatPrice(price) {
  return price.toLocaleString('ko-KR')
}

export default App
