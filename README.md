PlankJS
=======

An uneasy, yet smaller and more performant kind of jQuery-thingy. Like UnderscoreJS for DOM-Manipulation.

##Aims

With great possiblities come great performance deficits. Have you seen the call stack for i.e. the jQuery-css() function? It's bloooated. That's alright if you're writing a sophisticated Website or Webapp for those powerful desktop browsers of today. But if you're targeting under-performing old or mobile browsers you'd rather take ZeptoJS or this one.

- *Closer to the core*: Most of the functions in PlankJS are just wrappers for native DOM-functions, just adding a little pinch of convenience and cross-browser compatibility
- *Caching is opt-out, not opt-in*: Remember reading all those jQuery-Tutorials in which everyone says "Don't forget to cache your jQuery objects"? Well, why don't we just cache them internally to speed up all those queries? Suddenly an uncached P("p") in a loop is just as performant as a cached one. The same goes for functions like offset() or width() or height() of which the results are also cached to minimize the costly reflow processes. You can disable caching globally, per instance or per function, if you want to.
- *Static or instance*: Inspired by UnderscoreJS you can use every function as a static one or per instance. So P.height(myElement) is the same thing as P(myElement).height().
