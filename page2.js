// Initial Variables
let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let itemsPerPage = 6;
let currentCategory = "";
let currentPage = 1;
let totalPages = 1;

// Fetch products from DummyJSON API
async function fetchProducts(category = "", page = 1) {
  try {
    let url = "https://dummyjson.com/products";
    if (category) {
      url += `/category/${category}`;
    } else {
      // If no category is selected, fetch all products
      url += "?limit=0"; // Set limit to 0 to fetch all products
    }
    const response = await fetch(url);
    const data = await response.json();
    products = data.products;

    totalPages = Math.ceil(products.length / itemsPerPage); // Calculate total pages
    displayProducts(page); // Display the first page of products
  } catch (error) {
    console.error("Error fetching products:", error);
    document.getElementById("error-message").innerText =
      "Failed to load products. Please try again later.";
    document.getElementById("error-message").style.display = "block";
  }
}

// Display Products in DOM
function displayProducts(page = 1) {
  const productList = document.getElementById("product-grid");
  productList.innerHTML = ""; // Clear previous content

  const start = (page - 1) * itemsPerPage;
  const end = itemsPerPage === 0 ? products.length : page * itemsPerPage;
  const paginatedProducts =
    itemsPerPage === 0 ? products : products.slice(start, end);

  paginatedProducts.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");
    productDiv.innerHTML = `
            <h3>${product.title}</h3>
            <img src="${product.thumbnail}" alt="${product.title}" class="product-image"/>
            <p>$ ${product.price}</p>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
    productList.appendChild(productDiv);
  });

  // Enable/Disable pagination buttons
  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled =
    currentPage === totalPages || itemsPerPage === 0;
}

// Filter by category
function filterByCategory() {
  currentCategory = document.getElementById("category-select").value;
  currentPage = 1; // Reset to first page
  fetchProducts(currentCategory, currentPage);
}

// Change number of items per page
function changeItemsPerPage() {
  itemsPerPage = parseInt(document.getElementById("item-count").value);
  currentPage = 1; // Reset to first page
  if (itemsPerPage === 0) {
    totalPages = 1; // If showing all items, there's only one page
  } else {
    totalPages = Math.ceil(products.length / itemsPerPage); // Recalculate total pages
  }
  displayProducts(currentPage);
}

// Pagination logic
function changePage(direction) {
  if (direction === "next" && currentPage < totalPages) {
    currentPage++;
  } else if (direction === "prev" && currentPage > 1) {
    currentPage--;
  }
  displayProducts(currentPage);
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

// Update cart in DOM and Local Storage
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
            <button class="subtract-from-cart" onclick="subtractQuantity(${item.id})">-</button>
            <button class="remove-from-cart" onclick="removeFromCart(${item.id})">Remove</button>
        `;
    cartItemsDiv.appendChild(cartItemDiv);
  });

  document.getElementById("total-price").innerText = totalPrice.toFixed(2);
  localStorage.setItem("cart", JSON.stringify(cart));

  document.getElementById("empty-cart").style.display =
    cart.length === 0 ? "block" : "none";
}

// Add quantity to an item
function addQuantity(productId) {
  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) {
    cartItem.quantity += 1;
    updateCart();
  }
}

// Subtract quantity from an item
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

// Remove item from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCart();
}

// Checkout Functionality
function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty. Please add items before checking out.");
    return;
  }

  let totalAmount = 0;
  cart.forEach((item) => {
    totalAmount += item.price * item.quantity;
  });

  alert(
    `Thank you for your purchase! Your total is $${totalAmount.toFixed(2)}`
  );
  cart = []; // Clear the cart after checkout
  localStorage.removeItem("cart");
  updateCart(); // Refresh cart
}

// Fetch products on initial load
fetchProducts();

// Load cart from local storage on page load
window.onload = function () {
  updateCart();
};
