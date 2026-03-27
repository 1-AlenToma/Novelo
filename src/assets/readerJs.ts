export const CSSStyle = /*css */`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        br{
            display:none !important;
        }

        td {
            padding-left:5px;
        }

        body,
        html {
            margin: 0;
            padding: 0;
            overflow: hidden;
            height: 100vh;
            display: block;
            position: relative;
            scroll-behavior: smooth;
        }

        div{
            display: block;
            unicode-bidi: isolate;
        }

        .selection-menu {
            position: fixed;
            background: white;
            border-radius: 8px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
            padding: 5px;
            display: none;
            z-index: 1000;
            white-space: nowrap;
        }

        .menu-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 14px;
            color:#000;
        }

        .menu-item .material-symbols-outlined {
            margin-right: 6px;
        }

        .menu-item:hover {
            background: #f0f0f0;
        }

        #chapter {
            display: flex;
            height: 100vh;
            overflow: hidden;
        }

        /* Slider container */
        .slider-container {
            width: 100vw;
            /* Full viewport width */
            height: 99%;
            /* Full viewport height */
            overflow-x: auto;
            position: relative;
            background-color: #f4f4f4;
            display: block;
            padding: 0;

            margin: 0;
        }

        .slider {
            display: block;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            padding: 0;
            margin: 0;

        }

        .unset{
               display: flex;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            padding: 0;
            margin: 0;
        }

        .sliderView {
            display: block;
            width: 100vw;
            min-height: 10%;
            overflow: hidden;
            overscroll-behavior-y: contain;
            /* Full viewport width */
            /*  height: 100vh; /* Full viewport height */

        }

        .sliderView>*:not(img) {
            display: block;
            position: relative;
            text-wrap: wrap;
            text-wrap-style: balance;
            word-break: break-word;
            white-space: initial;
            width:100%;
        }

        .emptyView {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .emptyView p {
            font-size: 150%;
            font-weight: bold;
            text-shadow: #000000 1px 0 10px;
            text-align:center !important;
        }

        table {
            border-collapse: collapse;
            border-spacing: 0;
            width: 100%;
            border: 1px solid #ddd;
        }

        .scrollableWrapper {
            display: block;
            max-height: 90vh;
            overflow: hidden;
        }

        .scrollableX {
            overflow-x: auto !important;
            width: 100vw;
        }


        .manga-page {
         transition: transform 0.25s ease;
         transform-origin: center;
         cursor: zoom-in;
         touch-action: pan-x pan-y pinch-zoom;
         overscroll-behavior-y: contain;
    }

.progressBar{
  width:80%;
  height: 30px;
  display: flex;
  border: 1px solid #CCC !important;;
  border-radius: 5px;
  overflow: hidden;
  text-align: center;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color:blue !important;
  margin: auto;
  position: fixed;
  top:55%;
  left:10%;
  z-index: 10000;
  background: #FFF !important;
}

.progressBar span{
    z-index: 2;
}

.progressBar > div{
  width: 50%;
  transition: width 0.5s ease;
  height: 100%;
  background: green !important;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}
  
.lazy {
  position: relative;
  width: 100%;
  height: 35px;
}

/* spinner */
.lazy::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  margin: -15px;
  border: 3px solid #ccc;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* image */
.lazy img {
  object-fit: cover;
  transition: opacity 0.3s ease;
  display: none;
}

/* loaded */
.lazy.loaded::before {
  display: none;
}

.lazy.loaded img {
  display: block !important;
}

/* error state */
.lazy.error::before {
  display: none;
}

.lazy .retry {
  display: none;
  position: absolute;
  inset: 0;
  margin: auto;
  width: 80px;
  height: 30px;
  cursor: pointer;
  border-radius: 5px;
  text-align:center;
  border: 1px solid #CCC !important;
}

.lazy .retry:active{
  border: 1px solid #CCC;
   transform: scale(0.95);
}

.lazy.error .retry {
  display: block;

}

.lazy.loaded{
  height:auto !important;
}

.lazy.loaded > .retry{
  display: none !important;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}`


