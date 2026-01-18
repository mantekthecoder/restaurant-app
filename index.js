// Select DOM elements

import {menuArray} from "./data.js";
const orderContainer = document.getElementById("order-container");
const checkoutHeader = document.getElementById("checkout-header");
const orderButton = document.querySelectorAll(".add-order-btn");
const checkoutContainer = document.getElementById("checkout-container");
const thankYouContainer = document.getElementById("thank-you-container");
const banner = document.getElementById("banner");
const pizza = document.getElementById("pizza");
const hamburger = document.getElementById("hamburger");
const beer = document.getElementById("beer");
const name = document.getElementById("name");
const phone = document.getElementById("phone");
const address = document.getElementById("address");
const submitButton = document.querySelector("button[type='submit']");
const menuContainer = document.getElementById("menu-container");
const removeItemButtons = document.querySelectorAll(".remove-item-btn");
const checkout = document.getElementById("checkout");
const inputName = document.getElementById("name");
const payButton = document.getElementById("pay-button");
const orderSection = document.getElementById("order");
const checkoutForm = document.getElementById("checkout-form");
// State
let order = [];

// Event Listeners
document.addEventListener("click", (e) => {
    const addOrderId = e.target.dataset.id;
    if (addOrderId) {
        addOrder(addOrderId);
    }
    
    const removeItemId = e.target.dataset.removeId;
    if (removeItemId) {
        removeOrder(removeItemId);
    }

    const completeOrderBtn = e.target.id === "complete-order-btn";
    if (completeOrderBtn) {
        checkout.style.display = "flex";
    }

    const checkoutCloseBtn = e.target.id === "checkout-close-btn";
    if (checkoutCloseBtn) {
        checkout.style.display = "none";
    }
})

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    checkout.style.display = "none";
    orderSection.style.display = "none";
    thankYouContainer.style.display = "block";
    thankYouContainer.innerHTML = `
            <h5 class="thank-you-message">Thanks, ${inputName.value}! Your order is on its way!</h5>
        `;
})




// Functions
function addOrder(id) {
    const menuItem = menuArray.find(item => item.id == id);
    if (!menuItem) return;
    const existingItem = order.find(item => item.id == id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        order.push({ ...menuItem, quantity: 1, combo: false });
    }
    renderOrder();
}

function removeOrder(id) {
    order = order.filter(item => item.id != id);
    renderOrder();
}

function renderOrder() {
    if (order.length === 0) {
        orderSection.style.display = "none";
    } else {
        orderSection.style.display = "block";
    }
    const pizzaQty = order.find(item => item.id == 0)?.quantity ?? 0;
    const hamburgerQty = order.find(item => item.id == 1)?.quantity ?? 0;
    const beerQty = order.find(item => item.id == 2)?.quantity ?? 0;
    const comboCount = Math.min(beerQty, pizzaQty + hamburgerQty);
    const discountedPizzaQty = Math.min(pizzaQty, comboCount);
    const discountedHamburgerQty = Math.min(hamburgerQty, comboCount - discountedPizzaQty);
    const discountedBeerQty = comboCount;
    const discountMap = {
        0: discountedPizzaQty,
        1: discountedHamburgerQty,
        2: discountedBeerQty,
    };

    const orderLines = [];
    order.forEach(item => {
        const discountedUnits = discountMap[item.id] ?? 0;
        const regularUnits = item.quantity - discountedUnits;
        if (discountedUnits > 0) {
            orderLines.push({ item, quantity: discountedUnits, discounted: true });
        }
        if (regularUnits > 0) {
            orderLines.push({ item, quantity: regularUnits, discounted: false });
        }
    });

    const orderItemsHtml = orderLines.map(line => {
        const originalLineTotal = line.item.price * line.quantity;
        const discountedLineTotal = line.discounted ? originalLineTotal * 0.5 : originalLineTotal;
        const linePriceMarkup = line.discounted
            ? `<span class="price-original">$${originalLineTotal}</span><span class="price-final">$${discountedLineTotal}</span>`
            : `<span class="price-final">$${originalLineTotal}</span>`;
        const comboTag = line.discounted ? `<span class="combo-tag">Combo -50%</span>` : "";
        return `
        <div class="order-item${line.discounted ? " order-item-discount" : ""}">
            <p>${line.item.name} x${line.quantity} ${comboTag} <button class="remove-item-btn" data-remove-id="${line.item.id}">Remove</button></p>
            <p class="price">${linePriceMarkup}</p>
        </div>
    `;
    }).join("");
    const originalTotal = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountedTotal = order.reduce((sum, item) => {
        const discountedUnits = discountMap[item.id] ?? 0;
        const lineTotal = (item.price * (item.quantity - discountedUnits))
            + (item.price * 0.5 * discountedUnits);
        return sum + lineTotal;
    }, 0);
    const totalMarkup = originalTotal !== discountedTotal
        ? `<span class="price-original">$${originalTotal}</span><span class="price-final">$${discountedTotal}</span>`
        : `<span class="price-final">$${originalTotal}</span>`;
    return orderSection.innerHTML = `
        <h2>Your Order</h2>
        ${orderItemsHtml}
        <div class="order-total">
            <p>Total price: </p>
            <p class="price">${totalMarkup}</p>
        </div>
        
        <button class="complete-order-btn" id="complete-order-btn">Complete Order</button>
    `
}

function renderBanner() {
    const bannerContent = `
    <h1>Jimmy's Diner</h1>
    <p>The best burgers and pizzas in town</p>`
    return banner.innerHTML = bannerContent
}
renderBanner();

function renderMenu() {
    const menuContent = menuArray.map(item => {
        const {name, ingredients, price, image, id} = item;
        return `
        <div class="menu-item">
            <div class="menu-img-container">
                <img src="${image}" alt="${name}" class="menu-img">
            </div>
            <div class="menu-item-info">
                <p class="menu-black-display">${name}</p>
                <p>${ingredients.join(", ")}</p>
                <p class="menu-black-display">$${price}</p>
            </div>
            <button class="add-order-btn" data-id="${id}">+</button>
        </div>`
    })
    return menuContainer.innerHTML = menuContent.join("");
}
renderMenu();
