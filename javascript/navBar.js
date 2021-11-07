function addNavBar() {
    let navBarEl = document.querySelector(".navigation-bar");

    let homeEl = document.createElement("a");
    navBarEl.appendChild(homeEl);
    homeEl.href = "/index.html";
    homeEl.classList.add("top", "bordered");

    let aboutEl = document.createElement("a");
    navBarEl.appendChild(aboutEl);
    aboutEl.href = "/about.html";
    aboutEl.classList.add("top", "bordered");

    let projectsEl = document.createElement("a");
    navBarEl.appendChild(projectsEl);
    projectsEl.href = "/projects.html";
    projectsEl.classList.add("top", "bordered");

    let gamesEl = document.createElement("a");
    navBarEl.appendChild(gamesEl);
    gamesEl.href = "/games.html";
    gamesEl.classList.add("top", "bordered");
}