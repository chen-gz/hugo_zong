// var search_result_id = 'searchResults'
// var search_input_id = 'searchInput'
var search_result_id = "search-results";
var search_input_id = "search-input";
var fuse; // holds our search engine
var fuseIndex;
var searchVisible = false;
var firstRun = true; // allow us to delay loading json data unless search activated
var list = document.getElementById(search_result_id); // targets the <ul>
var first = list.firstChild; // first child of search list
var last = list.lastChild; // last child of search list
var maininput = document.getElementById(search_input_id); // input box for search
var resultsAvailable = true; // Did we get any search results?

// ==========================================
// The main keyboard event listener running the show
//
document.addEventListener("keydown", function (event) {
  console.log("keydown");
  // CMD-/ to show / hide Search
  if (event.altKey && event.which === 191) {
    // Load json search index if first time invoking search
    // Means we don't load json unless searches are going to happen; keep user payload small unless needed
    doSearch(event);
      showSearch();
  }

  // Allow ESC (27) to close search box
  if (event.keyCode == 27) {
    // if (searchVisible) {
    //   // document.getElementById("fastSearch").style.visibility = "hidden";
    document.activeElement.blur();
    hideSearch();
  }

  // DOWN (40) arrow
  // if (event.keyCode == 40) {
  //   if (searchVisible && resultsAvailable) {
  //     console.log("down");
  //     event.preventDefault(); // stop window from scrolling
  //     if (document.activeElement == maininput) {
  //       // first.focus();
  //     } // if the currently focused element is the main input --> focus the first <li>
  //     else if (document.activeElement == last) {
  //       last.focus();
  //     } // if we're at the bottom, stay there
  //     else {
  //       document.activeElement.parentElement.nextSibling.firstElementChild.focus();
  //     } // otherwise select the next search result
  //   }
  // }

  // UP (38) arrow
  // if (event.keyCode == 38) {
  //   if (searchVisible && resultsAvailable) {
  //     event.preventDefault(); // stop window from scrolling
  //     if (document.activeElement == maininput) {
  //       maininput.focus();
  //     } // If we're in the input box, do nothing
  //     else if (document.activeElement == first) {
  //       maininput.focus();
  //     } // If we're at the first item, go to input box
  //     else {
  //       document.activeElement.parentElement.previousSibling.firstElementChild.focus();
  //     } // Otherwise, select the search result above the current active one
  //   }
  // }
});

// ==========================================
// execute search as each character is typed
//
document.getElementById(search_input_id).onkeyup = function (e) {
  searchVisible = true;
  doSearch(e);
  executeSearch(this.value);
};
document.getElementById(search_input_id).onclick = function (e) {
  searchVisible = true;
  doSearch(e);
  executeSearch(this.value);
};

document.querySelector("body").onclick = function (e) {
  if (e.target.tagName === "BODY" || e.target.tagName === "DIV") {
    hideSearch();
  }
};

// document.querySelector("#search-btn").onclick = function(e) {
//     doSearch(e)
// }

function doSearch(e) {
    console.log("doSearch()");
  e.stopPropagation();
  if (firstRun) {
    loadSearch(); // loads our json data and builds fuse.js search index
    firstRun = false; // let's never do this again
  }
  // Toggle visibility of search box
  if (searchVisible) {
    showSearch(); // search visible
  } else {
    hideSearch();
  }
}

function hideSearch() {
  document.getElementById("search-result-wrapper").style.display = "none";
  document.getElementById("panel-wrapper").style.display = "flex";
  document.getElementById("core-wrapper").style.display = "flex";
  // document.activeElement.blur(); // remove focus from search box
  searchVisible = false;
}

function showSearch() {
    console.log("showSearch()");
  document.getElementById("search-result-wrapper").style.display = "flex";
  document.getElementById("panel-wrapper").style.display = "none";
  document.getElementById("core-wrapper").style.display = "none";
  // document.getElementById("core-wrapper").style.maxWidth = "0px";
  // document.getElementById("core-wrapper").style.visibility = "hidden";
  document.getElementById(search_input_id).focus(); // put focus in input box so you can just start typing
  searchVisible = true;
}

// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}

// ==========================================
// load our search index, only executed once
// on first call of search box (CMD-/)
//
function loadSearch() {
  console.log("loadSearch()");
  fetchJSONFile("/index.json", function (data) {
    var options = {
      // fuse.js options; check fuse.js website for details
      shouldSort: true,
      location: 0,
      distance: 100,
      threshold: 0.4,
      minMatchCharLength: 2,
      keys: ["permalink", "title", "tags", "contents", "categories"],
    };
    // Create the Fuse index
    fuseIndex = Fuse.createIndex(options.keys, data);
    fuse = new Fuse(data, options, fuseIndex); // build the index from the json file
    console.log("Fuse index loaded");
  });
}

// ==========================================
// using the index we loaded on CMD-/, run
// a search query (for "term") every time a letter is typed
// in the search box
//
function executeSearch(term) {
  console.log(typeof fuse);
  let results = fuse.search(term); // the actual query being run using fuse.js
  let searchitems = ""; // our results bucket

  if (results.length === 0) {
    // no results based on what was typed into the input box
    resultsAvailable = false;
    searchitems = "";
  } else {
    // build our html
    // console.log(results)
    permalinks = [];
    numLimit = 5;
    for (let item in results) {
      // only show first 5 results
      if (item > numLimit) {
        break;
      }
      if (permalinks.includes(results[item].item.permalink)) {
        continue;
      }
      //   console.log('item: %d, title: %s', item, results[item].item.title)
      // searchitems = searchitems + '<li><a href="' + results[item].item.permalink + '" tabindex="0">' + '<span class="title">' + results[item].item.title + '</span></a></li>';
      searchitems =
        searchitems +
        '<div class="pl-1 pr-1 pl-sm-2 pr-sm-2 pl-lg-4 pr-lg-4 pl-xl-0 pr-xl-0">' +
        '<a href="' +
        results[item].item.permalink +
        '">' +
        results[item].item.title +
        "</a>" +
        '<div class="post-meta d-flex flex-column flex-sm-row text-muted mt-1 mb-1"> <div class="mr-sm-4">' +
        '<i class="far fa-folder fa-fw"></i>' +
        results[item].item.categories +
        '</div> <div><i class="fa fa-tag fa-fw"></i>' +
        results[item].item.tags +
        "</div></div>" +
        "<p>" +
        results[item].item.contents +
        "</p></div>";
      permalinks.push(results[item].item.permalink);
    }
    resultsAvailable = true;
  }

  document.getElementById(search_result_id).innerHTML = searchitems;
  if (results.length > 0) {
    first = list.firstChild.firstElementChild; // first result container — used for checking against keyboard up/down location
    last = list.lastChild.firstElementChild; // last result container — used for checking against keyboard up/down location
  }
}
