(function () {
  "use strict";

  const USERS_URL = "https://jsonplaceholder.typicode.com/users";
  const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";

  const loadUsersBtn = document.getElementById("loadUsersBtn");
  const searchInput = document.getElementById("searchInput");
  const statusMessage = document.getElementById("statusMessage");
  const usersList = document.getElementById("usersList");
  const postsArea = document.getElementById("postsArea");

  let allUsers = [];
  let isLoadingUsers = false;
  let isLoadingPosts = false;

  function showStatus(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = "status";
    if (type) {
      statusMessage.classList.add(type);
    }
  }

  function clearStatus() {
    statusMessage.textContent = "";
    statusMessage.className = "status";
  }

  async function loadUsers() {
    if (isLoadingUsers) return;

    isLoadingUsers = true;
    loadUsersBtn.disabled = true;
    showStatus("Загрузка...", "info");

    try {
      const response = await fetch(USERS_URL);

      if (!response.ok) {
        throw new Error("HTTP-ошибка: " + response.status);
      }

      const users = await response.json();

      allUsers = users;
      renderUsers(allUsers);
      searchInput.value = "";

      showStatus("Загружено пользователей: " + users.length, "info");
    } catch (error) {
      showStatus(
        "Не удалось загрузить пользователей: " +
          error.message +
          ". Попробуйте ещё раз.",
        "error"
      );
      usersList.innerHTML = "";
    } finally {
      isLoadingUsers = false;
      loadUsersBtn.disabled = false;
    }
  }

  function renderUsers(users) {
    usersList.innerHTML = "";

    if (users.length === 0) {
      const empty = document.createElement("p");
      empty.className = "placeholder";
      empty.textContent = "Пользователи не найдены";
      usersList.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();

    users.forEach(function (user) {
      fragment.appendChild(createUserCard(user));
    });

    usersList.appendChild(fragment);
  }

  function createUserCard(user) {
    const card = document.createElement("div");
    card.className = "user-card";

    const name = document.createElement("div");
    name.className = "user-card__name";
    name.textContent = user.name;

    const email = document.createElement("div");
    email.className = "user-card__email";
    email.textContent = user.email;

    const city = document.createElement("div");
    city.className = "user-card__city";
    city.textContent = "Город: " + (user.address && user.address.city ? user.address.city : "—");

    const actions = document.createElement("div");
    actions.className = "user-card__actions";

    const postsBtn = document.createElement("button");
    postsBtn.type = "button";
    postsBtn.className = "btn btn-secondary";
    postsBtn.textContent = "Показать публикации";
    postsBtn.addEventListener("click", function () {
      loadPosts(user);
    });

    actions.appendChild(postsBtn);

    card.appendChild(name);
    card.appendChild(email);
    card.appendChild(city);
    card.appendChild(actions);

    return card;
  }

  function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (allUsers.length === 0) {
      return;
    }

    const filtered = allUsers.filter(function (user) {
      return user.name.toLowerCase().includes(query);
    });

    renderUsers(filtered);
  }

  async function loadPosts(user) {
    if (isLoadingPosts) return;

    isLoadingPosts = true;
    showStatus("Загрузка публикаций...", "info");
    postsArea.innerHTML = "";

    const loading = document.createElement("p");
    loading.className = "placeholder";
    loading.textContent = "Загрузка...";
    postsArea.appendChild(loading);

    try {
      const url = POSTS_URL + "?userId=" + encodeURIComponent(user.id);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("HTTP-ошибка: " + response.status);
      }

      const posts = await response.json();
      const firstThree = posts.slice(0, 3);

      postsArea.innerHTML = "";

      const heading = document.createElement("p");
      heading.className = "placeholder";
      heading.textContent = "Публикации пользователя: " + user.name;
      postsArea.appendChild(heading);

      if (firstThree.length === 0) {
        const empty = document.createElement("p");
        empty.className = "placeholder";
        empty.textContent = "У этого пользователя нет публикаций.";
        postsArea.appendChild(empty);
      } else {
        firstThree.forEach(function (post) {
          postsArea.appendChild(createPostCard(post));
        });
      }

      clearStatus();
    } catch (error) {
      postsArea.innerHTML = "";
      showStatus(
        "Не удалось загрузить публикации: " +
          error.message +
          ". Попробуйте ещё раз.",
        "error"
      );

      const retryBtn = document.createElement("button");
      retryBtn.type = "button";
      retryBtn.className = "btn btn-secondary";
      retryBtn.textContent = "Повторить";
      retryBtn.addEventListener("click", function () {
        loadPosts(user);
      });
      postsArea.appendChild(retryBtn);
    } finally {
      isLoadingPosts = false;
    }
  }

  function createPostCard(post) {
    const card = document.createElement("article");
    card.className = "post-card";

    const title = document.createElement("h3");
    title.className = "post-card__title";
    title.textContent = post.title;

    const body = document.createElement("p");
    body.className = "post-card__body";
    body.textContent = post.body;

    card.appendChild(title);
    card.appendChild(body);

    return card;
  }

  loadUsersBtn.addEventListener("click", loadUsers);
  searchInput.addEventListener("input", handleSearch);

  statusMessage.addEventListener("click", function (event) {
    if (event.target.id === "retryUsersBtn") {
      loadUsers();
    }
  });
})();