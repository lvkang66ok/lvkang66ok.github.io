// 模拟用户数据库
const users = [
  { username: 'user1', password: '123456', email: 'user1@example.com' }
];

// 商品数据（使用本地图片路径）
const products = [
  { 
    id: 1, 
    name: '环保纸杯（50个装）', 
    price: 15, 
    originalPrice: 18,
    category: '纸杯系列',
    image: 'images/cup.png',
    isRecommended: true,
    isOnSale: true
  },
  { 
    id: 2, 
    name: '可降解餐盒（10个）', 
    price: 12, 
    originalPrice: 12,
    category: '纸餐盒系列',
    image: 'images/box.png',
    isRecommended: true,
    isOnSale: false
  },
  { 
    id: 3, 
    name: 'PET饮料瓶（回收级）', 
    price: 8, 
    originalPrice: 10,
    category: 'PET系列',
    image: 'images/pet.png',
    isRecommended: false,
    isOnSale: true
  },
  { 
    id: 4, 
    name: '竹制刀叉勺套装', 
    price: 20, 
    originalPrice: 25,
    category: '餐具系列',
    image: 'images/utensil.png',
    isRecommended: true,
    isOnSale: true
  }
];

// 初始化
window.onload = function () {
  renderNav();
  renderProducts(); // 商品列表页
  renderHomePage(); // 👈 新增：首页初始化
  checkLoginStatus();
};

function renderNav() {
  const nav = document.getElementById('nav-links');
  const isLoggedIn = localStorage.getItem('currentUser');
  if (isLoggedIn) {
    nav.innerHTML = `
      <a href="#" onclick="showPage('products')">商品</a>
      <a href="#" onclick="showPage('profile')">会员</a>
      <a href="#" onclick="showPage('orders')">订单</a>
    `;
  } else {
    nav.innerHTML = `
      <a href="#" onclick="showPage('products')">商品</a>
      <a href="#" onclick="showPage('login')">登录</a>
    `;
  }
}

function renderProducts() {
  const list = document.getElementById('product-list');
  list.innerHTML = products.map(p => `
    <div class="product">
      <img src="${p.image}" alt="${p.name}">
      <div class="product-info">
        <h4>${p.name}</h4>
        <p>分类：${p.category}</p>
        <p>价格：<strong>¥${p.price}</strong></p>
        <button onclick="goToPayment(${p.id})">🛒 立即购买</button>
      </div>
    </div>
  `).join('');
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
    
    if (pageId === 'orders') {
      renderOrders();
    }
    if (pageId === 'payment') {
      renderPaymentInfo();
    }
    if (pageId === 'account-settings') {
      initAccountSettings();
    }
    // 👇 新增
    if (pageId === 'home') {
      renderHomePage();
    }
    if (pageId === 'promotion-center') {
      renderPromotionCenter();
    }
  } else {
    document.getElementById('not-found').classList.add('active');
  }
  renderNav();
}

function handleLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem('currentUser', username);
    document.getElementById('current-user').textContent = username;
    alert('✅ 登录成功！');
    showPage('profile');
  } else {
    alert('❌ 用户名或密码错误！');
  }
}

function handleRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const email = document.getElementById('reg-email').value.trim();

  if (!username || !password || !email) {
    alert('请填写完整信息！');
    return;
  }

  const exists = users.some(u => u.username === username);
  if (exists) {
    alert('用户名已存在！');
    return;
  }

  users.push({ username, password, email });
  localStorage.setItem('currentUser', username);
  alert('✅ 注册成功！');
  showPage('profile');
}

