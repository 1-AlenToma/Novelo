try{let t,i="",n=[{order:100,folder:"/storage/emulated/0/Documents/Projects/ContextMenu",name:"index.js",cleanName:"index",ext:"js",path:"./data/index",content:'const getOffset=e=>{e=(e=e.el||e).getBoundingClientRect();return e.right=e.width+e.x,e.bottom=e.y+e.height,e},Element=function(e,t){this.el="string"==typeof e?document.createElement(e):e,t&&Object.keys(t).forEach(e=>{void 0!==this.el.style[e]?this.el.style[e]=t[e]:this.el[e]=t[e]}),this.counter=10,this.val=e=>{var t=-1!==["input","textarea"].indexOf(this.el.tagName.toLowerCase());return null!=e&&(t?this.el.value=e:this.el.innerHTML=e),t?this.el.value:this.el.innerHTML},this.event=(e,t)=>(e.split(",").forEach(e=>{this.el.addEventListener(e,t)}),this),this.attr=(e,t)=>(void 0!==t&&this.el.setAttribute(e,t),this.el.getAttribute(e)),this.setAttr=(e,t)=>(this.attr(e,t),this),this.styleValue=(...e)=>{let i={};return e.forEach(e=>{var t;i[e]=(t=this.el,e=e,(t.currentStyle||(document.defaultView&&document.defaultView.getComputedStyle?document.defaultView.getComputedStyle(t,""):t.style))[e])}),i},this.css=t=>(Object.keys(t).forEach(e=>{this.el.style[e]=t[e]}),this),this.offset=()=>getOffset(this.el),this.getEl=e=>e&&e.el?e.el:e,this.appendTo=e=>(this.getEl(e).appendChild(this.el),this),this.add=(...e)=>(e.forEach(e=>{var t;e&&("string"==typeof e&&((t=document.createElement("div")).innerHTML=e,e=t),void 0===e.el?this.el.appendChild(e):this.el.appendChild(e.el))}),this),this.prepend=e=>{var t;"string"==typeof e&&((t=document.createElement("div")).innerHTML=e,e=t),void 0===e.el?this.el.prepend(e):this.el.prepend(e.el)},this.insertAfter=e=>((e=void 0===e.el?e:e.el).appendChild(this.el),e.parentNode.insertBefore(this.el,e.nextSibling),this),this.insertBefore=e=>((e=void 0===e.el?e:e.el).appendChild(this.el),e.parentNode.insertBefore(this.el,e.previousSibling),this),this.classList=()=>this.el.classList,this.slideDown=(e,t)=>{null==e&&(this.classList().remove("hidden"),e=e||this.offset(),this.css({top:"-"+(e.y+e.height)+"px",opacity:1}));const i=this.offset();setTimeout(()=>{i.y<e.y?(this.css({top:Math.min(i.y+this.counter,e.y)+"px"}),this.slideDown(e,t)):t&&t()},0)},this.slideUp=(e,t)=>{const i=this.offset();e=e||-(i.y+i.height),setTimeout(()=>{i.y>e?(e+=this.counter,this.css({top:i.y-this.counter+"px"}),this.slideUp(e,t)):(this.classList().add("hidden"),t&&t())},0)},this.show=(e,t,i)=>{e=e||1,t=t||1,void 0===i&&(this.css({opacity:0}),i=0,this.classList().remove("hidden")),setTimeout(()=>{(i+=.01)<=t&&(this.css({opacity:i}),this.show(e,t,i))},e)},this.hide=(e,t)=>{e=e||1,t=t||parseFloat(this.styleValue("opacity").opacity),setTimeout(()=>{0<=(t-=.01)?(this.css({opacity:t}),this.hide(e,t)):this.classList().add("hidden")},e)},this.find=e=>new Element(this.el.querySelector(e)),this.findAll=e=>[...this.el.querySelectorAll(e)].map(e=>new Element(e))};function wait(t){return new Promise(e=>setTimeout(e,t))}async function postMessage(t,e){try{for(;null==window.ReactNativeWebView||null==window.ReactNativeWebView.postMessage;)await wait(100);await window.ReactNativeWebView.postMessage(JSON.stringify({type:t,data:e}))}catch(e){postMessage("error",t+"-"+e.toString())}}window.postmsg=postMessage,window.ctx=function(e){document.querySelector("context")&&document.querySelector("context").remove(),this.xmenu=new Element("context",{className:"hidden contextMenuTag"}).appendTo(document.body);const d=()=>document.querySelector(e.selector);let a=this.xmenu.el,r=(this.menuState=0,this.btn=[],e.rows.forEach(e=>{let s=new Element("div").appendTo(this.xmenu);e.cols.forEach(t=>{let e="",i=(t.icon&&(e+=`<span class="material-symbols-outlined">${t.icon}</span>`),t.text&&(e+=t.text),{});t.style&&(i=t.style),new Element("a",{innerHTML:e,...i}).appendTo(s.el).event("click",function(){var e=m();postMessage("menu",{item:t,selection:e}),window.getSelection?window.getSelection().empty?window.getSelection().empty():window.getSelection().removeAllRanges&&window.getSelection().removeAllRanges():document.selection&&document.selection.empty()})})}),0),c=0,t=void 0,i=l=>{this.xmenu.el.classList.add("hidden"),clearTimeout(t),t=setTimeout(()=>{var e,t,i,s,n,o=m();o&&0<o.length&&/\\S/.test(o)?(e=(o=function(e){e=e||window.event;var e=r-window.scrollY,t=c-window.scrollX;return{x:t,y:e}}(o=l)).x,o=o.y,t=a.offsetWidth+4,i=a.offsetHeight+50,s=d(),n=(s||window).offsetWidth,(s||window).offsetHeight,screen.height,a.style.left=n<e+t?n-t+"px":e+"px",a.style.top=o-i<0?o+i/2+"px":o-i+"px",h()):u(l)},500)};window.document.oncontextmenu=e=>{e.preventDefault(),r=e.pageY||e.clientY,c=e.pageX||e.clientX,i(e)},window.document.onselectionchange=e=>{i(e)},window.document.onclick=e=>{var t=e.target;t.classList.contains("contextMenuTag")||t.closest("context")||u(e)},window.onkeyup=function(e){27===e.keyCode&&(e.preventDefault(),e.stopPropagation(),u())};const h=()=>{1===this.menuState&&!this.xmenu.classList().contains("hidden")||(this.menuState=1,this.xmenu.show())},u=e=>{0===this.menuState&&this.xmenu.classList().contains("hidden")||(e&&(e.preventDefault(),e.stopPropagation()),this.menuState=0,this.xmenu.hide())};function m(){var e="";return window.getSelection?e=window.getSelection().toString():window.document.selection&&"Control"!=window.document.selection.type&&(e=window.document.selection.createRange().text),e}},window.events={},window.ctm=void 0,window.bookSlider=void 0,window.slider=function(e){const{id:t,hasNext:i,hasPrev:s,prevText:n,nextText:o}=e;let l=document.getElementById(t);l.classList.add("sliderActive");e=e=>{return new Element("div",{className:"sliderTemp"})};document.getElementById("sliderContainer")&&document.getElementById("sliderContainer").remove(),this.container=new Element("div",{id:"sliderContainer"}).appendTo(document.body),this.slider=new Element("div",{id:"slider"}).add(s?e(n):void 0,l,i?e(o):void 0).appendTo(this.container),this.index=s?1:0,this.scrollLeft=0,this.startLeft=0,this.disabled=!1,this.blur=new Element("blur",{innerHTML:`<p>${o}</p>`,className:"hidden blurText"}).event("click",()=>{this.blur.el.classList.add("hidden")}).appendTo(document.body),this.touched=!1;let d=void 0;this.slider.event("touchstart",()=>this.touched=!0).event("touchend",()=>{this.touched=!1,clearTimeout(d),d=setTimeout(()=>{this.blur.el.classList.add("hidden")},300)});this.slider.el.addEventListener("scroll",t=>{if(window.ctm&&1===window.ctm.menuState)this.slider.el.scrollLeft=this.scrollLeft,this.blur.el.classList.add("hidden");else{var i=this.slider.el.children[0].offsetWidth,s=t.target.scrollLeft%t.target.offsetWidth==0;let e=Math.round(t.target.scrollLeft/i);this.startLeft=this.slider.el.children[this.index].offsetLeft;i=s?0:300,s=t.target.scrollLeft-this.scrollLeft;e===this.index&&this.touched&&0<this.scrollLeft&&50<Math.abs(s)&&(0<s?this.blur.find("p").val(o):t.target.scrollLeft<this.startLeft&&this.blur.find("p").val(n),this.blur.el.classList.remove("hidden")),clearTimeout(t.target.scrollTimeout),t.target.scrollTimeout=setTimeout(()=>{this.scrollLeft=t.target.scrollLeft,0==this.startLeft&&(this.startLeft=t.target.scrollLeft),this.touched||this.disabled||(e>this.index?postMessage("Next",this.disabled=!0):this.index>e&&postMessage("Prev",this.disabled=!0),this.blur.el.classList.add("hidden"),this.index=e)},i)}}),this.slider.el.children[this.index].scrollIntoView(),window.bookSlider=this};const regChar="”“-=%+*<>|/[]{}()$#!!&?,\\":;..\'’‘ _`".split("").map(e=>"\\\\"+e).join("|");function binder(){window.onclick=()=>{window.ctm&&1===window.ctm.menuState||postMessage("click",!0)},window.addEventListener("scroll",e=>{for(var t in window.events)-1!==t.indexOf("scroll")&&window.events[t](e)}),window.onmessage=async function(e){try{var t=JSON.parse(e.data);window.loadData(t)}catch(e){postMessage("error",e.message)}}}window.highlight=function(e){for(var t=document.querySelector(e.selector),i=(e.text||(e.text=t.innerText),"<span style class=\'highlight hiText\'>#</span>".replace("style",e.all?"style=\'padding:0px;border-radius:0px;display:inline;\'":"")),s=e.text;e.length+1<s.length&&new RegExp(regChar,"gmi").test(s[e.index+e.length]||"");)e.length++;var n=s.substring(e.index,e.index+e.length);let o=s.substring(0,e.index);s=(o=e.all?i.replace("#",o):o)+i.replace("#",n)+s.substring(e.index+e.length),t.innerHTML=s,!1!==e.scroll&&(i=t.querySelector(".highlight:last-child"))&&(i.parentNode.scrollTop=i.offsetTop)},window.cleanStyle=function(e){try{new Element(document.getElementById(e)).findAll("[style]").forEach(e=>{e.el.classList.contains("custom")||e.css({background:null,backgroundColor:null,fontFamily:null,color:null,fontSize:null,lineHeight:null,textAlign:null,fontWeight:null})})}catch(e){console.error(e)}},window.loadData=function(i){try{switch(i.type){case"content":window.ctm=new window.ctx(i.data.menuItems);break;case"style":let e=document.getElementById("customStyle");e&&e.remove(),(e=document.createElement("style")).id="customStyle",e.appendChild(document.createTextNode(i.data)),document.head.appendChild(e);break;case"font":let t=document.getElementById("customFont");t&&t.remove(),(t=document.createElement("style")).id="customFont",t.appendChild(document.createTextNode(i.data)),document.head.appendChild(t);break;case"scrollTop":window.scroll(0,i.data)}window.events&&window.events[i.type]&&window.events[i.type]()}catch(e){postMessage("error",{msg:e.message,data:i})}},window.binder=binder;'},{order:100,folder:"/storage/emulated/0/Documents/Projects/ContextMenu",name:"style.css",cleanName:"style",ext:"css",path:"./data/style",content:".hidden{visibility:hidden!important}:root{--widthA:95vw;--heightA:100vh;--opStart:0.5;--opEnd:0.2;--opCenter:0.3}@keyframes flickerAnimation{0%{opacity:var(--opStart)}50%{opacity:var(--opCenter)}100%{opacity:var(--opEnd)}}@-o-keyframes flickerAnimation{0%{opacity:var(--opStart)}50%{opacity:var(--opCenter)}100%{opacity:var(--opEnd)}}@-moz-keyframes flickerAnimation{0%{opacity:var(--opStart)}50%{opacity:var(--opCenter)}100%{opacity:var(--opEnd)}}@-webkit-keyframes flickerAnimation{0%{opacity:var(--opStart)}50%{opacity:var(--opCenter)}100%{opacity:var(--opEnd)}}#sliderContainer{width:var(--widthA);min-height:var(--heightA);position:relative;overflow:hidden;display:block}#slider{width:var(--widthA);min-height:var(--heightA);position:relative;overflow:hidden;overflow-x:auto;scroll-snap-type:x mandatory;display:grid;grid-auto-flow:column;grid-auto-columns:var(--widthA);flex-grow:1}#slider>div{width:var(--widthA);position:relative;scroll-snap-stop:always;scroll-snap-align:center;display:block;box-sizing:border-box;position:relative}.blurText{webkit-animation:flickerAnimation 1s infinite;-moz-animation:flickerAnimation 1s infinite;-o-animation:flickerAnimation 1s infinite;animation:flickerAnimation 1s infinite}#slider .sliderTemp,#slider .sliderTemp *{opacity:.5;text-shadow:0 0 5px rgba(0,0,0,.5)!important;text-decoration:line-through!important;text-decoration-thickness:100%!important;text-align:center!important;webkit-animation:flickerAnimation 1s infinite;-moz-animation:flickerAnimation 1s infinite;-o-animation:flickerAnimation 1s infinite;animation:flickerAnimation 1s infinite;z-index:90!important}blur p{color:#000;display:block;font-weight:700!important}blur{position:fixed;opacity:1;font-size:30px;display:flex;justify-content:center;align-items:center;top:0;left:0;width:var(--widthA);height:var(--heightA);z-index:100}context{min-width:100px;min-height:40px;display:inline-block;opacity:0;border:1px solid #ccc;position:fixed;top:30%;left:30%;z-index:9999999;border-radius:5px;background-color:#434656}context>div{width:100%;height:auto;display:flex;justify-content:center;align-items:center;vertical-align:center}context>div:nth-child(2){border-top:1px solid #ccc}context>div>a{position:relative;padding:8px;font-size:14px;text-align:center;vertical-align:center;display:flex;font-weight:700;justify-content:center;color:#fff;-webkit-user-select:none;-ms-user-select:none;user-select:none}context a:active{opacity:.3}context a span{height:16px;display:inline-block;position:relative;top:-3px;margin-right:2px}"}],o=e=>{e=document.getElementById(e);e&&e.remove()};for(let e of n)o(e.cleanName),"html"===e.ext?document.body.innerHTML+=e.content:"css"===e.ext?((t=document.createElement("style")).id=e.cleanName,t.appendChild(document.createTextNode(e.content)),document.head.appendChild(t)):((i=document.createElement("script")).id=e.cleanName,i.appendChild(document.createTextNode(e.content)),document.head.appendChild(i))}catch(e){console.error(e)}