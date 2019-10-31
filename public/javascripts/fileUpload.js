const rootStyles = window.getComputedStyle(document.documentElement);

if ((rootStyles.getPropertyValue("--book-cover-width-large") != null) &&
    (rootStyles.getPropertyValue("--book-cover-width-large") !== "")) {
    console.log("in fileUpload.js, about to call ready() method");
    ready();
} else {
    console.log("in fileUpload.js, about to set up 'load' event listener to call ready() method");
    // We'll reach this point if the "--book-cover-width-large" has NOT been 
    // loaded yet for the page.  In that case, we'll set  up an event listener
    // to be notified after the page has loaded.
    document.getElementById('main-css').addEventListener('load', ready);
}

function ready() {
    console.log("in fileUpload.js, entered ready() method");
    const coverWidth = parseFloat(rootStyles.getPropertyValue("--book-cover-width-large"));
    const coverAspectRatio = parseFloat(rootStyles.getPropertyValue("--book-cover-aspect-ratio"));
    const coverHeight = coverWidth / coverAspectRatio;
    console.log(`in fileUpload.js ready() method. coverWidth: ${coverWidth}; coverHeight: ${coverHeight}; coverAspectRatio: ${coverAspectRatio}`);
    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginImageResize,
        FilePondPluginFileEncode
    );
    
    console.log("in fileUpload.js ready() method, about to call FilePond.setOptions() method");

    FilePond.setOptions({
        stylePanelAspectRatio: 1 / coverAspectRatio,
        imageResizeTargetWidth: coverWidth,
        imageResizeTargetHeight: coverHeight
    });
    
    console.log("in fileUpload.js ready() method, about to call FilePond.parse() method");
    
    FilePond.parse(document.body);
}

