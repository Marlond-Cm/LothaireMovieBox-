
/* =========================================
   LothaireMovieBox
   Application de catalogue de films
========================================= */


/* =========================================
   CONFIGURATION TMDB
========================================= */

// -----------------------------------------
// IMPORTANT
// -----------------------------------------
// Nous allons mettre ton token TMDB ici
// lorsque tu l'auras.
//
// Pour l'instant, laisse cette valeur vide.
//
// Exemple :
// const TMDB_TOKEN = "ton_token_ici";
// -----------------------------------------

const TMDB_TOKEN = "";


const API_BASE_URL = "https://api.themoviedb.org/3";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";


/* =========================================
   GENRES TMDB
========================================= */

const GENRES = {

    28: "Action",

    12: "Aventure",

    16: "Animation",

    35: "Comédie",

    80: "Crime",

    99: "Documentaire",

    18: "Drame",

    10751: "Familial",

    14: "Fantastique",

    36: "Histoire",

    27: "Horreur",

    10402: "Musique",

    9648: "Mystère",

    10749: "Romance",

    878: "Science-Fiction",

    10770: "Téléfilm",

    53: "Thriller",

    10752: "Guerre",

    37: "Western"

};


/* =========================================
   ÉTAT DE L'APPLICATION
========================================= */

let currentMovies = [];

let currentPage = 1;

let totalPages = 1;

let currentMode = "popular";

let currentSearch = "";

let selectedMovie = null;


/* =========================================
   RÉCUPÉRATION DES ÉLÉMENTS HTML
========================================= */

const moviesContainer =
    document.getElementById("movies-container");


const favoritesContainer =
    document.getElementById("favorites-container");


const favoritesCount =
    document.getElementById("favorites-count");


const favoritesTotal =
    document.getElementById("favorites-total");


const emptyFavorites =
    document.getElementById("empty-favorites");


const loader =
    document.getElementById("loader");


const errorMessage =
    document.getElementById("error-message");


const errorText =
    document.getElementById("error-text");


const noResults =
    document.getElementById("no-results");


const sectionTitle =
    document.getElementById("section-title");


const searchForm =
    document.getElementById("search-form");


const searchInput =
    document.getElementById("search-input");


const clearSearch =
    document.getElementById("clear-search");


const retryButton =
    document.getElementById("retry-button");


const previousPage =
    document.getElementById("previous-page");


const nextPage =
    document.getElementById("next-page");


const pageInfo =
    document.getElementById("page-info");


const pagination =
    document.getElementById("pagination");


const modal =
    document.getElementById("movie-modal");


const modalOverlay =
    document.getElementById("modal-overlay");


const modalClose =
    document.getElementById("modal-close");


const modalTitle =
    document.getElementById("modal-title");


const modalPosterImage =
    document.getElementById("modal-poster-image");


const modalBackdropImage =
    document.getElementById("modal-backdrop-image");


const modalDate =
    document.getElementById("modal-date");


const modalRating =
    document.getElementById("modal-rating");


const modalOverview =
    document.getElementById("modal-overview");


const modalGenres =
    document.getElementById("modal-genres");


const modalFavoriteButton =
    document.getElementById("modal-favorite-button");


const menuToggle =
    document.getElementById("menu-toggle");


const navMenu =
    document.getElementById("nav-menu");


const backToTop =
    document.getElementById("back-to-top");


/* =========================================
   INITIALISATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    afficherFavoris();

    mettreAJourCompteurFavoris();

    // Pour l'instant, affichage de démonstration.
    afficherMessageConfiguration();

});


/* =========================================
   MESSAGE DE CONFIGURATION
========================================= */

function afficherMessageConfiguration() {

    if (TMDB_TOKEN === "") {

        sectionTitle.textContent =
            "LothaireMovieBox est prêt !";

        moviesContainer.innerHTML = `

            <div class="error-message"
                 style="grid-column: 1 / -1;">

                <div class="error-icon">

                    <i class="fa-solid fa-key"></i>

                </div>

                <h3>
                    API TMDB à configurer
                </h3>

                <p>
                    Ton interface est prête.
                    Il reste maintenant à connecter
                    ton token TMDB dans app.js.
                </p>

            </div>

        `;

        return;
    }

    chargerFilmsPopulaires();

}


/* =========================================
   FONCTION PRINCIPALE API
========================================= */

