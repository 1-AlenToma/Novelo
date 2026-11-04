const getOffset = div => {
  div = div.el || div;
  const item = div.getBoundingClientRect();
  item.right = item.width + item.x;
  item.bottom = item.y + item.height;
  return item;
};

const Element = function (type, options) {
  this.el =
    typeof type === "string"
      ? document.createElement(type)
      : type;
  if (options)
    Object.keys(options).forEach(x => {
      if (this.el.style[x] !== undefined)
        this.el.style[x] = options[x];
      else this.el[x] = options[x];
    });
  this.counter = 10;
  this.val = value => {
    const isv =
      ["input", "textarea"].indexOf(
        this.el.tagName.toLowerCase()
      ) !== -1;
    if (value != undefined) {
      if (!isv) this.el.innerHTML = value;
      else this.el.value = value;
    }

    if (isv) return this.el.value;
    return this.el.innerHTML;
  };

  this.event = (name, func) => {
    name.split(",").forEach(x => {
      this.el.addEventListener(x, func);
    });
    return this;
  };

  this.attr = (key, value) => {
    if (value !== undefined)
      this.el.setAttribute(key, value);
    return this.el.getAttribute(key);
  };

  this.setAttr = (key, value) => {
    this.attr(key, value);
    return this;
  };

  function getStyle(el, cssprop) {
    if (el.currentStyle)
      //IE
      return el.currentStyle[cssprop];
    else if (
      document.defaultView &&
      document.defaultView.getComputedStyle
    )
      //Firefox
      return document.defaultView.getComputedStyle(
        el,
        ""
      )[cssprop];
    //try and get inline style
    else return el.style[cssprop];
  }

  this.styleValue = (...items) => {
    let item = {};
    items.forEach(k => {
      item[k] = getStyle(this.el, k);
    });

    return item;
  };

  this.css = options => {
    Object.keys(options).forEach(x => {
      this.el.style[x] = options[x];
    });
    return this;
  };

  this.offset = () => {
    return getOffset(this.el);
  };

  this.getEl = item => {
    return item && item.el ? item.el : item;
  };

  this.appendTo = parent => {
    this.getEl(parent).appendChild(this.el);
    return this;
  };

  this.add = (...contents) => {
    contents.forEach(content => {
      if (content) {
        if (typeof content == "string") {
          const c = document.createElement("div");
          c.innerHTML = content;
          content = c;
        }

        if (content.el === undefined)
          this.el.appendChild(content);
        else this.el.appendChild(content.el);
      }
    });

    return this;
  };

  this.prepend = content => {
    if (typeof content == "string") {
      const c = document.createElement("div");
      c.innerHTML = content;
      content = c;
    }

    if (content.el === undefined)
      this.el.prepend(content);
    else this.el.prepend(content.el);
  };

  this.insertAfter = c => {
    c = c.el === undefined ? c : c.el;
    c.appendChild(this.el);
    c.parentNode.insertBefore(
      this.el,
      c.nextSibling
    );
    return this;
  };

  this.insertBefore = c => {
    c = c.el === undefined ? c : c.el;
    c.appendChild(this.el);
    c.parentNode.insertBefore(
      this.el,
      c.previousSibling
    );
    return this;
  };

  this.classList = () => this.el.classList;

  this.slideDown = (offset, Onfinished) => {
    const firstrun = offset == undefined;
    if (firstrun) {
      this.classList().remove("hidden");
      offset = offset || this.offset();
      this.css({
        top:
          "-" + (offset.y + offset.height) + "px",
        opacity: 1
      });
    }
    const coffset = this.offset();
    setTimeout(() => {
      if (coffset.y < offset.y) {
        this.css({
          top:
            Math.min(
              coffset.y + this.counter,
              offset.y
            ) + "px"
        });
        this.slideDown(offset, Onfinished);
      } else {
        if (Onfinished) Onfinished();
      }
    }, 0);
  };

  this.slideUp = (y, onfinished) => {
    const offset = this.offset();
    y = y || -(offset.y + offset.height);
    setTimeout(() => {
      if (offset.y > y) {
        y += this.counter;
        this.css({
          top: offset.y - this.counter + "px"
        });
        this.slideUp(y, onfinished);
      } else {
        this.classList().add("hidden");
        if (onfinished) onfinished();
      }
    }, 0);
  };

  this.show = (ms, max, op) => {
    ms = ms || 1;
    max = max || 1;
    if (op === undefined) {
      this.css({
        opacity: 0
      });
      op = 0;
      this.classList().remove("hidden");
    }
    setTimeout(() => {
      op += 0.01;
      if (op <= max) {
        this.css({
          opacity: op
        });
        this.show(ms, max, op);
      }
    }, ms);
  };

  this.hide = (ms, op) => {
    ms = ms || 1;
    op =
      op ||
      parseFloat(
        this.styleValue("opacity").opacity
      );
    setTimeout(() => {
      op -= 0.01;
      if (op >= 0) {
        this.css({
          opacity: op
        });
        this.hide(ms, op);
      } else this.classList().add("hidden");
    }, ms);
  };

  this.find = path => {
    return new Element(
      this.el.querySelector(path)
    );
  };

  this.findAll = path => {
    return [
      ...this.el.querySelectorAll(path)
    ].map(x => new Element(x));
  };
};
function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}
async function postMessage(msg, args) {
  try {
    while (
      window.ReactNativeWebView == undefined ||
      window.ReactNativeWebView.postMessage ==
        undefined
    )
      await wait(100);
    await window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: msg, data: args })
    );
  } catch (e) {
    postMessage(
      "error",
      msg + "-" + e.toString()
    );
  }
}
window.postmsg = postMessage;
window.ctx = function ContextMenu(options) {
  if (document.querySelector("context"))
    document.querySelector("context").remove();
  this.xmenu = new Element("context", {
    className: "hidden contextMenuTag"
  }).appendTo(document.body);
  const getContainer = () =>
    document.querySelector(options.selector);
  let menu = this.xmenu.el;
  this.menuState = 0;
  this.btn = [];
  options.rows.forEach(x => {
    let group = new Element("div").appendTo(
      this.xmenu
    );
    x.cols.forEach(c => {
      let txt = "";
      if (c.icon) {
        txt += `<span class="material-symbols-outlined">${c.icon}</span>`;
      }
      if (c.text) txt += c.text;
      let style = {};
      if (c.style) {
        style = c.style;
      }

      new Element("a", {
        innerHTML: txt,
        ...style
      })
        .appendTo(group.el)
        .event("click", function () {
          let selection = getSelectionText();
          postMessage("menu", {
            item: c,
            selection
          });
          clear();
        });
    });
  });
  let pageY = 0;
  let pageX = 0;
  let timeout = undefined;

  let onchange = event => {
    this.xmenu.el.classList.add("hidden");
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      let selection = getSelectionText();
      if (
        selection &&
        selection.length > 0 &&
        /\S/.test(selection)
      ) {
        positionMenu(event);
        toggleMenuOn();
      } else toggleMenuOff(event);
    }, 500);
  };

  window.document.oncontextmenu = event => {
    event.preventDefault();

    pageY = event.pageY || event.clientY;
    pageX = event.pageX || event.clientX;
    onchange(event);
  };

  window.document.onselectionchange = event => {
    onchange(event);
  };

  window.document.onclick = e => {
    let target = e.target;
    if (
      !target.classList.contains(
        "contextMenuTag"
      ) &&
      !target.closest("context")
    ) {
      toggleMenuOff(e);
    }
  };

  // Close Context Menu on Esc key press
  window.onkeyup = function (e) {
    if (e.keyCode === 27) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenuOff();
    }
  };

  const toggleMenuOn = () => {
    if (
      this.menuState !== 1 ||
      this.xmenu.classList().contains("hidden")
    ) {
      this.menuState = 1;
      this.xmenu.show();
    }
  };

  // Turns the custom context menu off.
  const toggleMenuOff = e => {
    if (
      this.menuState !== 0 ||
      !this.xmenu.classList().contains("hidden")
    ) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.menuState = 0;
      this.xmenu.hide();
    }
  };

  function getSelectionText() {
    var text = "";
    if (window.getSelection) {
      text = window.getSelection().toString();
    } else if (
      window.document.selection &&
      window.document.selection.type != "Control"
    ) {
      text =
        window.document.selection.createRange()
          .text;
    }
    return text;
  }

  function clear() {
    if (window.getSelection) {
      if (window.getSelection().empty) {
        // Chrome
        window.getSelection().empty();
      } else if (
        window.getSelection().removeAllRanges
      ) {
        // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {
      // IE?
      document.selection.empty();
    }
  }

  function positionMenu(e) {
    let clickCoords = getPosition(e);
    let clickCoordsX = clickCoords.x;
    let clickCoordsY = clickCoords.y;
    let menuWidth = menu.offsetWidth + 4;
    let menuHeight = menu.offsetHeight + 50;
    let cn = getContainer();

    let windowWidth = (cn || window).offsetWidth;
    let windowHeight = (cn || window)
      .offsetHeight;
    let sch = screen.height;

    if (clickCoordsX + menuWidth > windowWidth) {
      menu.style.left =
        windowWidth - menuWidth + "px";
    } else {
      menu.style.left = clickCoordsX + "px";
    }
    if (clickCoordsY - menuHeight < 0) {
      menu.style.top =
        clickCoordsY + menuHeight / 2 + "px";
    } else
      menu.style.top =
        clickCoordsY - menuHeight + "px";
    return;
    menu.style.top =
      clickCoordsY -
      (clickCoordsY > menuHeight
        ? menuHeight
        : 0) +
      "px";
  }

  function getPosition(e) {
    var posx = 0;
    var posy = 0;

    if (!e) var e = window.event;
    let py = pageY - window.scrollY;
    let px = pageX - window.scrollX;

    //let offset = getOffset(sc);
    return {
      x: px,
      y: py
    };
  }
};
window.events = {};
window.ctm = undefined;
window.bookSlider = undefined;
window.slider = function (options) {
  const {
    id,
    hasNext,
    hasPrev,
    prevText,
    nextText
  } = options;
  let item = document.getElementById(id);
  item.classList.add("sliderActive");
  const clone = text => {
    return new Element("div", {
      className: "sliderTemp"
    });
    let cloned = item.cloneNode(true);
    cloned.classList.remove("sliderActive");
    cloned.classList.add("sliderTemp");
    cloned.id = "";
    return new Element(cloned);
  };
  if (
    document.getElementById("sliderContainer")
  ) {
    document
      .getElementById("sliderContainer")
      .remove();
  }
  this.container = new Element("div", {
    id: "sliderContainer"
  }).appendTo(document.body);
  this.slider = new Element("div", {
    id: "slider"
  })
    .add(
      hasPrev ? clone(prevText) : undefined,
      item,
      hasNext ? clone(nextText) : undefined
    )
    .appendTo(this.container);

  this.index = hasPrev ? 1 : 0;
  this.scrollLeft = 0;
  this.startLeft = 0;
  this.disabled = false;
  this.blur = new Element("blur", {
    innerHTML: `<p>${nextText}</p>`,
    className: "hidden blurText"
  })
    .event("click", () => {
      this.blur.el.classList.add("hidden");
    })
    .appendTo(document.body);
  this.touched = false;
  let blurTimer = undefined;
  this.slider
    .event(
      "touchstart",
      () => (this.touched = true)
    )
    .event("touchend", () => {
      this.touched = false;
      clearTimeout(blurTimer);
      blurTimer = setTimeout(() => {
        this.blur.el.classList.add("hidden");
      }, 300);
    });

  const scrollHandler = e => {
    if (
      window.ctm &&
      window.ctm.menuState === 1
    ) {
      this.slider.el.scrollLeft = this.scrollLeft;
      this.blur.el.classList.add("hidden");
      return;
    }

    let width =
      this.slider.el.children[0].offsetWidth;
    var atSnappingPoint =
      e.target.scrollLeft %
        e.target.offsetWidth ===
      0;
    let index = Math.round(
      e.target.scrollLeft / width
    );

    this.startLeft =
      this.slider.el.children[
        this.index
      ].offsetLeft;
    var timeOut = atSnappingPoint ? 0 : 300; //see notes
    let pos =
      e.target.scrollLeft - this.scrollLeft;
    if (
      index === this.index &&
      this.touched &&
      this.scrollLeft > 0 &&
      Math.abs(pos) > 50
    ) {
      if (pos > 0)
        this.blur.find("p").val(nextText);
      else if (
        e.target.scrollLeft < this.startLeft
      )
        this.blur.find("p").val(prevText);
      this.blur.el.classList.remove("hidden");
    }

    clearTimeout(e.target.scrollTimeout); //clear previous timeout

    e.target.scrollTimeout = setTimeout(() => {
      this.scrollLeft = e.target.scrollLeft;

      //using the timeOut to evaluate scrolling state
      if (this.startLeft == 0)
        this.startLeft = e.target.scrollLeft;
      if (this.touched || this.disabled) return;
      if (index > this.index) {
        this.disabled = true;
        postMessage("Next", true);
      } else if (this.index > index) {
        this.disabled = true;
        postMessage("Prev", true);
      }
      this.blur.el.classList.add("hidden");
      this.index = index;
    }, timeOut);
  };
  this.slider.el.addEventListener(
    "scroll",
    scrollHandler
  );

  this.slider.el.children[
    this.index
  ].scrollIntoView();
  window.bookSlider = this;
};

