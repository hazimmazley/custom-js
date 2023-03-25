let orderId =
  Shopify?.checkout?.order_id ||
  +document.currentScript.getAttribute("orderId");
const shopName = Shopify.Checkout.apiHost;
const shopUrl = `https://${shopName}`;

const orderActionSettings =
  JSON.parse(eval(document.currentScript.innerText)) || {};
const orderStatus = JSON.parse(
  document.currentScript.getAttribute("orderCancelled")
);
const orderFulfillment =
  document.currentScript.getAttribute("orderFulfillment");
const unFulfilled = orderFulfillment == "unfulfilled";

const orderTags = JSON.parse(document.currentScript.getAttribute("orderTags"));
const cannotCancelTag = orderTags.includes("cannot-cancel");

const cancelSettings = orderActionSettings?.cancel;
const isCancelToggled = cancelSettings?.is_toggle;
const cancelModalSettings = cancelSettings?.modal_setting;
// Default action button layout
let orderActionContent = `<div class="placeholder-line placeholder-line--100"></div><div class="placeholder-line placeholder-line--90"></div>`;

if (typeof orderId == "number") {
  orderActionContent = `<div class="flex-container">
  <button class="btn button" onclick="showCancelOrderModalHandler()" id="cancel-order-button"> <span class="button-text">Cancel</span></button>`;
}

cancelOrderHandler = async () => {
  const cancelOrderButton = document.querySelector("#cancel-order-button");

  const location = `https://9960-2402-b400-4194-30c6-40f8-bc83-54c6-c3c3.ap.ngrok.io/api/proxy_route/cancel-order`;
  const settings = {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order_id: orderId, shop_name: shopName }), // body data type must match "Content-Type" header
  };

  try {
    cancelOrderButton.classList.add("button--loading");
    cancelOrderButton.classList.add("noHover");

    const response = await fetch(location, settings);

    if (!response.ok) {
      throw new Error("Something went wrong");
    }

    if (response.ok) {
      const data = await response.json();

      cancelOrderButton.classList.remove("button--loading");
      cancelOrderButton.classList.remove("noHover");

      window.location.href = window.location.href;
    }

    return data;
  } catch (e) {
    return e;
  }
};

// Show order actions section when order status is not cancelled, unfulfilled, no cannot-cancel tag and order action settings object is empty or cancel toggle is true
if (
  !cannotCancelTag &&
  unFulfilled &&
  !orderStatus &&
  (Object.keys(orderActionSettings).length == 0 || isCancelToggled)
) {
  Shopify.Checkout.OrderStatus.addContentBox(
    "<h2>Order Actions</h2>",
    `${orderActionContent}`
  );
}

function showCancelOrderModalHandler() {
  const header = cancelModalSettings?.header_text || "Cancel Order";
  const content = cancelModalSettings?.content_text;
  const footer = isUndefined(cancelModalSettings)
    ? cancelModalSettings
    : `<button class="success">${cancelModalSettings?.accept_button_text}</button><button class="cancel alt">${cancelModalSettings?.cancel_button_text}</button>`;

  Modal.confirm(header, content, footer, "cancel", orderId);
}

class Modal {
  constructor(options) {
    let defaults = {
      element: null,
      effect: "zoom",
      state: "closed",
      size: "medium",
      content: null,
      footer: null,
      header: null,
      title: null,
    };
    this.options = Object.assign(defaults, options);

    if (this.options.element == null) {
      this.options.element = document.createElement("div");
      this.options.element.classList.add("custom-modal");
      this.options.element.innerHTML = `
                <div class="container">
                    <div class="header">
                        <button class="close">&times;</button> 
                    </div>
                    <div class="content"></div>
                    <div class="footer">
                        <button class="close">Close</button>
                    </div>
                </div>                        
            `;
      document.body.appendChild(this.options.element);
    }
    this.options.element
      .querySelector(".container")
      .classList.remove("zoom", "slide");
    this.options.element
      .querySelector(".container")
      .classList.add(this.options.effect);
    if (this.options.header != null) {
      this.header = this.options.header;
    }
    if (this.options.content != null) {
      this.content = this.options.content;
    }
    if (this.options.footer != null) {
      this.footer = this.options.footer;
    }
    if (this.options.title != null) {
      this.title = this.options.title;
    }
    this.size = this.options.size;
    this._eventHandlers();
  }

  open() {
    this.options.state = "open";
    this.options.element.style.display = "flex";
    this.options.element.getBoundingClientRect();
    this.options.element.classList.add("open");
    if (this.options.onOpen) {
      this.options.onOpen(this);
    }
  }

