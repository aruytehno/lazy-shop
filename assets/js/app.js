class LazyShop {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupFilters();
        this.renderProducts();
        this.updateCartCount();
    }

    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            this.products = await response.json();
            this.filteredProducts = [...this.products];
            this.populateBrandFilter();
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            document.getElementById('products-container').innerHTML =
                '<div class="error">Ошибка загрузки товаров. Пожалуйста, обновите страницу.</div>';
        }
    }

    populateBrandFilter() {
        const brandSelect = document.getElementById('brand');
        const brands = [...new Set(this.products.map(p => p.brand))].filter(b => b);

        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });
    }

    setupFilters() {
        const categorySelect = document.getElementById('category');
        const brandSelect = document.getElementById('brand');
        const priceSlider = document.getElementById('price');
        const priceValue = document.getElementById('price-value');

        const filterHandler = () => this.applyFilters();

        categorySelect.addEventListener('change', filterHandler);
        brandSelect.addEventListener('change', filterHandler);
        priceSlider.addEventListener('input', () => {
            priceValue.textContent = `${priceSlider.value} руб.`;
            filterHandler();
        });
    }

    applyFilters() {
        const category = document.getElementById('category').value;
        const brand = document.getElementById('brand').value;
        const maxPrice = document.getElementById('price').value;

        this.filteredProducts = this.products.filter(product => {
            const matchesCategory = !category || product.category === category;
            const matchesBrand = !brand || product.brand === brand;
            const matchesPrice = !maxPrice || product.price <= parseInt(maxPrice);

            return matchesCategory && matchesBrand && matchesPrice;
        });

        this.renderProducts();
    }

    renderProducts() {
        const container = document.getElementById('products-container');

        if (this.filteredProducts.length === 0) {
            container.innerHTML = '<div class="loading">Товары не найдены</div>';
            return;
        }

        container.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.images[0] || 'assets/img/placeholder.jpg'}"
                     alt="${product.name}"
                     onerror="this.src='assets/img/placeholder.jpg'">
                <h3>${product.name}</h3>
                <p class="price">${product.price.toLocaleString('ru-RU')} руб.</p>
                <p class="specs">${product.width}/${product.height}R${product.diameter}</p>
                <a href="product.html?id=${product.id}">Подробнее</a>
                <button onclick="lazyShop.addToCart(${product.id})">В корзину</button>
            </div>
        `).join('');
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
        this.showNotification('Товар добавлен в корзину!');
    }

    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-link').textContent = `Корзина (${totalItems})`;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 1rem;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Инициализация приложения
const lazyShop = new LazyShop();