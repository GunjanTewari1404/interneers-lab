document.addEventListener('DOMContentLoaded', function() { 
    const productList = document.getElementById('product-list');
    const categoryFilters = document.getElementById('category-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const modal = document.getElementById('product-modal');
    const closeBtn = document.querySelector('.close-btn');
    const productDetails = document.getElementById('product-details');

    // API Base URL
    const API_BASE_URL = 'http://localhost:8000/api';

    let activeCategory = null;

    const categoryMap = new Map();

    async function fetchCategoriesAndPopulateFilters() {
        try {
            const res = await fetch(`${API_BASE_URL}/categories/`);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const categories = await res.json();
            
            categoryFilters.innerHTML = '';
            
            const allProductsFilter = document.createElement('div');
            allProductsFilter.className = 'category-filter active';
            allProductsFilter.dataset.categoryId = 'all';
            allProductsFilter.innerHTML = `
                <span class="category-name">All Products</span>
                <span class="category-count"></span>
            `;
            categoryFilters.appendChild(allProductsFilter);

            categories.forEach(cat => {
                categoryMap.set(cat.id, cat.title);
                
                const categoryFilter = document.createElement('div');
                categoryFilter.className = 'category-filter';
                categoryFilter.dataset.categoryId = cat.id;
                categoryFilter.innerHTML = `
                    <span class="category-name">${cat.title}</span>
                    <span class="category-count"></span>
                `;
                categoryFilters.appendChild(categoryFilter);
            });

            document.querySelectorAll('.category-filter').forEach(filter => {
                filter.addEventListener('click', () => {
                    document.querySelectorAll('.category-filter').forEach(f => {
                        f.classList.remove('active');
                    });

                    filter.classList.add('active');
                    
                    const categoryId = filter.dataset.categoryId;
                    activeCategory = categoryId === 'all' ? null : categoryId;
                    
                    if (activeCategory) {
                        fetchProductsByCategory(activeCategory);
                    } else {
                        displayProducts();
                    }
                });
            });

        } catch (error) {
            console.error('Error fetching categories:', error);
            categoryFilters.innerHTML = '<div class="error">Failed to load categories. Please try again later.</div>';
        }
    }

    async function fetchProductsByCategory(categoryId) {
        try {
            productList.innerHTML = '<div class="loading">Loading products...</div>';
            
            const res = await fetch(`${API_BASE_URL}/categories/${categoryId}/products/`);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const products = await res.json();
            
            displayProductsList(products);
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            productList.innerHTML = '<div class="error">Failed to load products. Please try again later.</div>';
        }
    }

    async function fetchProducts() {
        try {
            const res = await fetch(`${API_BASE_URL}/products/`);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const data = await res.json();
            console.log('Products data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            productList.innerHTML = '<div class="error">Failed to load products. Please try again later.</div>';
            return [];
        }
    }

    async function fetchProductById(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}/`);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const data = await res.json();
            console.log('Product detail data:', data);
            return data;
        } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            return null;
        }
    }

    function formatPrice(price) {
        const numPrice = typeof price === 'string' ? parseFloat(price) : (typeof price === 'number' ? price : 0);
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    }

    function getCategoryTitle(category) {
        if (!category) return 'Uncategorized';

        if (typeof category === 'object' && category.title) {
            return category.title;
        }

        return categoryMap.get(category) || 'Uncategorized';
    }

    function createProductTile(product) {
        const tile = document.createElement('div');
        tile.className = 'product-tile';
        tile.dataset.id = product.id;

        const formattedPrice = formatPrice(product.price);
        const categoryTitle = getCategoryTitle(product.category);

        tile.innerHTML = `
            <div class="product-info">
                <h2 class="product-name">${product.name}</h2>
                <p class="product-category">${categoryTitle}</p>
                <p class="product-price"> &#8377; ${formattedPrice}</p>
                <button class="view-details-btn">View Details</button>
            </div>
        `;

        tile.querySelector('.view-details-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showProductDetails(product.id);
        });

        tile.addEventListener('click', () => showProductDetails(product.id));

        return tile;
    }

    function displayProductsList(products) {
        productList.innerHTML = '';

        if (products.length === 0) {
            productList.innerHTML = '<div class="no-products">No products available in this category</div>';
            return;
        }

        products.forEach(product => {
            const productTile = createProductTile(product);
            productList.appendChild(productTile);
        });

        setTimeout(() => {
            document.querySelectorAll('.product-tile').forEach((tile, index) => {
                setTimeout(() => {
                    tile.classList.add('visible');
                }, index * 100);
            });
        }, 100);
    }

    async function displayProducts() {
        productList.innerHTML = '<div class="loading">Loading products...</div>';
        
        const products = await fetchProducts();
        displayProductsList(products);
    }

    async function showProductDetails(productId) {
        const product = await fetchProductById(productId);

        if (!product) {
            productDetails.innerHTML = '<div class="error">Failed to load product details.</div>';
            modal.style.display = 'block';
            return;
        }

        const formattedPrice = formatPrice(product.price);
        const categoryTitle = getCategoryTitle(product.category);

        productDetails.innerHTML = `
            <div class="product-detail-info">
                <div class="product-detail-header">
                    <h2 class="product-detail-name">${product.name}</h2>
                    <div class="product-detail-price"> &#8377; ${formattedPrice}</div>
                </div>

                <div class="product-detail-description">
                    <h3>Description</h3>
                    <p>${product.description || 'No description available.'}</p>
                </div>

                <div class="product-detail-meta">
                    <div class="meta-item">
                        <span class="meta-label">Category:</span>
                        <span class="meta-value">${categoryTitle}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Brand:</span>
                        <span class="meta-value">${product.brand || 'Not specified'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Availability:</span>
                        <span class="meta-value ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                        </span>
                    </div>
                </div>

                <button class="add-to-cart-btn">Add to Cart</button>
            </div>
        `;

        productDetails.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            alert(`Added ${product.name} to cart!`);
        });

        modal.style.display = 'block';

        setTimeout(() => {
            modal.querySelector('.modal-content').classList.add('active');
        }, 10);
    }

    clearFiltersBtn.addEventListener('click', () => {
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.classList.remove('active');
        });
        document.querySelector('[data-category-id="all"]').classList.add('active');
        activeCategory = null;
        displayProducts();
    });

    closeBtn.addEventListener('click', () => {
        modal.querySelector('.modal-content').classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.querySelector('.modal-content').classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });

    fetchCategoriesAndPopulateFilters();
    displayProducts();
});