  close() {
    this.options.state = "closed";
    this.options.element.classList.remove("open");
    this.options.element.style.display = "none";
    if (this.options.onClose) {
      this.options.onClose(this);
    }
  }

  get state() {
    return this.options.state;
  }

  get effect() {
    return this.options.effect;
  }

  set effect(value) {
    this.options.effect = value;
    this.options.element
      .querySelector(".container")
      .classList.remove("zoom", "slide");
    this.options.element.querySelector(".container").classList.add(value);
  }

  get size() {
    return this.options.size;
  }

  set size(value) {
    this.options.size = value;
    this.options.element.classList.remove("small", "large", "medium", "full");
    this.options.element.classList.add(value);
  }

  get content() {
    return this.options.element.querySelector(".content").innerHTML;
  }

  get contentElement() {
    return this.options.element.querySelector(".content");
  }

  set content(value) {
    if (!value) {
      this.options.element.querySelector(".content").remove();
    } else {
      if (!this.options.element.querySelector(".content")) {
        this.options.element
          .querySelector(".container")
          .insertAdjacentHTML("afterbegin", `<div class="content"></div>`);
      }
      this.options.element.querySelector(".content").innerHTML = value;
    }
  }

  get header() {
    return this.options.element.querySelector(".heading").innerHTML;
  }

  get headerElement() {
    return this.options.element.querySelector(".header");
  }

  set header(value) {
    if (!value) {
      this.options.element.querySelector(".header").remove();
    } else {
      if (!this.options.element.querySelector(".header")) {
        this.options.element
          .querySelector(".container")
          .insertAdjacentHTML("afterbegin", `<div class="header"></div>`);
      }
      this.options.element.querySelector(".header").innerHTML = value;
    }
  }

  get title() {
    return this.options.element.querySelector(".header .title")
      ? this.options.element.querySelector(".header .title").innerHTML
      : null;
  }

  set title(value) {
    if (!this.options.element.querySelector(".header .title")) {
      this.options.element
        .querySelector(".header")
        .insertAdjacentHTML("afterbegin", `<h1 class="title"></h1>`);
    }
    this.options.element.querySelector(".header .title").innerHTML = value;
  }

  get footer() {
    return this.options.element.querySelector(".footer").innerHTML;
  }

  get footerElement() {
    return this.options.element.querySelector(".footer");
  }

  set footer(value) {
    if (!value) {
      this.options.element.querySelector(".footer").remove();
    } else {
      if (!this.options.element.querySelector(".footer")) {
        this.options.element
          .querySelector(".container")
          .insertAdjacentHTML("beforeend", `<div class="footer"></div>`);
      }
      this.options.element.querySelector(".footer").innerHTML = value;
    }
  }

  _eventHandlers() {
    this.options.element.querySelectorAll(".close").forEach((element) => {
      element.onclick = (event) => {
        event.preventDefault();
        this.close();
      };
    });
  }

  static initElements() {
    document.querySelectorAll("[data-modal]").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        let modalElement = document.querySelector(element.dataset.modal);
        let modal = new Modal({ element: modalElement });
        for (let data in modalElement.dataset) {
          if (modal[data]) {
            modal[data] = modalElement.dataset[data];
          }
        }
        modal.open();
      });
    });
  }

  static confirm(header, value, footer, orderAction, orderId) {
    let modal = new Modal({
      content: isUndefined(value) ? "Are you sure to proceed?" : value,
      header: isUndefined(header) ? "" : header,
      footer:
        footer ||
        '<button class="success">OK</button><button class="cancel alt">Cancel</button>',
    });
    modal.footerElement.querySelector(".success").onclick = (event) => {
      event.preventDefault();

      if (orderAction === "cancel") {
        cancelOrderHandler(orderId);
      }

      modal.close();
    };
    modal.footerElement.querySelector(".cancel").onclick = (event) => {
      event.preventDefault();
      modal.close();
    };
    modal.open();
  }

  static alert(value, success) {
    let modal = new Modal({
      content: value,
      header: "",
      footer: '<button class="success">OK</button>',
    });
    modal.footerElement.querySelector(".success").onclick = (event) => {
      event.preventDefault();
      if (success) success();
      modal.close();
    };
    modal.open();
  }

  static prompt(value, def, success, cancel) {
    let modal = new Modal({
      header: "",
      footer:
        '<button class="success">OK</button><button class="cancel alt">Cancel</button>',
    });
    modal.content =
      value +
      `<div class="prompt-input"><input type="text" value="${def}" placeholder="Enter your text..."></div>`;
    modal.footerElement.querySelector(".success").onclick = (event) => {
      event.preventDefault();
      if (success)
        success(
          modal.contentElement.querySelector(".prompt-input input").value
        );
      modal.close();
    };
    modal.footerElement.querySelector(".cancel").onclick = (event) => {
      event.preventDefault();
      if (cancel)
        cancel(modal.contentElement.querySelector(".prompt-input input").value);
      modal.close();
    };
    modal.open();
  }
}

