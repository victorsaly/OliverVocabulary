"use strict";(self["webpackChunkoliver_vocabulary"]=self["webpackChunkoliver_vocabulary"]||[]).push([[7507],{7507:function(t,e,n){n.r(e),n.d(e,{startTapClick:function(){return o}});var i=n(5626),o=function(t){var e,n,o,v,f=10*-l,p=0,L=t.getBoolean("animated",!0)&&t.getBoolean("rippleEffect",!0),m=new WeakMap,h=function(){return void 0!==e&&null!==e.parentElement},E=function(t){f=(0,i.q)(t),q(t)},w=function(t){f=(0,i.q)(t),T(t)},b=function(t){var e=(0,i.q)(t)-l;f<e&&q(t)},g=function(t){var e=(0,i.q)(t)-l;f<e&&T(t)},k=function(){clearTimeout(v),v=void 0,n&&(R(!1),n=void 0)},q=function(t){n||h()||(e=void 0,y(a(t),t))},T=function(t){y(void 0,t)},y=function(t,e){if(!t||t!==n){clearTimeout(v),v=void 0;var o=(0,i.p)(e),a=o.x,c=o.y;if(n){if(m.has(n))throw new Error("internal error");n.classList.contains(s)||S(n,a,c),R(!0)}if(t){var d=m.get(t);d&&(clearTimeout(d),m.delete(t));var l=r(t)?0:u;t.classList.remove(s),v=setTimeout((function(){S(t,a,c),v=void 0}),l)}n=t}},S=function(t,e,n){p=Date.now(),t.classList.add(s);var i=L&&c(t);i&&i.addRipple&&(C(),o=i.addRipple(e,n))},C=function(){void 0!==o&&(o.then((function(t){return t()})),o=void 0)},R=function(t){C();var e=n;if(e){var i=d-Date.now()+p;if(t&&i>0&&!r(e)){var o=setTimeout((function(){e.classList.remove(s),m.delete(e)}),d);m.set(e,o)}else e.classList.remove(s)}},B=document;B.addEventListener("ionScrollStart",(function(t){e=t.target,k()})),B.addEventListener("ionScrollEnd",(function(){e=void 0})),B.addEventListener("ionGestureCaptured",k),B.addEventListener("touchstart",E,!0),B.addEventListener("touchcancel",w,!0),B.addEventListener("touchend",w,!0),B.addEventListener("mousedown",b,!0),B.addEventListener("mouseup",g,!0)},a=function(t){if(!t.composedPath)return t.target.closest(".ion-activatable");for(var e=t.composedPath(),n=0;n<e.length-2;n++){var i=e[n];if(i.classList&&i.classList.contains("ion-activatable"))return i}},r=function(t){return t.classList.contains("ion-activatable-instant")},c=function(t){if(t.shadowRoot){var e=t.shadowRoot.querySelector("ion-ripple-effect");if(e)return e}return t.querySelector("ion-ripple-effect")},s="ion-activated",u=200,d=200,l=2500}}]);
//# sourceMappingURL=7507.59e5814a.js.map