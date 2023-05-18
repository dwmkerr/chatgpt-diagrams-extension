//  observe.js
//
//  Enables the creation of a mutation observer that watches for new code
//  sample elements.
//
//  Note: this does not seem to work (maybe due to the fact ChatGPT uses React)
//  so for now an observer is not used. Instead, we simple check the DOM tree
//  on an interval.

//  Creates a new Mutation Observer
const observer = new MutationObserver((mutationList, observer) => {
  mutationList.forEach((mutation) => {
    switch (mutation.type) {
      case "childList":
        //  Update the diagrams.
        console.log("childList mutation, scanning for diagrams...");
        updateDiagrams(mutation.addedNodes);
      case "attributes":
        /* An attribute value changed on the element in
           mutation.target.
           The attribute name is in mutation.attributeName, and
           its previous value is in mutation.oldValue. */
        break;
    }
  });
});

//  Get the document body, cross-browser compatible.
var container = document.documentElement || document.body;

// Starts observing the child list of the element
observer.observe(document.body, {
  childList: true,
});
