QuickModal.elements = [];

function QuickModal(options = {}) {
	this.opt = Object.assign(
		{
			footer: false,
			cssClass: [],
			destroyOnClose: true,
			closeMethods: ["button", "overlay", "escape"],
		},
		options
	);

	this.template = document.querySelector(`#${this.opt.templateId}`);

	const { closeMethods } = this.opt;
	this._closeButtonMethod = closeMethods.includes("button");
	this._closeOverlayMethod = closeMethods.includes("overlay");
	this._closeEscapeMethod = closeMethods.includes("escape");
	this._buttonList = [];

	this._handleEscapeKey = this._handleEscapeKey.bind(this);
}

// Build modal element
QuickModal.prototype._build = function () {
	const content = this.template.content.cloneNode(true);

	this._backdrop = document.createElement("div");
	this._backdrop.classList.add("quickModal__backdrop");

	const container = document.createElement("div");
	container.classList.add("quickModal__container");

	// Add more cssClass
	this.opt.cssClass.forEach((cssClass) => {
		container.classList.add(cssClass);
	});

	// Close Button Method
	if (this._closeButtonMethod) {
		const closeBtn = this._createButton(
			"&times;",
			"quickModal__close",
			() => this.close()
		);

		container.append(closeBtn);
	}

	const modalContent = document.createElement("div");
	modalContent.classList.add("quickModal__content");
	modalContent.append(content);

	container.append(modalContent);

	// FOOTER MODAL
	if (this.opt.footer) {
		this._modalFooter = document.createElement("div");
		this._modalFooter.classList.add("quickModal__footer");

		this._renderFooterContent();

		this._renderFooterButton();

		container.append(this._modalFooter);
	}
	0;
	this._backdrop.append(container);
	document.body.append(this._backdrop);
};

// Escape close
QuickModal.prototype._handleEscapeKey = function (e) {
	const lastModal = QuickModal.elements[QuickModal.elements.length - 1];
	if (e.key === "Escape" && this === lastModal) {
		this.close();
	}
};

// OPEN MODAL
QuickModal.prototype.open = function () {
	QuickModal.elements.push(this);

	if (!this._backdrop) {
		this._build();
	}

	// Disable scrolling
	document.body.classList.add("quickModal--no-scroll");
	document.body.style.paddingRight = this._handleScrollWidth() + "px";

	setTimeout(() => {
		this._backdrop.classList.add("quickModal--show");
	}, 0);

	this._handleTranstionEnd(this.opt.onOpen);

	// // Overlay close
	if (this._closeOverlayMethod) {
		this._backdrop.onclick = (e) => {
			if (e.target === this._backdrop) {
				this.close();
			}
		};
	}

	// Escape close
	if (this._closeEscapeMethod) {
		document.addEventListener("keydown", this._handleEscapeKey);
	}

	return this._backdrop;
};

// Function handle transition
QuickModal.prototype._handleTranstionEnd = function (callBack, destroy) {
	this._backdrop.ontransitionend = (e) => {
		if (e.propertyName !== "opacity") return;
		if (typeof callBack === "function") callBack();
		if (destroy && this._backdrop) {
			this._backdrop.remove();
			this._backdrop = null;
			this._footerContent = null;
		}
	};
};

// Method setFooterContent
QuickModal.prototype.setFooterContent = function (footerContent) {
	this._footerContent = footerContent;
	this._renderFooterContent();
};

// Method addFooterButton
QuickModal.prototype.addFooterButton = function (title, cssClass, callback) {
	const btn = this._createButton(title, cssClass, callback);
	this._buttonList.push(btn);

	this._renderFooterButton();
};

QuickModal.prototype._renderFooterContent = function () {
	if (this._modalFooter && this._footerContent) {
		this._modalFooter.innerHTML = this._footerContent;
	}
};

QuickModal.prototype._renderFooterButton = function () {
	if (this._modalFooter) {
		this._buttonList.forEach((button) => {
			this._modalFooter.append(button);
		});
	}
};

// Create button element
QuickModal.prototype._createButton = function (title, cssClass, callback) {
	const btn = document.createElement("button");
	btn.className = cssClass;
	btn.innerHTML = title;
	btn.onclick = callback;

	return btn;
};

// CLOSE MODAL
QuickModal.prototype.close = function (destroy = this.opt.destroyOnClose) {
	this._backdrop.onclick = null;
	QuickModal.elements.pop();
	document.removeEventListener("keydown", this._handleEscapeKey);
	this._backdrop.classList.remove("quickModal--show");

	this._handleTranstionEnd(this.opt.onClose, destroy);

	// Enable scrolling
	if (!QuickModal.elements.length) {
		document.body.classList.remove("quickModal--no-scroll");
		document.body.style.paddingRight = "";
	}
};

// DESTROY MODAL
QuickModal.prototype.destroy = function () {
	this.close(true);
};

// Handle Scroll Width
QuickModal.prototype._handleScrollWidth = function () {
	if (this._handleScrollWidth.value) return this._handleScrollWidth.value;

	const scrollElement = document.createElement("div");
	Object.assign(scrollElement.style, {
		overflow: "scroll",
		position: "absolute",
		bottom: "9999px",
	});
	document.body.append(scrollElement);

	const scrollWidth = scrollElement.offsetWidth - scrollElement.clientWidth;

	this._handleScrollWidth.value = scrollWidth;

	return scrollWidth;
};
