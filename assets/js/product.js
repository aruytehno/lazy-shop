class ProductPage {
    constructor() {
        this.product = null;
        this.init();
    }

    async init() {
        await this.loadProduct();
        this.renderProduct();
        this.updateCartCount();
    }

    async loadProduct() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));

        if (!productId) {
            document.getElementById('product-details').innerHTML =
                '<div class="error">Товар не найден</div>';
            return;
        }

        try {
            const response = await fetch('../data/products.json');
            const products = await response.json();
            this.product = products.find(p => p.id === productId);

            if (!this.product) {
                throw new Error('Товар не найден');
            }
        } catch (error) {
            document.getElementById('product-details').innerHTML =
                `<div class="error">Ошибка: ${error.message}</div>`;
        }
    }

    renderProduct() {
        if (!this.product) return;

        const container = document.getElementById('product-details');
        container.innerHTML = `
            <div class="product-detail">
                <div class="product-gallery">
                    ${this.product.images.map(img => `
                        <img src="${img}" alt="${this.product.name}"
                             onerror="this.src='assets/img/placeholder.jpg'">
                    `).join('')}
                </div>
                <div class="product-info">
                    <h1>${this.product.name}</h1>
                    <p class="price">${this.product.price.toLocaleString('ru-RU')} руб.</p>

                    <div class="specs">
                        <h3>Характеристики:</h3>
                        <p><strong>Бренд:</strong> ${this.product.brand}</p>
                        <p><strong>Модель:</strong> ${this.product.model}</p>
                        <p><strong>Размер:</strong> ${this.product.width}/${this.product.height}R${this.product.diameter}</p>
                        <p><strong>Индекс нагрузки:</strong> ${this.product.load_index}</p>
                        <p><strong>Категория:</strong> ${this.product.category}</p>
                        ${this.product.subcategory ? `<p><strong>Назначение:</strong> ${this.product.subcategory}</p>` : ''}
                    </div>

                    <p class="description">${this.product.description}</p>

                    <button onclick="productPage.addToCart()" class="add-to-cart-btn">
                        Добавить в корзину
                    </button>
                </div>
            </div>
        `;
    }

    addToCart() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === this.product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: this.product.id,
                name: this.product.name,
                price: this.product.price,
                image: this.product.images[0],
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
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

const productPage = new ProductPage();