function checkLoginStatus() {
  const user = localStorage.getItem('currentUser');
  if (user) {
    document.getElementById('current-user').textContent = user;
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  showPage('home');
}

function goToPayment(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // 临时存储当前要支付的商品
  sessionStorage.setItem('currentPaymentProduct', JSON.stringify(product));
  showPage('payment');
  renderPaymentInfo();
}

function renderPaymentInfo() {
  const product = JSON.parse(sessionStorage.getItem('currentPaymentProduct'));
  if (!product) {
    showPage('products');
    return;
  }

  const infoDiv = document.getElementById('payment-info');
  infoDiv.innerHTML = `
    <div class="product" style="margin-bottom: 20px;">
      <img src="${product.image}" alt="${product.name}" style="width:60px;height:60px;object-fit:contain;">
      <div class="product-info">
        <h4>${product.name}</h4>
        <p>价格：<strong>¥${product.price}</strong></p>
      </div>
    </div>
  `;
}

function submitPayment() {
  const product = JSON.parse(sessionStorage.getItem('currentPaymentProduct'));
  const paymentMethodEl = document.querySelector('input[name="payment-method"]:checked');
  
  if (!product || !paymentMethodEl) return;

  const method = paymentMethodEl.value;
  const methodName = { wechat: '微信支付', alipay: '支付宝', card: '银行卡' }[method];

  // ✅ 模拟支付成功
  alert(`✅ 支付成功！\n商品：${product.name}\n金额：¥${product.price}\n支付方式：${methodName}`);

  // 📝 保存订单到 localStorage（模拟后端存储）
  const currentUser = localStorage.getItem('currentUser') || 'guest';
  const order = {
    id: Date.now(),
    productId: product.id,
    productName: product.name,
    price: product.price,
    paymentMethod: methodName,
    status: '已支付',
    timestamp: new Date().toLocaleString()
  };

  // 获取已有订单
  let orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
  orders.push(order);
  localStorage.setItem('userOrders', JSON.stringify(orders));

  // 清除临时支付数据
  sessionStorage.removeItem('currentPaymentProduct');

  // 跳转到订单页
  showPage('orders');
  renderOrders(); // 需要新增这个函数来动态显示订单
}

function renderOrders() {
  const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
  const listDiv = document.getElementById('orders-list');

  if (orders.length === 0) {
    listDiv.innerHTML = '<p>暂无订单。</p>';
    return;
  }

  listDiv.innerHTML = orders.map(order => `
    <div class="product" style="margin-bottom: 15px;">
      <div class="product-info">
        <h4>订单 #${order.id.toString().slice(-4)}</h4>
        <p>商品：${order.productName}</p>
        <p>金额：¥${order.price} | 方式：${order.paymentMethod}</p>
        <p>状态：<span style="color:green;">${order.status}</span></p>
        <p>时间：${order.timestamp}</p>
      </div>
    </div>
  `).join('');
}

// 页面加载时初始化设置页
function initAccountSettings() {
  const address = localStorage.getItem('userAddress') || '';
  document.getElementById('shipping-address').value = address;
}

function saveAddress() {
  const address = document.getElementById('shipping-address').value.trim();
  if (!address) {
    alert('请输入收货地址！');
    return;
  }
  localStorage.setItem('userAddress', address);
  alert('✅ 收货地址已保存！');
}

function changePassword() {
  const oldPass = document.getElementById('old-password').value;
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;

  // 简单校验
  if (!oldPass || !newPass || !confirmPass) {
    alert('请填写所有字段！');
    return;
  }
  if (newPass !== confirmPass) {
    alert('新密码与确认密码不一致！');
    return;
  }

  // 获取当前用户
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('未登录用户无法修改密码');
    return;
  }

  // 模拟：从“数据库”（users 数组）中找用户
  const userIndex = users.findIndex(u => u.username === currentUser);
  if (userIndex === -1) {
    alert('用户不存在');
    return;
  }

  // 验证原密码（前端模拟，实际应在后端）
  if (users[userIndex].password !== oldPass) {
    alert('❌ 当前密码错误！');
    return;
  }

  // 更新密码
  users[userIndex].password = newPass;
  alert('✅ 密码修改成功！');

  // 清空输入框
  document.getElementById('old-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
}

function renderProductCard(product) {
  const hasDiscount = product.originalPrice > product.price;
  return `
    <div class="product" style="position:relative;">
      ${hasDiscount ? '<div class="sale-tag">促销</div>' : ''}
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h4>${product.name}</h4>
        <p>分类：${product.category}</p>
        <p>
          ${hasDiscount ? `<span class="original-price">¥${product.originalPrice}</span>` : ''}
          <strong>¥${product.price}</strong>
          ${hasDiscount ? `<span style="color:#e74c3c; font-size:0.9em;">(${Math.round((1 - product.price / product.originalPrice) * 100)}% off)</span>` : ''}
        </p>
        <button onclick="goToPayment(${product.id})">🛒 立即购买</button>
      </div>
    </div>
  `;
}

function renderHomePage() {
  // 推荐商品
  const recommended = products.filter(p => p.isRecommended);
  document.getElementById('recommended-list').innerHTML = 
    recommended.length > 0 
      ? recommended.map(renderProductCard).join('')
      : '<p>暂无推荐商品</p>';

  // 促销商品
  const onSale = products.filter(p => p.isOnSale);
  document.getElementById('sale-list').innerHTML = 
    onSale.length > 0 
      ? onSale.map(renderProductCard).join('')
      : '<p>暂无促销商品</p>';
}

function renderPromotionCenter() {
  const onSale = products.filter(p => p.isOnSale);
  document.getElementById('promotion-list').innerHTML = 
    onSale.length > 0 
      ? onSale.map(renderProductCard).join('')
      : '<p>当前没有促销活动</p>';
}