async function appelerAPI(endpoint, params = {}) {

    if (!TMDB_TOKEN) {

        throw new Error(
            "Le token TMDB n'est pas configuré."
        );

    }


    const url =
        new URL(`${API_BASE_URL}${endpoint}`);


    Object.entries(params).forEach(
        ([key, value]) => {

            url.searchParams.append(
                key,
                value
            );

        }
    );


    const response =
        await fetch(url, {

            method: "GET",

            headers: {

                "Authorization":
                    `Bearer ${TMDB_TOKEN}`,

                "Content-Type":
                    "application/json;charset=utf-8"

            }

        });


    if (!response.ok) {

        throw new Error(
            `Erreur HTTP ${response.status}`
        );

    }


    return await response.json();

}


/* =========================================
   CHARGER FILMS POPULAIRES
========================================= */

async function chargerFilmsPopulaires(
    page = 1
) {

    currentMode = "popular";

    currentPage = page;

    currentSearch = "";


    afficherLoader();

    cacherErreur();

    cacherAucunResultat();


    try {

        const data =
            await appelerAPI(
                "/movie/popular",
                {
                    language: "fr-FR",

                    page: page,

                    region: "FR"
                }
            );


        currentMovies =
            data.results || [];


        totalPages =
            data.total_pages || 1;


        sectionTitle.textContent =
            "Films populaires";


        afficherFilms(currentMovies);


        afficherPagination();


    } catch (error) {

        afficherErreur(
            "Impossible de récupérer les films populaires."
        );

        console.error(error);

    }

}


/* =========================================
   RECHERCHE
========================================= */

async function rechercherFilms(
    query,
    page = 1
) {

    if (!query.trim()) {

        chargerFilmsPopulaires();

        return;

    }


    currentMode = "search";

    currentSearch = query.trim();

    currentPage = page;


    afficherLoader();

    cacherErreur();

    cacherAucunResultat();


    try {

        const data =
            await appelerAPI(
                "/search/movie",
                {

                    query: currentSearch,

                    language: "fr-FR",

                    page: page,

                    include_adult: false

                }
            );


        currentMovies =
            data.results || [];


        totalPages =
            data.total_pages || 1;


        sectionTitle.textContent =
            `Résultats pour "${currentSearch}"`;


        if (currentMovies.length === 0) {

            moviesContainer.innerHTML = "";

            cacherLoader();

            afficherAucunResultat();

            cacherPagination();

            return;

        }


        afficherFilms(currentMovies);

        afficherPagination();


        clearSearch.classList.remove(
            "hidden"
        );


    } catch (error) {

        afficherErreur(
            "La recherche n'a pas pu être effectuée."
        );

        console.error(error);

    }

}


/* =========================================
   AFFICHER LES FILMS
========================================= */

function afficherFilms(movies) {

    cacherLoader();

    cacherErreur();

    cacherAucunResultat();


    moviesContainer.innerHTML = "";


    movies.forEach(movie => {

        const card =
            creerCarteFilm(movie);

        moviesContainer.appendChild(card);

    });

}


/* =========================================
   CRÉER UNE CARTE FILM
========================================= */

function creerCarteFilm(movie) {

    const card =
        document.createElement("article");


    card.className =
        "movie-card";


    card.dataset.id =
        movie.id;


    const poster =
        movie.poster_path
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : creerImagePlaceholder();


    const title =
        movie.title ||
        movie.original_title ||
        "Titre inconnu";


    const date =
        formaterDate(movie.release_date);


    const rating =
        Number(movie.vote_average || 0);


    const ratingClass =
        obtenirClasseNote(rating);


    const estFavori =
        verifierFavori(movie.id);


    card.innerHTML = `

        <div class="movie-poster">

            <img
                src="${poster}"
                alt="Affiche de ${echapperHTML(title)}"
                loading="lazy"
            >


            <button
                class="favorite-button
                ${estFavori ? "active" : ""}"
                data-favorite-id="${movie.id}"
                aria-label="Ajouter aux favoris"
            >

                <i class="${
                    estFavori
                        ? "fa-solid"
                        : "fa-regular"
                } fa-heart"></i>

            </button>


            <div class="movie-overlay">

                <span>
                    <i class="fa-solid fa-circle-info"></i>
                    Voir les détails
                </span>

            </div>

        </div>


        <div class="movie-info">

            <h3 class="movie-title">
                ${echapperHTML(title)}
            </h3>


            <div class="movie-meta">

                <span>
                    <i class="fa-regular fa-calendar"></i>
                    ${date}
                </span>


                <span
                    class="rating ${ratingClass}"
                >
                    ⭐ ${rating.toFixed(1)}
                </span>

            </div>

        </div>

    `;


    /* -----------------------------------------
       CLIC SUR LA CARTE
    ----------------------------------------- */

    card.addEventListener(
        "click",
        (event) => {

            if (
                event.target.closest(
                    ".favorite-button"
                )
            ) {

                return;

            }


            ouvrirModal(movie);

        }
    );


    /* -----------------------------------------
       BOUTON FAVORI
    ----------------------------------------- */

    const favoriteButton =
        card.querySelector(
            ".favorite-button"
        );


    favoriteButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            basculerFavori(movie);

        }
    );


    return card;

}


