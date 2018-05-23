function Lazyloading({ LAZY_LOADING_ATTRIBUTE, LAZY_LOADING_VIEWPORT_OFFSET, LAZY_LOADING_SCROLL_DEBOUNCE }) {
    const delay = (() => {
        let timer = 0;
        return (callback, ms) => {
            clearTimeout(timer);
            setTimeout(callback, ms);
        };
    })();

    const isInViewport = (node) => {
        if ((LAZY_LOADING_VIEWPORT_OFFSET + node.offsetTop) > window.pageYOffset
            && (node.offsetTop) < (window.outerHeight + window.pageYOffset)
        ) {
            if ((LAZY_LOADING_VIEWPORT_OFFSET + node.offsetLeft) > window.pageXOffset
                && (node.offsetLeft) < (window.pageXOffset + window.outerWidth)) {
                return true;
            }
        }
        return false;
    };

    const processLazyloadImageNode = (node) => {
        if (isInViewport(node)) {
            if (node.attributes[LAZY_LOADING_ATTRIBUTE]) {
                node.src = node.attributes[LAZY_LOADING_ATTRIBUTE].value;
                node.attributes.removeNamedItem(LAZY_LOADING_ATTRIBUTE)
            }
        }
    }

    const config = {
        subtree: true,
        attributes: true,
        childList: true
    };

    const nodesHandler = (nodes, handler) => {
        return nodes.forEach((node) => {
            if (!node
                && ((node.localName.toLowerCase() !== 'img')
                    || !node.localName
                    || !node.attributes
                    || !node.attributes[LAZY_LOADING_ATTRIBUTE])
            ) {
                if (node.childNodes && node.childNodes.length) {
                    nodesHandler(node.childNodes, handler);
                }
                return;
            }
            return handler(node);
        });
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutationRecord) => {
            let nodes = mutationRecord.addedNodes;
            if (!nodes || !nodes.length) {
                return;
            }
            nodesHandler(nodes, processLazyloadImageNode);
        });
    });

    observer.observe(document, config);

    window.addEventListener('scroll', function (e) {
        delay(() => {
            e.target.querySelectorAll(`img[${LAZY_LOADING_ATTRIBUTE}]`).forEach(processLazyloadImageNode);
        }, LAZY_LOADING_SCROLL_DEBOUNCE);
    });

    return {
        processLazyloadImageNode
    };
}
