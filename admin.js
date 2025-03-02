const firebaseConfig = {
    apiKey: "AIzaSyDdPF1KwTeC5zzFbsLnkCvx6a2BmWt8iL8",
    authDomain: "test-58408.firebaseapp.com",
    projectId: "test-58408",
    storageBucket: "test-58408.appspot.com",
    messagingSenderId: "857029748739",
    appId: "1:857029748739:web:5a85299a0343e54a118636",
    measurementId: "G-M4YV7HB77W"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Verificar se o user é admin
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
    }
});

// Manipular envio do formulário
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    const imageFile = document.getElementById('productImage').files[0];
    const productId = document.getElementById('productId').value;

    try {
        if (imageFile) {
            const storageRef = storage.ref(`products/${imageFile.name}`);
            await storageRef.put(imageFile);
            productData.imageUrl = await storageRef.getDownloadURL();
        }

        if (productId) {
            // Atualizar produto existente
            await db.collection('products').doc(productId).update(productData);
        } else {
            // Adicionar novo produto
            await db.collection('products').add(productData);
        }

        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('submitButton').textContent = 'Adicionar Produto';
        loadProducts();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar o produto');
    }
});

// Carregar produtos
async function loadProducts() {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';

    try {
        const snapshot = await db.collection('products').orderBy('timestamp', 'desc').get();
        
        snapshot.forEach(doc => {
            const product = doc.data();
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            productElement.innerHTML = `
                <img src="${product.imageUrl || 'placeholder.jpg'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Categoria: ${product.category}</p>
                <p>Preço: €${product.price}</p>
                <button onclick="editProduct('${doc.id}')">Editar</button>
                <button onclick="deleteProduct('${doc.id}')">Excluir</button>
            `;
            productsList.appendChild(productElement);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Editar produto
async function editProduct(productId) {
    const doc = await db.collection('products').doc(productId).get();
    const product = doc.data();

    document.getElementById('productId').value = productId;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('submitButton').textContent = 'Atualizar Produto';
}

// Excluir produto
async function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            await db.collection('products').doc(productId).delete();
            loadProducts();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            alert('Erro ao excluir o produto');
        }
    }
}

// Carregar produtos nos selects de destaque
async function loadFeaturedSelects() {
    const featured1Select = document.getElementById('featured1');
    const featured2Select = document.getElementById('featured2');
    
    try {
        // Carregar produtos atuais em destaque
        const featuredDoc = await db.collection('featured').doc('homepage').get();
        const featuredData = featuredDoc.exists ? featuredDoc.data() : {};
        
        // Carregar todos os produtos
        const snapshot = await db.collection('products').get();
        
        // Limpar opções existentes
        featured1Select.innerHTML = '<option value="">Selecione um produto</option>';
        featured2Select.innerHTML = '<option value="">Selecione um produto</option>';
        
        // Adicionar produtos aos selects
        snapshot.forEach(doc => {
            const product = doc.data();
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            
            option1.value = doc.id;
            option1.textContent = product.name;
            option2.value = doc.id;
            option2.textContent = product.name;
            
            // Selecionar produtos em destaque atuais
            if (doc.id === featuredData.featured1) option1.selected = true;
            if (doc.id === featuredData.featured2) option2.selected = true;
            
            featured1Select.appendChild(option1);
            featured2Select.appendChild(option2.cloneNode(true));
        });
    } catch (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
    }
}

// Salvar produtos em destaque
document.getElementById('saveFeatured').addEventListener('click', async () => {
    const featured1 = document.getElementById('featured1').value;
    const featured2 = document.getElementById('featured2').value;
    
    try {
        await db.collection('featured').doc('homepage').set({
            featured1,
            featured2,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Produtos em destaque atualizados com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar destaques:', error);
        alert('Erro ao salvar produtos em destaque');
    }
});

// Carregar selects quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadFeaturedSelects();
});