const regChar = (
  `”“-=%+*<>|/[]{}()$#!!&?,":;..'’‘ _` + "`"
)
  .split("")
  .map(x => `\\${x}`)
  .join("|");
window.highlight = function (options) {
  var inputText = document.querySelector(
    options.selector
  );
  if (!options.text)
    options.text = inputText.innerText;
  let spanStart =
    "<span style class='highlight hiText'>#</span>".replace(
      "style",
      options.all
        ? "style='padding:0px;border-radius:0px;display:inline;'"
        : ""
    );

  let container = "<p>#</p>";

  var innerHTML = options.text;
  let char = "";
  while (
    options.length + 1 < innerHTML.length &&
    new RegExp(regChar, "gmi").test(
      (char =
        innerHTML[
          options.index + options.length
        ] || "")
    )
  ) {
    options.length++;
  }
  let selectedText = innerHTML.substring(
    options.index,
    options.index + options.length
  );
  let startText = innerHTML.substring(
    0,
    options.index
  );

  if (options.all)
    startText = spanStart.replace("#", startText);

  innerHTML =
    startText +
    spanStart.replace("#", selectedText) +
    innerHTML.substring(
      options.index + options.length
    );
  inputText.innerHTML = innerHTML;
  if (options.scroll === false) return;
  let lastH = inputText.querySelector(
    ".highlight:last-child"
  );

  if (lastH) {
    lastH.parentNode.scrollTop = lastH.offsetTop;
  }
};

