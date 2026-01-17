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
  const [currentView, setCurrentView] = useState('order') // 'order' or 'admin'
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([]) // 주문 목록
  const [inventory, setInventory] = useState([
    { id: 1, name: '아메리카노(ICE)', stock: 10 },
    { id: 2, name: '아메리카노(HOT)', stock: 10 },
    { id: 3, name: '카페라떼', stock: 10 }
  ])

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
    
    // 주문 생성
    const totalPrice = calculateTotalPrice()
    const orderId = Date.now()
    const now = new Date()
    const orderDate = `${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const newOrder = {
      id: orderId,
      date: orderDate,
      items: cart.map(item => ({
        menuItem: item.menuItem,
        options: item.options,
        quantity: item.quantity
      })),
      totalPrice: totalPrice,
      status: 'pending' // 'pending', 'received', 'making', 'completed'
    }
    
    // 재고 차감
    setInventory(prev => prev.map(item => {
      const cartItem = cart.find(ci => ci.menuItem.id === item.id)
      if (cartItem) {
        const newStock = Math.max(0, item.stock - cartItem.quantity)
        return { ...item, stock: newStock }
      }
      return item
    }))
    
    setOrders(prev => [newOrder, ...prev])
    setCart([])
    alert('주문이 완료되었습니다!')
  }

  // 주문 상태별 통계
  const orderStats = {
    total: orders.length,
    received: orders.filter(o => o.status === 'received').length,
    making: orders.filter(o => o.status === 'making').length,
    completed: orders.filter(o => o.status === 'completed').length
  }

  // 재고 수정
  const updateInventory = (itemId, change) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.stock + change)
        return { ...item, stock: newStock }
      }
      return item
    }))
  }

  // 주문 상태 변경
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="header">
        <div className="logo">COZY</div>
        <nav className="nav">
          <button 
            className={`nav-button ${currentView === 'order' ? 'active' : ''}`}
            onClick={() => setCurrentView('order')}
          >
            주문하기
          </button>
          <button 
            className={`nav-button ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentView('admin')}
          >
            관리자
          </button>
        </nav>
      </header>

      {/* 메뉴 영역 */}
      {currentView === 'order' ? (
        <>
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
        </>
      ) : (
        <AdminDashboard
          orderStats={orderStats}
          inventory={inventory}
          orders={orders}
          updateInventory={updateInventory}
          updateOrderStatus={updateOrderStatus}
        />
      )}
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

// 관리자 대시보드 컴포넌트
function AdminDashboard({ orderStats, inventory, orders, updateInventory, updateOrderStatus }) {
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', color: '#ef4444' }
    if (stock < 5) return { text: '주의', color: '#f59e0b' }
    return { text: '정상', color: '#10b981' }
  }

  // 주문 접수 대기, 접수, 제조 중 상태의 주문만 표시 (제조 완료는 제외)
  const displayOrders = orders
    .filter(o => o.status !== 'completed')
    .sort((a, b) => b.id - a.id)

  return (
    <main className="admin-content">
      {/* 관리자 대시보드 */}
      <section className="admin-section">
        <h2 className="section-title">관리자 대시보드</h2>
        <div className="dashboard-stats">
          <div className="stat-item">
            <span className="stat-label">총 주문</span>
            <span className="stat-value">{orderStats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">주문 접수</span>
            <span className="stat-value">{orderStats.received}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">제조 중</span>
            <span className="stat-value">{orderStats.making}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">제조 완료</span>
            <span className="stat-value">{orderStats.completed}</span>
          </div>
        </div>
      </section>

      {/* 재고 현황 */}
      <section className="admin-section">
        <h2 className="section-title">재고 현황</h2>
        <div className="inventory-grid">
          {inventory.map(item => {
            const status = getStockStatus(item.stock)
            return (
              <div key={item.id} className="inventory-card">
                <h3 className="inventory-name">{item.name}</h3>
                <div className="inventory-info">
                  <span className="inventory-stock">{item.stock}개</span>
                  <span className="inventory-status" style={{ color: status.color }}>
                    {status.text}
                  </span>
                </div>
                <div className="inventory-controls">
                  <button 
                    className="inventory-btn"
                    onClick={() => updateInventory(item.id, 1)}
                  >
                    +
                  </button>
                  <button 
                    className="inventory-btn"
                    onClick={() => updateInventory(item.id, -1)}
                    disabled={item.stock === 0}
                  >
                    -
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 주문 현황 */}
      <section className="admin-section">
        <h2 className="section-title">주문 현황</h2>
        <div className="orders-list">
          {displayOrders.length === 0 ? (
            <p className="empty-message">주문이 없습니다.</p>
          ) : (
            displayOrders.map(order => {
              const orderItems = order.items.map(item => {
                const optionsText = []
                if (item.options.shot) optionsText.push('샷 추가')
                if (item.options.syrup) optionsText.push('시럽 추가')
                const itemName = `${item.menuItem.name}${optionsText.length > 0 ? ` (${optionsText.join(', ')})` : ''} x ${item.quantity}`
                return itemName
              }).join(', ')

              return (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <div className="order-date">{order.date}</div>
                    <div className="order-details">
                      <span className="order-menu">{orderItems}</span>
                      <span className="order-price">{formatPrice(order.totalPrice)}원</span>
                    </div>
                  </div>
                  {order.status === 'pending' && (
                    <button 
                      className="order-action-btn"
                      onClick={() => updateOrderStatus(order.id, 'received')}
                    >
                      주문 접수
                    </button>
                  )}
                  {order.status === 'received' && (
                    <button 
                      className="order-action-btn"
                      onClick={() => updateOrderStatus(order.id, 'making')}
                    >
                      제조 시작
                    </button>
                  )}
                  {order.status === 'making' && (
                    <button 
                      className="order-action-btn"
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                    >
                      제조 완료
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <span className="order-completed">완료</span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </section>
    </main>
  )
}

export default App