/* =========================================
   NOTE / RATING
========================================= */

function obtenirClasseNote(rating) {

    if (rating > 7) {

        return "rating-good";

    }


    if (rating >= 5) {

        return "rating-medium";

    }


    return "rating-bad";

}


/* =========================================
   FAVORIS
========================================= */

function obtenirFavoris() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "lothaireMovieBox_favoris"
            )
        ) || [];

    } catch (error) {

        console.error(
            "Erreur localStorage :",
            error
        );

        return [];

    }

}


/* =========================================
   SAUVEGARDER FAVORIS
========================================= */

function sauvegarderFavoris(favoris) {

    localStorage.setItem(
        "lothaireMovieBox_favoris",
        JSON.stringify(favoris)
    );

}


/* =========================================
   VÉRIFIER FAVORI
========================================= */

function verifierFavori(movieId) {

    const favoris =
        obtenirFavoris();


    return favoris.some(
        movie =>
            movie.id === movieId
    );

}


/* =========================================
   AJOUT / SUPPRESSION FAVORI
========================================= */

function basculerFavori(movie) {

    let favoris =
        obtenirFavoris();


    const existe =
        favoris.some(
            item =>
                item.id === movie.id
        );


    if (existe) {

        favoris =
            favoris.filter(
                item =>
                    item.id !== movie.id
            );

    } else {

        favoris.push(movie);

    }


    sauvegarderFavoris(favoris);


    mettreAJourCompteurFavoris();

    afficherFavoris();


    // Mettre à jour les cartes visibles

    if (currentMovies.length > 0) {

        afficherFilms(currentMovies);

    }


    // Mettre à jour le bouton de la modale

    if (
        selectedMovie &&
        selectedMovie.id === movie.id
    ) {

        mettreAJourBoutonModal();

    }

}


/* =========================================
   AFFICHER FAVORIS
========================================= */

function afficherFavoris() {

    const favoris =
        obtenirFavoris();


    favoritesContainer.innerHTML = "";


    if (favoris.length === 0) {

        emptyFavorites.classList.remove(
            "hidden"
        );

        favoritesContainer.classList.add(
            "hidden"
        );

        favoritesTotal.textContent =
            "0 film";

        return;

    }


    emptyFavorites.classList.add(
        "hidden"
    );


    favoritesContainer.classList.remove(
        "hidden"
    );


    favoritesTotal.textContent =
        favoris.length === 1
            ? "1 film"
            : `${favoris.length} films`;


    favoris.forEach(movie => {

        const card =
            creerCarteFilm(movie);

        favoritesContainer.appendChild(card);

    });

}


/* =========================================
   COMPTEUR FAVORIS
========================================= */

function mettreAJourCompteurFavoris() {

    const favoris =
        obtenirFavoris();


    favoritesCount.textContent =
        favoris.length;

}


/* =========================================
   MODALE
========================================= */

