export const CSSStyle = `
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

        .sliderView {
            display: block;
            width: 100vw;
            min-height: 10%;
            overflow: hidden;
            /* Full viewport width */
            /*  height: 100vh; /* Full viewport height */

        }

        .sliderView>* {
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
`
export const JS = ` 
                let div = undefined;
                let chapter = undefined;
                let keyDown = false;
                let rendering = false;
                let selectionMenu = undefined;
                let snapToNearest = undefined;
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
                        scrollType: "Pagination",// "Pagination | Scroll | Player | PaginationScroll",
                        onEnd: undefined, // next
                        onStart: undefined, // eg prev
                        addPrev: true,
                        addNext: true,
                        prevText: "Previous Chapter",
                        nextText: "Next Chapter",
                        content: 'document.getElementById("chapter").innerHTML',
                        menu: {
                                items: [
                                        { text: "Copy", icon: "content_copy" },
                                        { text: "Paste", icon: "content_paste" },
                                        { text: "Bold", icon: "format_bold" }
                                ], minlength: 2, click: function (item) {
                                        // alert(item.text);
                                }
                        }

                }



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

                const trySplit = function (htmlString) {
                        if (["<div", "<table", "<img"].find(x => htmlString.indexOf(x) != -1))
                                return undefined;
                        const p = document.createElement("p");
                        p.innerHTML = htmlString;
                        if (p.querySelector(".custom"))
                                return undefined;
                        let txt = p.innerText;
                        txt = txt.replace(/(mr|Mrs|Ms|Miss|dr|Mt)((\\s)?(\\.)(\\s)?)/gi, "$1.");
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

                        if (Array.isArray(html))
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


                const pageSleeper = (ms) => new Promise(r => setTimeout(r, ms))
                let createTimer = undefined;
                const create = async (option) => {
                        clearTimeout(createTimer);
                        if (rendering) {
                                createTimer = setTimeout(() => create(option), 10);
                                return;
                        }
                        try {
                                validateJson(option);
                                rendering = true;
                                options = option;
                                document.body.innerHTML = "";
                                div = document.createElement("div");
                                div.style.zIndex = 1;
                                div.id = "chapter";
                                div.className = "novel";
                                document.body.appendChild(div);
                                option.content = cleanHtml(option.content);
                                chapter = getElements(option.content);

                                const text = option.scrollType == "Pagination" ? chapter.map(x => x.outerHTML) : chapter;


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

                                const validateImages = (view)=> {
                                    //window.onImageLoadError
                                    try{
                                    view = view || document;
                                    const imgs = document.querySelectorAll("img");
                                    imgs.forEach(x=> {
                                        x.setAttribute("onerror", "window.onImageLoadError(this)")
                                    });
                                  }catch(e){
                                        alert(e);
                                  }
                                
                                }

                                const createScrollPreview = () => {
                                        scrollPerview = document.createElement("div");
                                        scrollPerview.className = "ScollPreview";
                                        let style = {
                                                position: "fixed",
                                                left: "0px",
                                                top: "10%",
                                                height: "40px",
                                                width: "100vw",
                                                display: "none",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: "#000",
                                                color: "white",
                                                fontWeight: "bold",
                                                fontSize: 25,
                                                opacity: 0.8

                                        }

                                        for (let k in style)
                                                scrollPerview.style[k] = style[k] + (typeof style[k] == "number" && k != "opacity" ? "px" : "");
                                        scrollPerview.innerHTML = "Next Page";
                                        if (["Pagination", "PaginationScroll"].includes(option.scrollType))
                                                document.body.appendChild(scrollPerview)
                                }
                                createScrollPreview();

                                if (option.addPrev && ["Pagination", "PaginationScroll"].includes(option.scrollType)) {
                                        const mock = createView();
                                        mock.classList.add("emptyView");
                                        mock.innerHTML = addString("<p>", option.prevText, "</p>");
                                        slider.appendChild(mock);
                                }

                                const createMock = () => {
                                        try {
                                                const height = Math.min(window.innerHeight, sliderContainer.clientHeight, div.clientHeight) - (bottomPadding);
                                                const mock = createView();
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
                                                        
                                                        if (option.scrollType != "PaginationScroll")
                                                                slider.classList.remove("slider");
                                                        else {
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
                                validateImages();

                                window.cleanStyle(".sliderView");
                                if (option.addNext && ["Pagination", "PaginationScroll"].includes(option.scrollType)) {
                                        const mock = createView();
                                        mock.classList.add("emptyView");
                                        mock.innerHTML = addString("<p>", option.nextText, "</p>");
                                        slider.appendChild(mock);
                                }


                                // Adding drag functionality
                                let isMouseDown = false;
                                let startX, scrollLeft, dragDistance = 0;
                                const dragThreshold = 20;  // Threshold to start dragging


                                snapToNearest = () => {
                                        if (option.scrollDisabled)
                                                return;
                                        const childWidth = slider.children[0].offsetWidth
                                        const scrollPosition = sliderContainer.scrollLeft;
                                        const closestIndex = Math.round(scrollPosition / childWidth);
                                        if (!rendering)
                                                sliderContainer.scrollTo({ left: closestIndex * childWidth, behavior: "smooth" });
                                        else sliderContainer.scrollLeft = closestIndex * childWidth;
                                };
                                if (["Pagination", "PaginationScroll"].includes(option.scrollType)) {
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
                                                dragDistance = 0;  // Reset drag distance when starting
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

                                        sliderContainer.addEventListener("dblclick", (e) => {
                                                if (window.getSelection().toString().length <= 0 && option.scrollType == "Pagination") {
                                                        e.preventDefault();
                                                        sliderContainer.scrollTo({ left: sliderContainer.scrollLeft + slider.children[0].offsetWidth, behavior: "smooth" });
                                                }
                                        });



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

                                        } else if (option.scrollType == "PaginationScroll") {
                                                if (option.addPrev) {
                                                        sliderContainer.scrollLeft = sliderContainer.clientWidth;
                                                        snapToNearest();
                                                }
                                        }

                                        if (option.scrollValue > 0 && option.scrollType == "Pagination") {
                                                scrollabeView.scrollLeft = option.scrollValue;
                                        } else scrollabeView.scrollTop = option.scrollValue;
                                }

                                const endReached = () => {
                                        if (!option.addNext)
                                                return false;
                                        let value = Math.abs(sliderContainer.scrollHeight - sliderContainer.clientHeight - sliderContainer.scrollTop);
                                        if (["Pagination", "PaginationScroll"].includes(option.scrollType)) {
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
                                        if ((["Pagination", "PaginationScroll"].includes(option.scrollType) && sliderContainer.scrollLeft <= 30) || (option.scrollType == "Scroll" && sliderContainer.scrollTop <= 10)) {
                                                if (option.onStart) {
                                                        option.onStart();
                                                        return true;
                                                }
                                                console.log("start")
                                        }

                                        return false;
                                }

                                const validateScroll = () => {
                                        if (option.scrollType == "Player")
                                                return false; // single page 
                                        if (sliderContainer.scrollHeight <= sliderContainer.offsetHeight && ["Scroll"].includes(option.scrollType))
                                                return false;
                                        if (sliderContainer.scrollWidth <= sliderContainer.offsetWidth && ["Pagination", "PaginationScroll"].includes(option.scrollType))
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
                                        if (!["Player", "Scroll"].includes(option.scrollType)) {
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
                                                }
                                                ;
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
                                                                const mItem = { ...item, selection: selectionText };
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


                let resizeTimer = undefined;
                window.addEventListener("resize", () => {
                        clearTimeout(resizeTimer)
                        resizeTimer = setTimeout(() => {
                                create(options);
                        }, 200);
                });

                window.addEventListener("keyup", (e) => {
                        keyDown = false;
                        if (["Scroll", "PaginationScroll", "Player"].includes(options.scrollType))
                                return;
                        const sl = div.querySelector(".slider-container");
                        if (e.keyCode == 40 && div.querySelector(".slider")) { // down
                                sl.scrollTo({ left: sl.scrollLeft + div.querySelector(".slider").children[0].offsetWidth, behavior: "smooth" });
                                //   snapToNearest();
                        }
                        else if (e.keyCode == 38 && div.querySelector(".slider")) { // down
                                sl.scrollTo({ left: sl.scrollLeft - div.querySelector(".slider").children[0].offsetWidth, behavior: "smooth" });
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
                        const item = { type, data };
                        if (window.ReactNativeWebView) {
                                window.ReactNativeWebView.postMessage(JSON.stringify(item))
                        }
                }

                let timerClick = null;
                window.addEventListener('click', function (event) {
                        try {
                                clearTimeout(timerClick);
                                let target = event.target;
                                if (target.closest(".selection-menu"))
                                        return;
                                if (selectionMenu && selectionMenu.style.display != "none" && !selectionMenu.contains(event.target) && window.getSelection().toString().length < options.menu.minlength) {
                                        selectionMenu.style.display = 'none';
                                        return;
                                }
                                timerClick = setTimeout(() => {
                                        if (!selectionMenu || selectionMenu.style.display == "none") {
                                                if (!(event.detail >= 2 && ["Pagination"].includes(options.scrollType)))
                                                        window.postmsg("click", true);
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

                window.cleanStyle = function (selector) {
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
                window.highlight = function (options) {
                        var inputText = document.querySelector(options.selector);
                        if (!options.text)
                                options.text = inputText.innerText;
                        let spanStart = "<span style class='highlight hiText'>#</span>".replace("style", options.all
                                ? "style='padding:0px;border-radius:0px;display:inline;'"
                                : ""
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

                        window.getId = ()=> {

                                return Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36);

                        }

                        window.onImageLoadError = (img)=> {
                          let src = img.getAttribute("src");
                          if (!src || src.trim().length<=0)
                          {
                                return;
                          }
                          if (window.isValidUrl(src))
                                return; // it is an external image, cant do anything to load it.
                          
                          img.id = window.getId();
                          window.postmsg("Image", [{src, id: img.id}]);
                        }
                          
                        window.renderImage = (items) => {
                                try {
                                        for (let item of items.data) {
                                                let img = undefined;
                                                if (!item)
                                                  continue;
                                                        img = document.getElementById(item.id);
                                                        if (img && img.setAttribute)
                                                           img.setAttribute("src", item.cn);
                                                
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


                        window.loadBody = async (readerOption) => {
                                await window.create(readerOption);
                                window.postmsg("loader", false); // hide loader
                        }
                        psg();
                } catch (e) {
                        if (window.__DEV__)
                                alert(e)
                }
`