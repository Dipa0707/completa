const firebaseConfig = {
    apiKey: "AIzaSyDdPF1KwTeC5zzFbsLnkCvx6a2BmWt8iL8",
    authDomain: "test-58408.firebaseapp.com",
    projectId: "test-58408",
    storageBucket: "test-58408.appspot.com",
    messagingSenderId: "857029748739",
    appId: "1:857029748739:web:5a85299a0343e54a118636",
    measurementId: "G-M4YV7HB77W"
};

// Inicializar Firebase se ainda não estiver inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Função para carregar produtos por categoria
async function loadProductsByCategory(category) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;

    productsContainer.innerHTML = '<p>A carregar os produtos...</p>';

    try {
        const snapshot = await db.collection('products')
            .where('category', '==', category)
            .get();

        if (snapshot.empty) {
            productsContainer.innerHTML = '<p>Nenhum produto encontrado nesta categoria.</p>';
            return;
        }

        productsContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const product = doc.data();
            const productElement = document.createElement('div');
            productElement.className = 'product-card';
            productElement.innerHTML = `
                <a href="mostrar.html?id=${doc.id}" class="product-link">
                    <img src="${product.imageUrl || 'placeholder.jpg'}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">€${product.price}</p>
                    <p class="description">${product.description}</p>
                </a>
                <button onclick="addToCart('${doc.id}')" class="cart-button">
                    <i class="fas fa-shopping-cart"></i>
                    Adicionar ao Carrinho
                </button>
            `;
            productsContainer.appendChild(productElement);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        productsContainer.innerHTML = '<p>Erro ao carregar produtos. Por favor, tente novamente mais tarde.</p>';
    }
}

// Função para adicionar ao carrinho
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

}

// Atualizar contagem do carrinho quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
});

// Função para remover item do carrinho
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Atualizar contagem do carrinho
    updateCartCount();
    
    // Recarregar a página do carrinho
    location.reload();
}

// Função para atualizar quantidade
function updateQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        location.reload();
    }
}

// Função para atualizar contagem do carrinho
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
} 