export const JS = /*js*/`
    window.fetchControllers = {};
// Abort a specific fetch by URL
window.abortFetch = (url) => {
    const controller = window.fetchControllers[url];
    if (controller) {
        controller.abort();
        delete window.fetchControllers[url];
    }
};

// Abort all ongoing fetches
window.abortAllFetches = () => {
    for (const url in window.fetchControllers) {
        window.fetchControllers[url].abort();
    }
    window.fetchControllers = {};
};
    let mangaPage = {
    page: undefined,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    getPoint: (e) => {
        if (e.touches && e.touches.length) {
            return {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
        return {
            x: e.clientX,
            y: e.clientY
        };
    }
}
let div = undefined;
let chapter = undefined;
let keyDown = false;
let rendering = false;
let selectionMenu = undefined;
let snapToNearest = undefined;
let snapToCenter = undefined;
let scrollabeView = undefined;
let scrollPerview = undefined;
let options = {
    style: {
        textAlign: "center",
        alignItems: "center",
        fontSize: 25,
    },
    viewStyle: {
        paddingLeft: 24,
        paddingRight: 24,
    },
    scrollDisabled: false,
    scrollValue: 100,
    onscroll: undefined,
    scrollPercentageValue: undefined,
    scrollType: "Pagination", // "Pagination | Scroll | Player | PaginationScroll",
    onEnd: undefined, // next
    onStart: undefined, // eg prev
    addPrev: true,
    addNext: true,
    prevText: "Previous Chapter",
    nextText: "Next Chapter",
    content: 'document.getElementById("chapter").innerHTML',
    menu: {
        items: [{
                text: "Copy",
                icon: "content_copy"
            },
            {
                text: "Paste",
                icon: "content_paste"
            },
            {
                text: "Bold",
                icon: "format_bold"
            }
        ],
        minlength: 2,
        click: function(item) {
            // alert(item.text);
        }
    }

}

const getProgress = (startValue, max = 100) => {
    let loader = document.createElement("div");
    loader.className = "progressBar"
    loader.innerHTML = "<span>20%</span><div></div>";
    let value = startValue
    loader.max = max;
    loader.querySelector("span").setAttribute("style", "color:blue !important;")
    Object.defineProperty(loader,"value",{
      get:()=> value,
      set:(x)=> {
        if (value >= max)
          return;
        value = x;
        loader.querySelector("span").innerText =(value + "/" + max)
        loader.querySelector("div").style.width = ((value / max) * 100) + "%"
      }
    })
    loader.value = startValue;
    document.body.appendChild(loader);
    return loader;
}

const setId = (img) => {
    if (img && (img.id == null || img.id.length <= 0)) {
        img.id = window.getId();
        img.setAttribute("id", img.id);
    }
}

window.fetchImage = async (url, img) => {
    let base64 = {};
    // Create a new controller for this request
    const controller = new AbortController();
    const signal = controller.signal;

    // Save it in the controllers map
    window.fetchControllers[url] = controller;

    try {
        if (window.__DEV__) window.postmsg("info", "JsFetch:" + url);

        const response = await fetch(url, {
            method: "GET",
            headers: { "Accept": "application/json" },
            signal
        });

        base64 = await response.text();
        const data = base64.split("|");
        base64 = { cn: data[0], id: data[1], src: data[2] };

        if (img) return base64;
        window.renderImage([base64]);
    } catch (e) {
        if (e.name === "AbortError") {
            window.postmsg("warn", "Fetch aborted for: " + url);
        } else {
            window.postmsg("warn", { msg: e.toString(), url });
        }
        return undefined;
    } finally {
        // Clean up the controller after the fetch is done
        delete window.fetchControllers[url];
    }
};


const addString = (...data) => {
    return data.join("");
}

const validateJson = (jsonItem) => {
    for (let key in jsonItem) {
        let item = jsonItem[key];
        if (typeof item == "string" && item.indexOf("#Func") != -1) {
            jsonItem[key] = eval(item.replace("#Func", "").trim())
        } else if (typeof item == "object") {
            validateJson(item);
        }
    }
    return jsonItem;
}

const trySplit = function(htmlString) {
    if (["<div", "<table", "<img"].find(x => htmlString.indexOf(x) != -1))
        return undefined;
    const p = document.createElement("p");
    p.innerHTML = htmlString;
    if (p.querySelector(".custom"))
        return undefined;
    let txt = p.innerText;
    txt = txt.replace(/\\b(mr|Mrs|Ms|Miss|dr|Mt)((\\s+)?(\\.)(\\s+)?)/gi, "$1.");
    let regex1 = /([.!])\\s(?=[A-Z])/g;
    let index = 0;
    let validIndex = txt.length / 2;
    while ((array1 = regex1.exec(txt)) !== null) {
        if (regex1.lastIndex >= validIndex) {
            index = regex1.lastIndex;
            break;
        }
    }

    if (index == 0 || index >= txt.length - 10)
        return undefined;

    let items = [txt.substring(0, index), txt.substring(index)].filter(x => x && x.trim().length > 0).map(x => addString("<p>", x, "</p>"));
    if (items.length < 2)
        return undefined;
    return items;
}

const cleanHtml = (html) => {
    const item = document.createElement("div");
    item.innerHTML = html;
    item.querySelectorAll("script,style,iframe, input, button, select").forEach(x => x.remove());
    return item.innerHTML;

}

const validTags = "img p h1 h2 h3 h4 h5 h6".split(" ").map(x => x.toUpperCase());
const extractHtml = (html) => {
    let result = [];
    if (typeof html == "string") {
        const item = document.createElement("div");
        item.innerHTML = html;
        html = item;
    }

    if (Array.isArray(html) && typeof html !== "string")
        html.forEach(x => result.push(...extractHtml(x)));
    if (validTags.includes(html.tagName) || html.classList?.contains("scrollableWrapper")) {
        result.push(html);
    } else {
        if (html.nodeName == "#text") {
            let txt = html.textContent || html.innerText || html.data || "";
            let p = document.createElement("p");
            p.innerHTML = txt;
            if (txt.trim().length > 0)
                result.push(p);
            return result;
        }
        if (html.childNodes.length > 0) {
            [...html.childNodes].forEach(x => result.push(...extractHtml(x)));
        }
    }

    return result;
}

const getElements = (html) => {
    try {
        let element = document.createElement("div");
        element.innerHTML = html;
        element.querySelectorAll("table").forEach(x => {
            // create wrapper container
            var wrapper = document.createElement('div');
            wrapper.className = "scrollableWrapper";
            wrapper.style.overflowX = "auto";
            wrapper.style.wordBreak = "keep-all";

            // insert wrapper before el in the DOM tree
            x.parentNode.insertBefore(wrapper, x);

            // move el into wrapper
            wrapper.appendChild(x);
        });


        if (options.scrollType == "Pagination")
            return extractHtml(element);

        return element.innerHTML;
    } catch (e) {
        alert(e);
        throw e
    }
}
        window.imageRetry = (event, btn) => {
            btn.parentNode.classList.remove('error', 'loaded');
            const img = btn.parentElement.querySelector("img");
            
            const src = addString(img.getAttribute("src").replace(/\\?(\\s)?time(\\s)?=.*/ig, "").trim(), "?time=", Date.now());
            img.setAttribute("src", src);
            event.preventDefault();
            event.stopPropagation();
        };

        const loadImages =(view, option)=>{
            if (typeof view == "string") {
                  const item = document.createElement("div");
                  item.innerHTML = view;
                  view = item;
             } else return view;
             const imgs = Array.from(view.querySelectorAll("img"));
             for (let img of imgs) 
                {
                    setId(img);
                    const src = img.getAttribute("src") || "";
                    if (src.length > 0 && !src.startsWith("data:")) {
                        img.src = addString(document.body.getAttribute("imageAddress"), "/", encodeURIComponent(src), "/", img.id);
                        if (option.type== "Manga"){
                            const imgContainer = document.createElement("div");
                            imgContainer.className = "lazy";
                            img.replaceWith(imgContainer);
                            imgContainer.appendChild(img);
                            img.setAttribute("onload", "this.parentNode.classList.add('loaded')");
                            img.setAttribute("onerror", "this.parentNode.classList.add('error')");
                            const btnRetry = document.createElement("div");
                            btnRetry.className = "retry";
                            btnRetry.innerHTML = "Retry";
                            btnRetry.setAttribute("onclick", "window.imageRetry(event, this)");
                            imgContainer.appendChild(btnRetry);
                        }
                    }
                }
                return view.innerHTML;
        }

      

const pageSleeper = (ms) => new Promise(r => setTimeout(r, ms))
let createTimer = undefined;
const create = async (option) => {


    try {
        validateJson(option);
        rendering = false;
        options = option;
        document.body.innerHTML = "";
        div = document.createElement("div");
        div.style.zIndex = 1;
        div.id = "chapter";
        div.className = "novel";
        document.body.appendChild(div);
        option.content =loadImages(cleanHtml(option.content), option) ;
        chapter = getElements(option.content);

        let text = option.scrollType == "Pagination" ? chapter.map(x => x.outerHTML) : chapter;

        const sliderContainer = scrollabeView = document.createElement("div");
        const slider = document.createElement("div");
        slider.className = "slider";
        sliderContainer.className = "slider-container";

        div.appendChild(sliderContainer);
        sliderContainer.appendChild(slider);

        const bottomPadding = 30;
        let scrollTimer = undefined;
        let index = 0;
        for (let k in option.style)
            slider.style[k] = option.style[k] + (typeof option.style[k] == "number" ? "px" : "");

        const createView = () => {
            const view = document.createElement("div");
            view.className = "sliderView";
            for (let k in option.viewStyle)
                view.style[k] = option.viewStyle[k] + (typeof option.viewStyle[k] == "number" ? "px" : "");

            return view;
        }


 

        const createScrollPreview = () => {
            scrollPerview = document.createElement("div");
            scrollPerview.className = "ScollPreview";
            let style = {
                position: "fixed",
                left: "0px",
                top: "10%",
                height: "50px",
                width: "100vw",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#000",
                color: "white",
                fontWeight: "bold",
                fontSize: "18px",
                opacity: 0.8,
                paddingTop: "5px",
                paddingBottom: "5px",
                textShadow: "2px 2px 2px red"

            }

            for (let k in style)
                scrollPerview.style[k] = style[k] + (typeof style[k] == "number" && k != "opacity" ? "px" : "");
            scrollPerview.innerHTML = "Next Page";
            if (["Pagination", "PaginationScroll", "Player"].includes(option.scrollType))
                document.body.appendChild(scrollPerview)
        }
        createScrollPreview();

        if (option.addPrev && ["Pagination", "PaginationScroll", "Player"].includes(option.scrollType)) {
            const mock = createView();
            mock.classList.add("emptyView");
            mock.innerHTML = addString("<p>", option.prevText, "</p>");
            slider.appendChild(mock);
        }

        const createMock = () => {
            try {
                const height = Math.min(window.innerHeight, sliderContainer.clientHeight, div.clientHeight) - (bottomPadding);
                const mock = createView();
                mock.classList.add("HTMLcontent");
                mock.classList.add(option.type.toLowerCase() + "-page");
                let viewHeight = 0;
                slider.appendChild(mock);
                if (option.scrollType == "Pagination") {
                    const size = () => {
                        let h = mock.getBoundingClientRect();
                        return (viewHeight = Math.max(mock.offsetHeight, h.height))
                    }

                    while (size() < height && index < text.length) {
                        let old = mock.innerHTML;
                        mock.innerHTML += text[index];
                        if (size() < height)
                            index++;
                        else {
                            if (mock.children.length > 1)
                                mock.innerHTML = old;
                            else {
                                let splittedText = trySplit(text[index]);
                                if (splittedText) {
                                    text.splice(index, 1, ...splittedText);
                                    mock.innerHTML = old;
                                    continue;
                                }

                                index++;
                                mock.style.overflowY = "auto";
                                mock.style.maxHeight = "100%";

                            }
                            break;
                        }
                    }
                    if (index < text.length)
                        createMock();
                } else {
                    mock.innerHTML = text;
                    // mock.style.minHeight = option.scrollValue + "px";
                    if (!["Player", "PaginationScroll"].includes(option.scrollType)) {
                        slider.classList.remove("slider");

                        mock.classList.remove("manga-page");
                        scrollabeView.classList.add(option.type.toLowerCase() + "-page");
                        if (option.type == "Manga")
                            mock.style.minHeight = (option.scrollValue) + "px"
                        //  slider.classList.add("unset");

                    } else {

                        scrollabeView = mock;
                        scrollabeView.style.overflowY = "auto";
                        scrollabeView.style.maxHeight = "100%";
                    }
                }
            } catch (e) {
                alert(e)
            }
        }
        createMock();


        window.cleanStyle(".sliderView");
        
        if (option.addNext && ["Pagination", "PaginationScroll", "Player"].includes(option.scrollType)) {
            const mock = createView();
            mock.classList.add("emptyView");
            mock.innerHTML = addString("<p>", option.nextText, "</p>");
            slider.appendChild(mock);
        }


        // Adding drag functionality
        let isMouseDown = false;
        let startX, scrollLeft, dragDistance = 0;
        const dragThreshold = 20; // Threshold to start dragging


        snapToNearest = () => {
            if (option.scrollDisabled)
                return;
            const childWidth = slider.children[0].offsetWidth
            const scrollPosition = sliderContainer.scrollLeft;
            const closestIndex = Math.round(scrollPosition / childWidth);
            if (!rendering)
                sliderContainer.scrollTo({
                    left: closestIndex * childWidth,
                    behavior: "smooth"
                });
            else sliderContainer.scrollLeft = closestIndex * childWidth;
        };

        snapToCenter = () => {
            try {
                if (rendering)
                    return;
                slider.style.width = (slider.children.length * window.innerWidth) + "px";
                const childWidth = slider.children[0].offsetWidth
                const scrollPosition = sliderContainer.scrollLeft;
                const closestIndex = 1;
                rendering = true;
                sliderContainer.scrollLeft = closestIndex * childWidth;

            } catch (e) {
                console.error(e);
            }

            rendering = false;
        }

        if (["Pagination", "PaginationScroll", "Player"].includes(option.scrollType)) {
            slider.style.width = (slider.children.length * window.innerWidth) + "px";
            slider.style.display = "flex";

            const textSelection = () => {
                let text = "";

                if (window.getSelection) {
                    text = window.getSelection().toString();
                } else if (document.selection && document.selection.type != "Control") {
                    text = document.selection.createRange().text;
                }

                return text.length > 0
            }

            window.ScrollData = () => {

                if (isMouseDown) return;

                if (textSelection && textSelection()) {
                    return;
                }

                //  e.preventDefault();
                sliderContainer.scrollLeft += sliderContainer.clientWidth
            };


            const onDrag = (e) => {
                const x = e.pageX || e.touches[0].pageX;
                const deltaX = x - startX;
                sliderContainer.scrollLeft = scrollLeft - deltaX;
                disableSelection();
            };

            const disableSelection = () => {
                document.body.style.userSelect = "none";
            }

            const enableSelection = () => {
                document.body.style.userSelect = "auto";
            }


            const startDragging = (e) => {
                startX = e.pageX || e.touches[0].pageX;
                scrollLeft = sliderContainer.scrollLeft;
                dragDistance = 0; // Reset drag distance when starting
                // Disable text selection when dragging starts
                //if (Math.abs(e.pageX - startX) > dragThreshold)
                //    document.body.style.userSelect = "none";
            };

            const stopDragging = () => {
                isMouseDown = false;
                //snapToNearest();
                // Re-enable text selection when dragging stops
                enableSelection();
            };



            sliderContainer.addEventListener("mousedown", (e) => {
                if (textSelection()) {
                    stopDragging();
                    return;
                }
                //  if (Math.abs(e.pageX - startX) > dragThreshold) {
                isMouseDown = true;
                startDragging(e);
                //}
            });

            sliderContainer.addEventListener("touchstart", (e) => {
                if (textSelection()) {
                    stopDragging();
                    return;
                }
                //   if (Math.abs(e.touches[0].pageX - startX) > dragThreshold) {
                isMouseDown = true;
                startDragging(e);
                // }
            });

            sliderContainer.addEventListener("mousemove", (e) => {
                if (!isMouseDown) return;
                if (textSelection()) {
                    isMouseDown = false;
                    return;
                }
                // e.preventDefault();
                dragDistance = Math.abs(e.pageX - startX);
                if (dragDistance > dragThreshold) {
                    onDrag(e);
                }
            });

            sliderContainer.addEventListener("touchmove", (e) => {
                if (!isMouseDown) return;

                if (textSelection()) {
                    isMouseDown = false;
                    return;
                }

                //  e.preventDefault();
                dragDistance = Math.abs(e.touches[0].pageX - startX);
                if (dragDistance > dragThreshold) {
                    onDrag(e);
                }
            });

            sliderContainer.addEventListener("mouseup", stopDragging);
            sliderContainer.addEventListener("touchend", stopDragging);

            sliderContainer.addEventListener("mouseleave", stopDragging);
            sliderContainer.addEventListener("touchcancel", stopDragging);
            if (!document.querySelector(".manga-page")) {
                sliderContainer.addEventListener("dblclick", (e) => {
                    if (window.getSelection().toString().length <= 0 && option.scrollType == "Pagination") {
                        e.preventDefault();
                        sliderContainer.scrollTo({
                            left: sliderContainer.scrollLeft + slider.children[0].offsetWidth,
                            behavior: "smooth"
                        });
                    }
                });
            }


        } else {
            sliderContainer.style.overflow = "hidden";
            sliderContainer.style.overflowY = "auto";
            if (!option.scrollDisabled) {
                sliderContainer.style.paddingTop = option.addPrev ? "150px" : "0px";
                sliderContainer.style.paddingBottom = option.addNext ? "150px" : "0px";

                //div.style.display = "block";


            }
        }

        if (["Scroll"].includes(option.scrollType)) {
            if (option.scrollValue < 150 && option.addPrev)
                option.scrollValue = 150;

            if (Math.abs(scrollabeView.scrollHeight - scrollabeView.clientHeight - option.scrollValue) <= 100) {
                option.scrollValue = scrollabeView.scrollHeight - scrollabeView.clientHeight - 150;
            }
        }

        if (!option.scrollDisabled) {
            if (["Pagination"].includes(option.scrollType)) {
                if (option.scrollValue < sliderContainer.clientWidth && option.addPrev)
                    option.scrollValue = sliderContainer.clientWidth;

                if ((sliderContainer.scrollWidth < option.scrollValue || Math.abs(sliderContainer.scrollWidth - sliderContainer.clientWidth - option.scrollValue) <= (sliderContainer.clientWidth / 2)) && option.addNext)
                    option.scrollValue = sliderContainer.scrollWidth - (sliderContainer.clientWidth * 2);

            } else if (["PaginationScroll", "Player"].includes(option.scrollType)) {
                if (option.addPrev) {
                    sliderContainer.scrollLeft = sliderContainer.clientWidth;
                    snapToNearest();
                }
            }

            if (option.scrollValue > 0 && option.scrollType == "Pagination") {
                scrollabeView.scrollLeft = option.scrollValue;
            } else if (!["Player"].includes(option.scrollType)) scrollabeView.scrollTop = option.scrollValue;
        }

        const endReached = () => {
            if (!option.addNext)
                return false;
            let value = Math.abs(sliderContainer.scrollHeight - sliderContainer.clientHeight - sliderContainer.scrollTop);
            if (["Pagination", "PaginationScroll", "Player"].includes(option.scrollType)) {
                value = Math.abs(sliderContainer.scrollWidth - sliderContainer.clientWidth - sliderContainer.scrollLeft);
            }
            if (value <= 30) {
                if (option.onEnd) {
                    option.onEnd();
                    return true;
                }
                console.log("end")

            }

            return false;

        }

        const startReached = () => {
            if (!option.addPrev)
                return false;
            if ((["Pagination", "PaginationScroll", "Player"].includes(option.scrollType) && sliderContainer.scrollLeft <= 30) || (option.scrollType == "Scroll" && sliderContainer.scrollTop <= 10)) {
                if (option.onStart) {
                    option.onStart();
                    return true;
                }
                console.log("start")
            }

            return false;
        }

        const validateScroll = () => {
            if (sliderContainer.scrollHeight <= sliderContainer.offsetHeight && ["Scroll"].includes(option.scrollType))
                return false;
            if (sliderContainer.scrollWidth <= sliderContainer.offsetWidth && ["Pagination", "PaginationScroll", "Player"].includes(option.scrollType))
                return false;
            return (startReached() || endReached())
        }

        const getScrollProcent = () => {
            let total = option.scrollType == "Pagination" ? scrollabeView.scrollWidth : scrollabeView.scrollHeight;
            let scrollValue = option.scrollType == "Pagination" ? scrollabeView.scrollLeft : scrollabeView.scrollTop;
            let minus = 0;
            if (option.scrollType == "Pagination" && option.addPrev)
                minus += scrollabeView.clientWidth;
            if (option.scrollType == "Pagination" && option.addNext)
                minus += scrollabeView.clientWidth;
            if (option.scrollType == "Scroll" && option.addPrev)
                minus += 150;
            if (option.scrollType == "Scroll" && option.addNext)
                minus += 150;

            total -= minus;
            return (scrollValue / total) * 100
        }


        let paginationScrollTimer = undefined;
        if (option.scrollType == "PaginationScroll" && !option.scrollDisabled) {
            scrollabeView.addEventListener("scroll", (e) => {
                clearTimeout(paginationScrollTimer);
                if (option.scrollPercentageValue) {
                    option.scrollPercentageValue(getScrollProcent());
                }
                paginationScrollTimer = setTimeout(() => {
                    if (isMouseDown || keyDown || rendering || !option.onscroll)
                        return;
                    option.onscroll(scrollabeView.scrollTop);

                }, 500);
            });
        }

        const onSliderScroll = (e) => {
            if (option.scrollDisabled || rendering)
                return;
            clearTimeout(scrollTimer);
            if (option.scrollPercentageValue && option.scrollType != "PaginationScroll") {
                option.scrollPercentageValue(getScrollProcent());
            }
            if (!["Scroll"].includes(option.scrollType)) {
                let endValue = Math.abs(sliderContainer.scrollWidth - sliderContainer.clientWidth - sliderContainer.scrollLeft);
                if (option.addNext && endValue <= sliderContainer.clientWidth - 30) {
                    scrollPerview.style.display = "flex";
                    scrollPerview.innerHTML = option.nextText;
                } else if (option.addPrev && sliderContainer.scrollLeft <= sliderContainer.clientWidth - 30) {
                    scrollPerview.style.display = "flex";
                    scrollPerview.innerHTML = option.prevText;
                } else scrollPerview.style.display = "none";

            }

            scrollTimer = setTimeout(() => {
                if (isMouseDown || keyDown || rendering) {
                    if (isMouseDown)
                        onSliderScroll(e);
                    return;
                };
                if (option.onscroll && !["Player", "PaginationScroll"].includes(option.scrollType)) {
                    if (option.scrollType == "Pagination")
                        option.onscroll(sliderContainer.scrollLeft);
                    else option.onscroll(sliderContainer.scrollTop);
                }
                lastScrollPos = sliderContainer.scrollLeft

                if (validateScroll() && !option.scrollDisabled)
                    option.scrollDisabled = true;

                snapToNearest();

            }, 500);
        }

        if (!option.scrollDisabled)
            sliderContainer.addEventListener("scroll", onSliderScroll);

        function createSelectionMenu(menuItem) {
            let menuTimeout;
            let selectionText = "";

            function createMenu(x, y) {
                if (selectionMenu) {
                    selectionMenu.remove();
                }
                selectionMenu = document.createElement("div");
                selectionMenu.classList.add("selection-menu");

                menuItem.items.forEach(item => {
                    const div = document.createElement("div");
                    div.classList.add("menu-item");
                    div.innerHTML = addString("<span class='material-symbols-outlined'>", item.icon, "</span>", item.text);
                    div.onclick = () => {
                        const mItem = {
                            ...item,
                            selection: selectionText
                        };
                        menuItem.click(mItem);
                        selectionMenu.style.display = "none";
                    }
                    selectionMenu.appendChild(div);
                });

                document.body.appendChild(selectionMenu);
                positionMenu(x, y);

            }

            function positionMenu(x, y) {
                selectionMenu.style.display = 'block';
                const menuWidth = selectionMenu.offsetWidth;
                const menuHeight = selectionMenu.offsetHeight;
                const innerWidth = sliderContainer.getBoundingClientRect().width;
                const innerHeight = sliderContainer.getBoundingClientRect().height;

                if (x + menuWidth > innerWidth) {
                    x = innerWidth - menuWidth - 10;
                }
                if (y + menuHeight > innerHeight) {
                    y = y - menuHeight - 10;
                }
                if (y < 0) {
                    y = 10;
                }
                if (x < 0)
                    x = 5;
                selectionMenu.style.left = x + "px";
                selectionMenu.style.top = y + "px";
            }

            function showMenu(event) {
                event.preventDefault();
                if (selectionMenu) {
                    selectionMenu.style.display = 'none';
                }
                clearTimeout(menuTimeout);
                menuTimeout = setTimeout(() => {
                    const selection = window.getSelection();
                    selectionText = selection.toString();
                    if (selection.rangeCount > 0 && selection.toString().trim().length >= menuItem.minlength) {
                        const range = selection.getRangeAt(0);
                        const rect = range.getBoundingClientRect();
                        createMenu(rect.left + rect.width / 2, rect.top - 10);
                    }
                }, 500);
            }
            window.document.oncontextmenu = showMenu;
            window.document.onselectionchange = showMenu;
            //document.addEventListener('mouseup', showMenu);
            //document.addEventListener('touchend', showMenu);
        }

        createSelectionMenu(option.menu);
        sliderContainer.focus();


    } catch (e) {
        window.postmsg("error", e);
        if (window.__DEV__)
            alert(e);
    } finally {
        rendering = false;
    }

}

window.loadData = (data) => {
    switch (data.type) {
        case "CSS":
            const style = document.createElement("style");
            style.id = data.id ? data.id : (data.type + data.data.length);
            style.classList.add("custom");
            if (document.getElementById(style.id))
                document.getElementById(style.id).remove();
            style.appendChild(document.createTextNode(data.data));
            document.head.appendChild(style);
            break;
    }
}




window.addEventListener("keyup", (e) => {
    keyDown = false;
    if (["Scroll", "PaginationScroll", "Player"].includes(options.scrollType))
        return;
    const sl = div.querySelector(".slider-container");
    if (e.keyCode == 40 && div.querySelector(".slider")) { // down
        sl.scrollTo({
            left: sl.scrollLeft + div.querySelector(".slider").children[0].offsetWidth,
            behavior: "smooth"
        });
        //   snapToNearest();
    } else if (e.keyCode == 38 && div.querySelector(".slider")) { // down
        sl.scrollTo({
            left: sl.scrollLeft - div.querySelector(".slider").children[0].offsetWidth,
            behavior: "smooth"
        });
        //  div.querySelector(".slider-container").scrollLeft -= div.querySelector(".slider").children[0].offsetWidth;
        // snapToNearest();
    }
});

window.addEventListener("keydown", e => {
    let isValid = [37, 39];
    if (isValid.find(x => e.location == x || e.keyCode == x))
        keyDown = true;
});

window.create = create;
window.postmsg = (type, data) => {
    const item = {
        type,
        data
    };
    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(item))
    }
}

function resetZoom() {
    const meta = document.querySelector('meta[name="viewport"]');

    meta?.setAttribute(
        "content",
        "width=device-width, initial-scale=1"
    );
}

const mangaZoom = (e) => {
    try {
        let novel = document.querySelector(".novel");
        const page = mangaPage.page;
        const rect = page.getBoundingClientRect();

        const viewWidth = rect.width;
        const viewHeight = rect.height;

        if (mangaPage.scale === 1) {
            mangaPage.scale = 2;
            novel.classList.add("scrollableX");
            const pos = mangaPage.getPoint(e);
            const x = pos.x - rect.left;
            const y = pos.y - rect.top;

            // center relative to viewport instead of element
            mangaPage.offsetX = viewWidth / 2 - x;
            mangaPage.offsetY = viewHeight / 2 - y;

        } else {
            mangaPage.scale = 1;
            mangaPage.offsetX = 0;
            mangaPage.offsetY = 0;
            novel.classList.remove("scrollableX");
        }

        mangaPage.page.style.transform = addString("scale(", mangaPage.scale, ") translate(", mangaPage.offsetX, "px,", mangaPage.offsetY, "px)");
    } catch {}
}

let timerClick = null;
let lastTap = 0;
window.addEventListener('click', function(event) {
    try {
        if (event.target.classList.contains("retry") || event.target.classList.contains("lazy"))
            return;
        mangaPage.page ??= document.querySelector(".manga-page");
        const now = Date.now();
        const delta = now - lastTap;
        const dbClick = delta < 300 && lastTap > 0;
        lastTap = now;
        clearTimeout(timerClick);
        if (dbClick && mangaPage.page) {
            event.preventDefault();
            event.stopPropagation();
            mangaZoom(event);
            return;
        }
        let target = event.target;
        if (target.closest(".selection-menu"))
            return;
        if (selectionMenu && selectionMenu.style.display != "none" && !selectionMenu.contains(event.target) && window.getSelection().toString().length < options.menu.minlength) {
            selectionMenu.style.display = 'none';
            return;
        }
        timerClick = setTimeout(() => {
            if (!selectionMenu || selectionMenu.style.display == "none") {
                if (!((dbClick) && ["Pagination"].includes(options.scrollType))) {
                    window.postmsg("click", true);
                }
            }
        }, 300);
    } catch (e) {
        alert(e)
    }
});

window.addEventListener('resize', () => {
    window.getSelection().removeAllRanges();
    if (selectionMenu) {
        selectionMenu.style.display = 'none';
    }
});

window.cleanStyle = function(selector) {
    try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(e => e.querySelectorAll("[style]").forEach(x => {
            if (!x.classList.contains("custom")) {
                x.style.background = null;
                x.style.backgroundColor = null;
                x.style.fontFamily = null;
                x.style.color = null;
                x.style.fontSize = null;
                x.style.lineHeight = null;
                x.style.textAlign = null;
                x.style.fontWeight = null;
            }
        }));
    } catch (e) {
        console.error(e);
    }
};

const regChar = ("”“-=%+*<>|/[]{}()$#!!&?,:;..'’‘ _").split("").map(x => addString("\\\\", x)).join("|");
window.highlight = function(options) {
    var inputText = document.querySelector(options.selector);
    if (!options.text)
        options.text = inputText.innerText;
    let spanStart = "<span style class='highlight hiText'>#</span>".replace("style", options.all ?
        "style='padding:0px;border-radius:0px;display:inline;'" :
        ""
    );

    let container = "<p>#</p>";

    var innerHTML = options.text;
    let char = "";
    while (options.length + 1 < innerHTML.length && new RegExp(regChar, "gmi").test((char = innerHTML[options.index + options.length] || ""))) {
        options.length++;
    }

    let selectedText = innerHTML.substring(options.index, options.index + options.length);
    let startText = innerHTML.substring(0, options.index);

    if (options.all)
        startText = spanStart.replace("#", startText);

    innerHTML = startText + spanStart.replace("#", selectedText) + innerHTML.substring(options.index + options.length);
    inputText.innerHTML = innerHTML;
    if (options.scroll === false) return;
    let lastH = inputText.querySelector(".highlight:last-child");

    if (lastH) {
        scrollabeView.scrollTop = lastH.offsetTop;
    }
};

try {

    window.isValidUrl = urlString => {
        return urlString.indexOf("https") != -1 || urlString.indexOf("http") != -1 || urlString.indexOf("www.") != -1
    }
    const genertatedID = new Map();
    window.getId = () => {
        let id = "Id" + Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36);
        if (genertatedID.has(id))
            return getId();
        genertatedID.set(id, id);
        return id;
    }



    window.onImageLoadError = (currentImage) => {
        try {
            const skip = () => {
                window.postmsg("warn", "Skip " + currentImage.id);
                return false;
            }
            let img = currentImage;
            const imageAddress = document.body.getAttribute("imageAddress");

            let src = img.getAttribute("src");

            if (!src || src.trim().length <= 0 || src == "undefined") {
                return skip();
            }
            let newSrc = addString(imageAddress, "/", encodeURIComponent(src), "/", img.id);

            if (src && typeof src == "string" && src.indexOf("header") != -1) {
                if (src.indexOf(imageAddress) !== -1)
                    return skip();
                img.setAttribute("newSrc", newSrc)
               // queueImageFetch(newSrc)
                return;
            }
            if (window.isValidUrl(src))
                return skip(); // it is an external image, cant do anything to load it.
            img.setAttribute("newSrc", newSrc)
           // queueImageFetch(newSrc);
        } catch (e) {
            window.postmsg("log", e.toString());
        }
    }


    window.renderImage = (items) => {

        try {
            for (let item of (items.data ?? items)) {
                let img = undefined;
                if (!item)
                    continue;
                img = document.getElementById(item.id);
                if (!img)
                    img = [...document.querySelectorAll("img")].find(x => x.getAttribute("src") == item.src)
                if (img && img.setAttribute) {
                    img.setAttribute("src", item.cn);
                } else window.postmsg("log", "img not found " + item.id);

            }
        } catch (e) {
            if (window.__DEV__)
                alert(e)
        }
    }

    function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms))
    }


    async function psg() {
        while (window.postmsg === undefined)
            await sleep(200);
        window.postmsg("data", true);
    }

    let resizeTimer = undefined;
    const onResize = () => {
        clearTimeout(resizeTimer)

        resizeTimer = setTimeout(() => {
            if (options.type == "Manga") {
                snapToCenter();
                if (window.__DEV__)
                    window.postmsg("log", {
                        resized: true
                    });
                return;
            }
            window.create(options);
        }, 200);
    }


    window.loadBody = async (readerOption) => {
        try {
            window.abortAllFetches();
            document.body.innerHTML = "";
            window.removeEventListener("resize", onResize);
            await window.create(readerOption);
            mangaPage.page = undefined;
            window.postmsg("loader", false); // hide loader
            window.addEventListener("resize", onResize);
            if (window.__DEV__) {
                setTimeout(() => {
                    requestIdleCallback(() => {
                        postmsg("savePage", document.documentElement.outerHTML)
                    });
                }, 5000);
            }
        } catch (e) {
            alert(e)
        }
    }
    psg();
} catch (e) {
    if (window.__DEV__)
        alert(e)
}`