function ouvrirModal(movie) {

    selectedMovie = movie;


    const title =
        movie.title ||
        movie.original_title ||
        "Titre inconnu";


    const poster =
        movie.poster_path
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : creerImagePlaceholder();


    const backdrop =
        movie.backdrop_path
            ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
            : poster;


    const rating =
        Number(movie.vote_average || 0);


    modalTitle.textContent =
        title;


    modalPosterImage.src =
        poster;


    modalPosterImage.alt =
        `Affiche de ${title}`;


    modalBackdropImage.src =
        backdrop;


    modalBackdropImage.alt =
        `Image de fond de ${title}`;


    modalDate.innerHTML = `
        <i class="fa-regular fa-calendar"></i>
        ${formaterDate(movie.release_date)}
    `;


    modalRating.innerHTML = `
        <i class="fa-solid fa-star"></i>
        ${rating.toFixed(1)} / 10
    `;


    modalOverview.textContent =
        movie.overview ||
        "Aucun synopsis disponible pour ce film.";


    afficherGenres(movie);


    mettreAJourBoutonModal();


    modal.classList.remove(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   FERMER MODALE
========================================= */

function fermerModal() {

    modal.classList.add(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

    selectedMovie = null;

}


/* =========================================
   GENRES
========================================= */

function afficherGenres(movie) {

    modalGenres.innerHTML = "";


    if (
        !movie.genre_ids ||
        movie.genre_ids.length === 0
    ) {

        modalGenres.innerHTML = `
            <span class="genre">
                Genre inconnu
            </span>
        `;

        return;

    }


    movie.genre_ids.forEach(
        genreId => {

            const genreName =
                GENRES[genreId];


            if (!genreName) {

                return;

            }


            const genre =
                document.createElement(
                    "span"
                );


            genre.className =
                "genre";


            genre.textContent =
                genreName;


            modalGenres.appendChild(
                genre
            );

        }
    );

}


/* =========================================
   BOUTON FAVORI DE LA MODALE
========================================= */

function mettreAJourBoutonModal() {

    if (!selectedMovie) {

        return;

    }


    const estFavori =
        verifierFavori(
            selectedMovie.id
        );


    if (estFavori) {

        modalFavoriteButton.innerHTML = `
            <i class="fa-solid fa-heart"></i>
            Retirer des favoris
        `;

    } else {

        modalFavoriteButton.innerHTML = `
            <i class="fa-regular fa-heart"></i>
            Ajouter aux favoris
        `;

    }

}


/* =========================================
   LOADER
========================================= */

function afficherLoader() {

    loader.classList.remove(
        "hidden"
    );


    moviesContainer.innerHTML = "";

    pagination.classList.add(
        "hidden"
    );

}


function cacherLoader() {

    loader.classList.add(
        "hidden"
    );

}


/* =========================================
   ERREUR
========================================= */

function afficherErreur(message) {

    cacherLoader();

    moviesContainer.innerHTML = "";

    pagination.classList.add(
        "hidden"
    );


    errorText.textContent =
        message;


    errorMessage.classList.remove(
        "hidden"
    );

}


function cacherErreur() {

    errorMessage.classList.add(
        "hidden"
    );

}


/* =========================================
   AUCUN RÉSULTAT
========================================= */

function afficherAucunResultat() {

    noResults.classList.remove(
        "hidden"
    );

}


function cacherAucunResultat() {

    noResults.classList.add(
        "hidden"
    );

}


/* =========================================
   PAGINATION
========================================= */

function afficherPagination() {

    cacherLoader();


    if (
        totalPages <= 1
    ) {

        pagination.classList.add(
            "hidden"
        );

        return;

    }


    pagination.classList.remove(
        "hidden"
    );


    pageInfo.textContent =
        `Page ${currentPage} / ${Math.min(
            totalPages,
            500
        )}`;


    previousPage.disabled =
        currentPage <= 1;


    nextPage.disabled =
        currentPage >=
        Math.min(totalPages, 500);

}


function cacherPagination() {

    pagination.classList.add(
        "hidden"
    );

}


/* =========================================
   FORMATER DATE
========================================= */

function formaterDate(date) {

    if (!date) {

        return "Date inconnue";

    }


    const dateObject =
        new Date(date);


    if (
        Number.isNaN(
            dateObject.getTime()
        )
    ) {

        return "Date inconnue";

    }


    return dateObject.toLocaleDateString(
        "fr-FR",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }
    );

}


/* =========================================
   IMAGE PLACEHOLDER
========================================= */

function creerImagePlaceholder() {

    return `
        data:image/svg+xml;charset=UTF-8,
        ${encodeURIComponent(`
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="500"
                height="750"
                viewBox="0 0 500 750"
            >

                <rect
                    width="500"
                    height="750"
                    fill="#111827"
                />

                <text
                    x="50%"
                    y="50%"
                    fill="#64748b"
                    text-anchor="middle"
                    font-family="Arial"
                    font-size="28"
                >
                    Pas d'affiche
                </text>

            </svg>
        `)}
    `;

}


/* =========================================
   PROTECTION TEXTE HTML
========================================= */

function echapperHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================
   RECHERCHE
========================================= */

searchForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const query =
            searchInput.value.trim();


        if (!query) {

            chargerFilmsPopulaires();

            return;

        }


        rechercherFilms(query);

    }
);


/* =========================================
   EFFACER RECHERCHE
========================================= */

clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        clearSearch.classList.add(
            "hidden"
        );

        chargerFilmsPopulaires();

        window.scrollTo({

            top:
                document.getElementById(
                    "films"
                ).offsetTop - 80,

            behavior: "smooth"

        });

    }
);


/* =========================================
   PAGINATION PRÉCÉDENTE
========================================= */

previousPage.addEventListener(
    "click",
    () => {

        if (
            currentPage <= 1
        ) {

            return;

        }


        const nouvellePage =
            currentPage - 1;


        if (
            currentMode === "search"
        ) {

            rechercherFilms(
                currentSearch,
                nouvellePage
            );

        } else {

            chargerFilmsPopulaires(
                nouvellePage
            );

        }


        window.scrollTo({

            top:
                document.getElementById(
                    "films"
                ).offsetTop - 80,

            behavior: "smooth"

        });

    }
);


/* =========================================
   PAGINATION SUIVANTE
========================================= */

nextPage.addEventListener(
    "click",
    () => {

        const maxPages =
            Math.min(
                totalPages,
                500
            );


        if (
            currentPage >= maxPages
        ) {

            return;

        }


        const nouvellePage =
            currentPage + 1;


        if (
            currentMode === "search"
        ) {

            rechercherFilms(
                currentSearch,
                nouvellePage
            );

        } else {

            chargerFilmsPopulaires(
                nouvellePage
            );

        }


        window.scrollTo({

            top:
                document.getElementById(
                    "films"
                ).offsetTop - 80,

            behavior: "smooth"

        });

    }
);


/* =========================================
   RETRY
========================================= */

retryButton.addEventListener(
    "click",
    () => {

        if (
            currentMode === "search" &&
            currentSearch
        ) {

            rechercherFilms(
                currentSearch,
                currentPage
            );

        } else {

            chargerFilmsPopulaires(
                currentPage
            );

        }

    }
);


/* =========================================
   MODALE - FERMETURE
========================================= */

modalClose.addEventListener(
    "click",
    fermerModal
);


modalOverlay.addEventListener(
    "click",
    fermerModal
);


/* =========================================
   FAVORI DANS MODALE
========================================= */

modalFavoriteButton.addEventListener(
    "click",
    () => {

        if (!selectedMovie) {

            return;

        }


        basculerFavori(
            selectedMovie
        );

    }
);


/* =========================================
   ESCAPE POUR FERMER
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !modal.classList.contains(
                "hidden"
            )
        ) {

            fermerModal();

        }

    }
);


/* =========================================
   MENU MOBILE
========================================= */

menuToggle.addEventListener(
    "click",
    () => {

        navMenu.classList.toggle(
            "open"
        );


        const icon =
            menuToggle.querySelector(
                "i"
            );


        if (
            navMenu.classList.contains(
                "open"
            )
        ) {

            icon.className =
                "fa-solid fa-xmark";

        } else {

            icon.className =
                "fa-solid fa-bars";

        }

    }
);


/* =========================================
   FERMER MENU APRÈS CLIC
========================================= */

document
    .querySelectorAll(".nav-link")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                navMenu.classList.remove(
                    "open"
                );


                const icon =
                    menuToggle.querySelector(
                        "i"
                    );


                icon.className =
                    "fa-solid fa-bars";

            }
        );

    });


/* =========================================
   NAVIGATION ACTIVE
========================================= */

const sections =
    document.querySelectorAll(
        "main section"
    );


const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


window.addEventListener(
    "scroll",
    () => {

        let currentSection = "";


        sections.forEach(
            section => {

                const sectionTop =
                    section.offsetTop - 120;


                if (
                    window.scrollY >=
                    sectionTop
                ) {

                    currentSection =
                        section.getAttribute(
                            "id"
                        );

                }

            }
        );


        navLinks.forEach(
            link => {

                link.classList.remove(
                    "active"
                );


                if (
                    link.getAttribute(
                        "href"
                    ) ===
                    `#${currentSection}`
                ) {

                    link.classList.add(
                        "active"
                    );

                }

            }
        );

    }
);


/* =========================================
   RETOUR EN HAUT
========================================= */

window.addEventListener(
    "scroll",
    () => {

        if (
            window.scrollY > 500
        ) {

            backToTop.classList.add(
                "show"
            );

        } else {

            backToTop.classList.remove(
                "show"
            );

        }

    }
);


backToTop.addEventListener(
    "click",
    () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }
);


/* =========================================
   FIN
========================================= */
