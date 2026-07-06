export async function loadSidebar(activePage) {

    const html = await fetch("/utils//sidebar.html")
        .then(res => res.text());

    $("body").prepend(html);

    $(`.sidebar-link[data-page="${activePage}"]`)
        .addClass("active");
}