function isUndefined(variable) {
  return typeof variable == "undefined";
}

var styles = `
.flex-container > button {
    background-color: #f1f1f1;
    width: 100%;
    margin: 6px;
    text-align: center;
    line-height: 5px;
  }

  .flex-container {
    display: flex;
    flex-wrap: nowrap;
  }

  @media (max-width: 600px) {
    .flex-container  {
      display: block !important;
      margin-right: 10px;
    }
  }

  .custom-modal { /* Use custom-modal name to avoid css clash with shopify css */
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    left: 0;
    display: none;
    z-index: 999999;
    align-items: center;
    justify-content: center;
  }
  .custom-modal .container {
    display: flex;
    flex-flow: column;
    background-color: #ffffff;
    box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.03);
  }
  .custom-modal .container.zoom {
    transform: scale(0.5);
  }
  .custom-modal .container.slide {
    transform: translateY(-1000px);
  }
  .custom-modal .container .header {
    display: flex;
    padding: 20px;
    font-weight: 600;
    justify-content: space-between;
    border-bottom: 1px solid #e6e9ec;
    align-items: center;
  }
  .custom-modal .container .header h1 {
    font-weight: 500;
    color: #4d4d4d;
    padding: 0;
    margin: 0;
  }
  .custom-modal .container .header button {
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 24px;
    line-height: 24px;
    padding-bottom: 4px;
    cursor: pointer;
    color: #9a9a9a;
  }
  .custom-modal .container .header button:hover {
    color: #676767;
  }
  .custom-modal .container .content {
    padding: 20px 15px;
    flex: 1;
  }
  .custom-modal .container .content .prompt-input input {
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #e6e9ec;
    margin-top: 15px;
    width: 100%;
  }
  .custom-modal .container .footer {
    border-top: 1px solid #e6e9ec;
    background-color: #f9fafc;
    padding: 15px;
    display: flex;
  }
  .custom-modal .container .footer button {
    display: inline-flex;
    appearance: none;
    border: none;
    background-color: #3a75d5;
    color: #ffffff;
    border-radius: 4px;
    padding: 7px 12px;
    font-size: 14px;
    margin-right: 7px;
    cursor: pointer;
  }
  .custom-modal .container .footer button:last-child {
    margin-right: 0;
  }
  .custom-modal .container .footer button:hover {
    background-color: #326fd3;
  }
  .custom-modal .container .footer button.alt {
    font-weight: 500;
    background-color: #dadbdd;
    color: #606266;
  }
  .custom-modal .container .footer button.alt:hover {
    background-color: #d5d6d8;
  }
  .custom-modal .container .footer button.right {
    margin-left: auto;
  }
  .custom-modal.small .container {
    width: 400px;
  }
  .custom-modal.medium .container {
    width: 600px;
  }
  .custom-modal.large .container {
    width: 900px;
  }
  .custom-modal.full .container {
    width: 100%;
    height: 100%;
  }
  .custom-modal.open {
    display: flex;
  }
  .custom-modal.open .container.zoom {
    transform: scale(1);
    transition: all 0.2s ease;
  }
  .custom-modal.open .container.slide {
    transform: translateY(0);
    transition: all 0.5s ease;
  }

  .button {
    position: relative;
    border: none;
    outline: none;
    cursor: pointer;
  }
  
  .button:active {
    background: #808080 !important;
  }
  
  .button-text {
    color: #808080;
    transition: all 0.2s;
  }
  
  .button--loading .button-text {
    visibility: hidden;
    opacity: 0;
  }
  
  .button--loading::after {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    border: 4px solid transparent;
    border-top-color: #505050;
    border-radius: 50%;
    animation: button-loading-spinner 1s linear infinite;
  }
  
  @keyframes button-loading-spinner {
    from {
      transform: rotate(0turn);
    }
  
    to {
      transform: rotate(1turn);
    }
  }

  .noHover{
    pointer-events: none;
  }
`;

var styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
