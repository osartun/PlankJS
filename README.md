PlankJS
=======

An uneasy, yet smaller and more performant kind of jQuery-thingy. Like UnderscoreJS for DOM-Manipulation.

##Aims

With great possiblities come great performance deficits. Have you seen the call stack for i.e. the jQuery-css() function? It's bloooated. That's alright if you're writing a sophisticated Website or Webapp for those powerful desktop browsers of today. But if you're targeting under-performing old or mobile browsers you'd rather take ZeptoJS or this one.

- *Closer to the core*: Most of the functions in PlankJS are just wrappers for native DOM-functions, just adding a little pinch of convenience and cross-browser compatibility
- *Caching is opt-out, not opt-in*: Remember reading all those jQuery-Tutorials in which everyone says "Don't forget to cache your jQuery objects"? Well, why don't we just cache them internally to speed up all those queries? Suddenly an uncached P("p") in a loop is just as performant as a cached one. The same goes for functions like offset() or width() or height() of which the results are also cached to minimize the costly reflow processes. You can disable caching globally, per instance or per function, if you want to.
- *Static or instance*: Inspired by UnderscoreJS you can use every function as a static one or per instance. So P.height(myElement) is the same thing as P(myElement).height().

##How to use it

###Start

Closures are a great thing, so first of all do this:

    (function (P) {
      // You're code goes here
    })(window.Plank);
    
###Static or instance

You can choose to use the functions from Plank for your DOM-Element or wrap this Element within a Plank-object.

    var myElement = document.getElementByTagName("*")[0];
    P.height(myElement);
    P(myElement).height();
    
The amazing thing: Plank's cache is global. So, if you call P.height(myElement) first, P(myElement).height() retrieves the just determined height from the cache.

###Disable Caching

Of course, sometimes it's necessary to retrieve the latest data and not fall back to the cache. That's why you can disable caching in several ways.

    P.noCache = true; // Disable globally: Never, ever cache anything at all
    var p = P("p"); p.noCache = true; // Disable per instance: Whatever I'm doing with this instance, everything is new data, nothing cached
    p.height(true);
    P.height(myElement, true); // Disable per function: Passing true as the last argument to a function which would use the cache, prevents it from doing so
