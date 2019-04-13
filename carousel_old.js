function addListenerMulti(element, eventNames, listener) {
    var events = eventNames.split(' ');
    for (var i=0, iLen=events.length; i<iLen; i++) {
        element.removeEventListener(events[i], listener, false);
        element.addEventListener(events[i], listener, false);
    }
}
function Carousel(settings){
    this.element = settings.element;
    this.intervalTime = settings.intervalTime;
    this.index = 0;
    this.itemCount = settings.itemCount || 1;
    this.reinit();
}
Carousel.prototype = {
    reinit: function () {
        const that = this;
        this.items = this.element.querySelectorAll("div.slide_img");
        this.maxIndex = this.items.length;
        let idx = 0;

        for(let el of that.element.querySelectorAll(".slide_img")) {
            el.classList.remove("slide-out");
            el.classList.remove("slide-out-to-right");
            el.classList.remove("slide-in");
            el.classList.remove("slide-in-to-right");
        }
        that.element.getElementsByClassName("slide_dots")[0].innerHTML = "";
        for(let item of this.items){
            let dot = document.createElement("div");
            if(idx === that.index) {
                dot.classList.add("active");
                item.classList.remove("hide");
            }
            else
                item.classList.add("hide");
            dot.classList.add("dot");
            dot.setAttribute("data-index", idx);
            that.element.querySelector(".slide_dots").appendChild(dot);
            addListenerMulti(dot, "click",function () {
                that.element.querySelector(".dot.active").classList.remove("active");
                that.goto(this.getAttribute("data-index"));
                this.classList.add("active");
                if(that.intervalTime)
                    that.setInterval();
            });
            item.setAttribute("data-index", idx.toString());
            let handler = function () {
                for(let el of that.element.querySelectorAll(".slide_img")) {
                    el.classList.remove("slide-out");
                    el.classList.remove("slide-out-to-right");
                    el.classList.remove("slide-in");
                    el.classList.remove("slide-in-to-right");
                }
                if(item.dataset.index == that.index)
                    item.classList.remove("hide");
                else
                    item.classList.add("hide");

                that.element.querySelector(".nextButton").classList.remove("p-none");
                that.element.querySelector(".prevButton").classList.remove("p-none");
                for(let dot of that.element.querySelectorAll(".dot"))
                    dot.classList.remove("p-none");
                that.element.querySelector(".dot.active").classList.remove("active");
                that.element.querySelector(".dot[data-index = '"+that.index+"']").classList.add("active");

                // that.updateHeight();
            };
            addListenerMulti(item, "webkitAnimationEnd animationend", handler);
            idx++;
        }
        if(this.maxIndex>1 && that.intervalTime)
            that.setInterval();
        this.element.querySelector(".nextButton").addEventListener("click",function () {
            that.goto("next");
            if(that.intervalTime)
                that.setInterval();
        });
        this.element.querySelector(".prevButton").addEventListener("click",function () {
            that.goto("prev");
            if(that.intervalTime)
                that.setInterval();
        });
        // that.updateHeight();
    },
    setInterval: function(){
        const that = this;
        clearInterval(that.interval);
        if(!this.element.parentNode.hasAttribute("contenteditable")) {
            this.interval = setInterval(function () {
                if(that.items.length > 1)
                    that.goto("next");
            }, this.intervalTime)
        }
    },
    goto: function (action) {
        const that =this;
        this.element.querySelector(".nextButton").classList.add("p-none");
        this.element.querySelector(".prevButton").classList.add("p-none");
        for(let dot of that.element.querySelectorAll(".dot"))
            dot.classList.add("p-none");
        let old_slide = that.element.querySelector(".slide_img[data-index = '"+that.index+"']");
        if(action === "next")
            that.index = ++that.index % that.maxIndex;
        else if(action === "prev"){
            that.index--;
            if(that.index<0)
                that.index = that.maxIndex-1;
            else
                that.index = that.index % that.maxIndex;
        }
        else if(typeof parseInt(action) === "number" && that.index !== parseInt(action)){
            action = parseInt(action);
            if(action < that.index) {
                that.index = action;
                action = "prev";
            }
            else {
                that.index = action;
                action = "next";
            }
        }
        let new_slide = that.element.querySelector(".slide_img[data-index = '"+that.index+"']");
        new_slide.classList.remove("hide");
        if(action === "next") {
            old_slide.classList.add("slide-out-to-right");
            new_slide.classList.add("slide-in-to-right");
        }
        else if(action === "prev") {
            old_slide.classList.add("slide-out");
            new_slide.classList.add("slide-in");
        }
        else{
            this.element.querySelector(".nextButton").classList.remove("p-none");
            this.element.querySelector(".prevButton").classList.remove("p-none");
            for(let dot of that.element.querySelectorAll(".dot"))
                dot.classList.remove("p-none");
        }
    },
    updateHeight: function () {
        const that =this;
        $(this.element).find(".slide_img").each(function (val) {
            if(!$(this).hasClass("hide")) {
                $(that.element).parents(".slider-proto").css("height", $(this).find("img").height()+"px");
            }
        })

    },
    clearInterval: function () {
        const that = this;
        clearInterval(that.interval);
    }
};