var NavTree = function (options) {
  var element = document.querySelector(options.selector);

  var props = {
    element: document.querySelector(options.selector),
    searchable: options.searchable || false,
    showEmptyGroups: options.showEmptyGroups || false,
    groupOpenIconClass: (options.groupOpenIconClass && options.groupOpenIcon) ? options.groupOpenIconClass : "fas",
    groupOpenIcon: (options.groupOpenIconClass && options.groupOpenIcon) ? options.groupOpenIcon : "fa-chevron-down",
    groupCloseIconClass: (options.groupCloseIconClass && options.groupCloseIcon) ? options.groupCloseIconClass : "fas",
    groupCloseIcon: (options.groupCloseIconClass && options.groupCloseIcon) ? options.groupCloseIcon : "fa-chevron-right",
    linkIconClass: (options.linkIconClass && options.linkIcon) ? options.linkIconClass : "fas",
    linkIcon: (options.linkIconClass && options.linkIcon) ? options.linkIcon : "fa-link",
    searchPlaceholderText: options.searchPlaceholderText || ""
  }

  var getIconWithWrapper = (iconClass, icon) => {
    var wrapper = document.createElement('span');
    wrapper.classList.add("d-inline-block", "tree-icon");
    wrapper.style.width = '25px';
    wrapper.innerHTML = `<i class="${iconClass} ${icon}"></i>`;
    return wrapper;
  }


  var copyAttrs = (src, target) => {
    for (let attr of src.attributes) {
      if (attr.name == "class")
        attr.value.split(" ").forEach((cls) => target.classList.add(cls))
      else
        target.setAttribute(attr.name, attr.value);
    }
  }


  var init = function () {
    if (!props.parent) {
      var new_parent = document.createElement('div');
      new_parent.setAttribute('id', 'nav-tree-wrapper');
      element.parentElement.replaceChild(new_parent, element);
      new_parent.appendChild(element);
      props.parent = new_parent;
    }

    element.classList.add("nav", "flex-column");

    element.querySelectorAll("ul").forEach((ul) => ul.classList.add("nav", "flex-column")); // add bs5 classes to lists

    element.querySelectorAll("li").forEach((li) => {
      const li_id = li.getAttribute("id");
      li.classList.add("nav-item"); // add bs5 class to list item

      const a = li.querySelector("a");
      a.classList.add("nav-link");
      a.setAttribute("id", "tree-link-" + li_id);


      if (li.querySelector("ul")) { // check list item has a ul object
        a.classList.add("tree-group-link");
        a.setAttribute("data-bs-toggle", "collapse");
        a.setAttribute("role", "button");
        a.setAttribute("aria-expanded", "false");
        a.setAttribute("href", "#nav-tree-list-wrapper-" + li_id);
        a.setAttribute("aria-controls", "nav-tree-list-wrapper-" + li_id);
        a.prepend(getIconWithWrapper(props.groupCloseIconClass, props.groupCloseIcon));


        const ul = li.querySelector("ul");

        var collapsable = document.createElement('div');
        collapsable.classList.add("collapse", "ms-4");
        collapsable.setAttribute("id", "nav-tree-list-wrapper-" + li_id);
        li.replaceChild(collapsable, ul);
        collapsable.appendChild(ul);
        new bootstrap.Collapse(collapsable, { toggle: false });

        collapsable.addEventListener('show.bs.collapse', (e) => {
          e.target.parentElement.querySelector('.tree-icon i').classList.replace(props.groupCloseIcon, props.groupOpenIcon);
          e.target.parentElement.querySelector('.tree-icon i').classList.replace(props.groupCloseIconClass, props.groupOpenIconClass);
        });

        collapsable.addEventListener('hide.bs.collapse', (e) => {
          e.target.parentElement.querySelector('.tree-icon i').classList.replace(props.groupOpenIcon, props.groupCloseIcon);
          e.target.parentElement.querySelector('.tree-icon i').classList.replace(props.groupOpenIconClass, props.groupCloseIconClass);

          if (e.target.querySelector('.collapse'))
            bootstrap.Collapse.getInstance(e.target.querySelector('.collapse')).hide();
        });

      } else {

        a.classList.add("tree-link");

        a.prepend(getIconWithWrapper(props.linkIconClass, props.linkIcon));

        a.addEventListener('click', () => {
          props.parent.querySelectorAll('a.tree-link').forEach((link) => {
            link.classList.remove('active');
          });

          a.classList.add('active');
        });

      }

      a.querySelector('.tree-icon i').setAttribute('id', 'tree-icon-' + li_id);

    });

    if (props.searchable) {
      var search_parent = document.createElement('div');
      search_parent.setAttribute('id', 'nav-tree-search-wrapper');
      search_parent.classList.add('mx-3', 'my-2');
      props.parent.prepend(search_parent);
      search_parent.innerHTML = `<input type="text" name="menu-tree-search" id="menu-tree-search" class="form-control" placeholder="${props.searchPlaceholderText}">`;

      search_parent.firstChild.addEventListener('keyup', (e) => {
        const nodes = Array.from(document.querySelectorAll("li"));
        nodes.forEach((i) => i.classList.remove("d-none"));

        if (e.target.value !== '') {
          nodes.filter((i) => !i.querySelector('a').text.toLowerCase().includes(e.target.value)).forEach((i) => i.classList.add("d-none"));
          nodes.filter((node) => node.querySelector('a').classList.contains('tree-group-link')).forEach((node) => {
            if (Array.from(node.querySelectorAll("li")).filter((li) => !li.classList.contains('d-none')).length > 0) {
              const c = node.querySelector('.collapse');
              c.classList.add('no-transition');
              bootstrap.Collapse.getInstance(c).show();
              node.classList.remove('d-none');
              c.classList.remove('no-transition');
            } else if (!props.showEmptyGroups) {
              node.classList.add('d-none');
            }
          });
        }
      });
    }
  }

  this.update = function (menu_html) {
    const old = element.cloneNode(true);
    props.parent.innerHTML = menu_html;
    element = props.parent.querySelector('ul');
    this.init();
    Array.from(old.querySelectorAll("[id]")).map((i) => i.getAttribute("id")).forEach((id) => {
      var new_node = element.querySelector("#" + id);
      var old_node = old.querySelector("#" + id);
      if (new_node && old_node)
        copyAttrs(old_node, new_node);
    });
  }



  init();
}