window.cleanStyle = function (id) {
  try {
    let item = new Element(
      document.getElementById(id)
    );

    item.findAll("[style]").forEach(x => {
      if (!x.el.classList.contains("custom")) {
        x.css({
          background: null,
          backgroundColor: null,
          fontFamily: null,
          color: null,
          fontSize: null,
          lineHeight: null,
          textAlign: null,
          fontWeight: null
        });
      }
    });
  } catch (e) {
    console.error(e);
  }
};

window.loadData = function (data) {
  try {
    switch (data.type) {
      case "content":
        window.ctm = new window.ctx(
          data.data.menuItems
        );
        break;
      case "style":
        let st = document.getElementById(
          "customStyle"
        );
        if (st) st.remove();
        st = document.createElement("style");
        st.id = "customStyle";
        st.appendChild(
          document.createTextNode(data.data)
        );
        document.head.appendChild(st);
        break;
      case "font":
        let stf =
          document.getElementById("customFont");
        if (stf) stf.remove();
        stf = document.createElement("style");
        stf.id = "customFont";
        stf.appendChild(
          document.createTextNode(data.data)
        );
        document.head.appendChild(stf);
        break;
      case "scrollTop":
        window.scroll(0, data.data);
        break;
      default:
        // code
        break;
    }
    if (
      window.events &&
      window.events[data.type]
    ) {
      window.events[data.type]();
    }
  } catch (e) {
    postMessage("error", {
      msg: e.message,
      data
    });
  }
};

function binder() {
  window.onclick = () => {
    if (window.ctm && window.ctm.menuState === 1)
      return;
    postMessage("click", true);
  };
  window.addEventListener("scroll", e => {
    for (let key in window.events) {
      if (key.indexOf("scroll") !== -1)
        window.events[key](e);
    }
  });
  window.onmessage = async function (event) {
    try {
      var data = JSON.parse(event.data);
      window.loadData(data);
    } catch (e) {
      postMessage("error", e.message);
    }
  };
}
window.binder = binder;
