function addListenerMulti(element, eventNames, listener) {
    var events = eventNames.split(' ');
    for (var i=0, iLen=events.length; i<iLen; i++) {
        element.removeEventListener(events[i], listener, false);
        element.addEventListener(events[i], listener, false);
    }
}
Element.prototype.appendAfter = function (element) {
    element.parentNode.insertBefore(this, element.nextSibling);
};
Element.prototype.appendBefore = function (element) {
    element.parentNode.insertBefore(this, element);
};
Element.prototype.appendAll = function (nodes) {
    for(let node of nodes)
        this.appendChild(node);
};
Element.prototype.removeAll = function (selector) {
    for(let el of this.querySelectorAll(selector))
        el.remove();
};
NodeList.prototype.toArray = function(){
    return Array.prototype.slice.call(this)
};
/**
 * This is the description for my class.
 *
 * @class Carousel
 * @constructor
 * @param {Object} settings A config object
 * ```Cycript
 * new Carousel({});
 * ```
 */
function Carousel(settings){
    let options = {
        autoPlay: 5000,
        animationTime: 5000,
        visibleItemCount: 2,
        transitionTimingFunction: "linear",
        center: true,
        vCenter: true,
        loop: true
    };
    Object.assign(options,settings);
    this.element = options.element;
    this.intervalTime = options.autoPlay;
    this.visibleItemCount = options.visibleItemCount;
    this.center = options.center;
    this.vCenter = options.vCenter;
    this.loop = options.loop;
    this.animationTime = options.animationTime;
    this.transitionTimingFunction = options.transitionTimingFunction;
    this.index = 0;
    this.reinit();
}
Carousel.prototype = {
    /**
     * This is the description for my class.
     *
     * @method reinit
     */
    reinit: function () {
        const that = this;
        this.items = this.element.querySelectorAll("div.slide:not(.extra_slide)").toArray();
        this.maxIndex = this.items.length;
        this.slideWidth = this.element.getBoundingClientRect().width/this.visibleItemCount;
        this.pagination();
        this.slidePosition();
        let handler = function () {
            that.element.style.transitionTimingFunction = "";
            that.element.style.transition = "";
            that.element.querySelector(".nextButton").classList.remove("p-none");
            that.element.querySelector(".prevButton").classList.remove("p-none");
            for(let dot of that.element.querySelectorAll(".dot"))
                dot.classList.remove("p-none");
            that.element.querySelector(".dot.active").classList.remove("active");
            that.element.querySelector(".dot[data-index = '"+that.index+"']").classList.add("active");
            for(let el of that.element.querySelectorAll(".extra_slide")) {
                el.remove();
                if(that.action === "next") {
                    that.element.style.marginLeft = (parseFloat(that.element.style.marginLeft) + (that.slideWidth)) + "px";
                    that.element.style.width = (that.element.getBoundingClientRect().width - (that.slideWidth)) + "px";
                }
            }
            that.action = false;

            if(that.intervalTime)
                that.setInterval();
        };
        addListenerMulti(this.element, "transitionend webkitTransitionEnd", handler);
        if(this.maxIndex>1 && that.intervalTime)
            this.setInterval();
    },
    slidePosition: function(){
        const that = this;
        for(let slide of this.items){
            slide.style.minWidth = that.slideWidth+"px";
            if(that.vCenter) {
                slide.style.marginTop = ((slide.parentNode.offsetHeight - slide.offsetHeight) / 2) + 'px';
            }
        }
        if(this.center){
            this.offset = (this.visibleItemCount-2)/2;
            if(this.loop) {
                this.element.style.marginLeft = -that.slideWidth/2+ "px";
                this.element.defaultMargin = -that.slideWidth/2+ "px";
                this.element.style.width = (this.element.getBoundingClientRect().width+that.slideWidth/2) + "px";
                for (let i = 0; i < parseInt(that.offset) + 1; i++) {
                    that.items = that.element.querySelectorAll("div.slide").toArray();
                    that.element.insertBefore(that.items[that.items.length - 1], that.items[0])
                }
            }
            else{
                this.element.style.marginLeft = +(this.offset+0.5)*that.slideWidth+ "px";
                this.element.defaultMargin = +(this.offset+0.5)*that.slideWidth+ "px";
                this.element.style.width = (this.element.getBoundingClientRect().width+(this.offset+0.5)*that.slideWidth) + "px";
                this.element.defaultWidth = (this.element.getBoundingClientRect().width+(this.offset+0.5)*that.slideWidth) + "px";
            }
        }
        else {
            that.element.querySelectorAll(".dot").forEach(function (el, index) {
                if(index%that.visibleItemCount !== 0)
                    el.remove()
            });
            this.element.style.marginLeft = "0px";
            this.element.defaultMargin = "0px";
            this.element.style.width = (this.element.getBoundingClientRect().width) + "px";
            this.element.defaultWidth = (this.element.getBoundingClientRect().width) + "px";
        }
    },
    /**
     * This is the description for my class.
     *
     * @method addSlide
     */
    addSlide: function(html){
        let slide = document.createElement("div");
        slide.classList.add("slide");
        slide.innerHTML = html;
        slide.setAttribute("data-index", this.maxIndex);
        this.element.removeAll(".extra_slide");
        let lastSlide = this.element.querySelectorAll(".slide[data-index='"+(this.maxIndex-1)+"']:not(.extra_slide)");
        for(let _last of lastSlide) {
            slide.appendAfter(_last);
        }
        this.element.removeAll(".slide");
        this.items.push(slide);
        this.items.sort(function(a, b){return parseInt(a.getAttribute("data-index")) - parseInt(b.getAttribute("data-index"))});
        this.element.appendAll(this.items);
        this.maxIndex = this.maxIndex + 1;
        this.slidePosition();
        this.addDot(this.maxIndex-1);

    },
    addDot: function(idx){
        const that = this;
        let dot = document.createElement("div");
        if(idx === that.index)
            dot.classList.add("active");
        dot.classList.add("dot");
        dot.setAttribute("data-index", idx);
        that.element.querySelector(".slide_dots").appendChild(dot);
        addListenerMulti(dot, "click",function () {
            that.element.querySelector(".dot.active").classList.remove("active");
            that.goToSlide(this.getAttribute("data-index"));
            this.classList.add("active");
            if(that.intervalTime)
                that.clearInterval();
        });
    },
    pagination: function(){
        const that = this;
        let idx = 0;
        that.element.getElementsByClassName("slide_dots")[0].innerHTML = "";
        for(let item of this.items){
            that.addDot(idx);
            item.setAttribute("data-index", idx.toString());
            idx++;
        }

        this.element.querySelector(".nextButton").addEventListener("click",function () {
            let target = Object.assign({}, that).index;
            if(!that.center)
                target+=4;
            else
                target+=1;
            if(target<that.maxIndex) {
                that.goToSlide(target);
                if (that.intervalTime)
                    that.setInterval();
            }
            else if(that.loop) {
                that.goToSlide((target), true, false);
                if (that.intervalTime)
                    that.setInterval();
            }
        });
        this.element.querySelector(".prevButton").addEventListener("click",function () {
            let target = Object.assign({}, that).index;
            if( !that.center)
                target-=4;
            else
                target-=1;
            if(target>-1) {
                that.goToSlide(target);
                if (that.intervalTime)
                    that.setInterval();
            }
            else if(that.loop) {
                that.goToSlide(-(target%that.maxIndex), false, true);
                if (that.intervalTime)
                    that.setInterval();
            }
        });
    },
    goToSlide: function (slide, next, prev) {
        const that =this;
        let count = parseInt(slide) - that.index;
        let action = "next";
        if(count<0) {
            action = "prev";
            count*=-1;
        }
        if(count>that.maxIndex) {
            action = "prev";
            count-=that.maxIndex;
        }
        if(next){
            action = "next"
        }
        if(prev){
            action = "prev"
        }
        that.animateAction(count+"-"+action);
    },
    animateAction: function (action) {
        const that =this;
        this.element.querySelector(".nextButton").classList.add("p-none");
        this.element.querySelector(".prevButton").classList.add("p-none");
        for(let dot of that.element.querySelectorAll(".dot"))
            dot.classList.add("p-none");
        let count = parseInt(action.split('-')[0]);
        action = action.split('-')[1];
        if(action === "next") {
            that.element.style.transitionTimingFunction = that.transitionTimingFunction;
            this.element.style.transition = "margin-left " + that.animationTime + "ms";
            this.element.style.webkitTransition = "margin-left " + that.animationTime + "ms";
            if(that.loop){
                let items = that.element.querySelectorAll(".slide");
                for(let i=0; i<count; i++){
                    let el = items[i%that.maxIndex].cloneNode(true);
                    items[i%that.maxIndex].classList.add("extra_slide");
                    that.element.appendChild(el);
                }
                that.action = "next";
            }
            that.index = (that.index+count);
            if(that.index>=that.maxIndex && that.loop) {
                that.index-=that.maxIndex;
            }
            if(that.index < that.maxIndex) {
                that.element.style.marginLeft = (parseFloat(that.element.style.marginLeft) - (count * that.slideWidth)) + "px";
                that.element.style.width = (that.element.getBoundingClientRect().width + (count * that.slideWidth)) + "px";
            }
            else {
                that.index = (that.index-count);
                that.disableAnimate();
            }
        }
        else if(action === "prev"){
            that.index = (that.index-count);
            if(that.loop){
                for(let i=0; i<count; i++){
                    let items = that.element.querySelectorAll(".slide");
                    let el = items[items.length-1 - i].cloneNode(true);
                    items[items.length-1-i].classList.add("extra_slide");
                    el.appendBefore(items[0]);

                }
                that.element.style.marginLeft = (parseFloat(that.element.style.marginLeft)-(count*that.slideWidth))+ "px";
                that.element.style.width = (that.element.getBoundingClientRect().width+(count*that.slideWidth)) + "px";
                if(that.index < 0)
                    that.index+=(that.maxIndex);
                that.action = "prev";
            }
            if(that.index > -1) {
                that.element.style.transitionTimingFunction = that.transitionTimingFunction;
                this.element.style.transition = "margin-left " + that.animationTime + "ms";
                that.element.style.marginLeft = (parseFloat(that.element.style.marginLeft)+(count*that.slideWidth))+ "px";
                that.element.style.width = (that.element.getBoundingClientRect().width-(count*that.slideWidth)) + "px";
            }
            else {
                that.index = (that.index+count);
                that.disableAnimate();
            }
        }
    },
    disableAnimate: function(){
        this.element.querySelector(".nextButton").classList.remove("p-none");
        this.element.querySelector(".prevButton").classList.remove("p-none");
        for(let dot of this.element.querySelectorAll(".dot"))
            dot.classList.remove("p-none");
    },
    setInterval: function(){
        const that = this;
        clearInterval(that.interval);
        if(!this.element.parentNode.hasAttribute("contenteditable")) {
            this.interval = setInterval(function () {
                if(that.items.length > 1) {
                    let target = Object.assign({}, that).index;
                    if(!that.center)
                        target+=4;
                    else
                        target+=1;
                    if(target<that.maxIndex) {
                        clearInterval(that.interval);
                        that.goToSlide(target);
                    }
                    else if(that.loop) {
                        clearInterval(that.interval);
                        that.goToSlide((target), true, false);
                    }
                }
            }, this.intervalTime)
        }
    },
    clearInterval: function () {
        const that = this;
        clearInterval(that.interval);
    }
};