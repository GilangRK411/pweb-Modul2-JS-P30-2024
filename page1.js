// Initial Variables
let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let itemsPerPage = 6;
let currentCategory = "";

// Fetch products from DummyJSON API
async function fetchProducts(category = "") {
  try {
    let url = "https://dummyjson.com/products";
    if (category) url += `/category/${category}`;
    const response = await fetch(url);
    const data = await response.json();
    products = data.products;
    displayProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    document.getElementById("error-message").innerText =
      "Failed to load products. Please try again later.";
    document.getElementById("error-message").style.display = "block";
  }
}

// Display Products in DOM
function displayProducts() {
  const productList = document.getElementById("product-grid");
  productList.innerHTML = "";
  const paginatedProducts = products.slice(0, itemsPerPage);

  paginatedProducts.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");
    productDiv.innerHTML = `
            <h3>${product.title}</h3>
            <img src="${product.thumbnail}" alt="${product.title}" class="product-image"/>
            <p>$ ${product.price}</p>
            <div class="quantity-controls"></div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
    productList.appendChild(productDiv);
  });
}

// Filter by category
function filterByCategory() {
  currentCategory = document.getElementById("category-select").value;
  fetchProducts(currentCategory);
}

// Change number of items per page
function changeItemsPerPage() {
  itemsPerPage = document.getElementById("item-count").value;
  displayProducts();
}

// Add item to cart
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const cartItem = cart.find((item) => item.id === productId);

  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCart();
}

function updateCart() {
  const cartItemsDiv = document.getElementById("cart-items");
  cartItemsDiv.innerHTML = "";

  let totalItems = 0;
  let totalPrice = 0;

  cart.forEach((item) => {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;

    const cartItemDiv = document.createElement("div");
    cartItemDiv.innerHTML = `
            <p>${item.title} - $ ${item.price} x ${item.quantity}</p>
            <button class="add-to-cart" onclick="addQuantity(${item.id})">+</button>
            <button class="add-to-cart" onclick="subtractQuantity(${item.id})">-</button>
            <button class="add-to-cart" onclick="removeFromCart(${item.id})">Remove</button>
        `;
    cartItemsDiv.appendChild(cartItemDiv);
  });

  document.getElementById("cart-count").innerText = totalItems;
  document.getElementById("total-price").innerText = totalPrice.toFixed(2);
  localStorage.setItem("cart", JSON.stringify(cart));

  document.getElementById("empty-cart").style.display =
    cart.length === 0 ? "block" : "none";
}

function addQuantity(productId) {
  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) {
    cartItem.quantity += 1;
    updateCart();
  }
}

function subtractQuantity(productId) {
  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) {
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    } else {
      removeFromCart(productId);
    }
    updateCart();
  }
}

document.getElementById("checkout-button").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty. Please add items before checking out.");
    return;
  }

  alert("Thank you for your purchase!");
  cart = [];
  localStorage.removeItem("cart");
  updateCart();
});

fetchProducts();
