import { initializeNavigation } from "./components/navigation.js";
import { initializeDialogs } from "./components/dialogs.js";
import { initializeConsent } from "./components/consent.js";
import { routes } from "./routing/routes.js";

const skipLink = document.querySelector(".skip-link");
const mainContent = document.getElementById("main-content");
const currentRouteKey = document.body.dataset.page;
if (currentRouteKey && !routes[currentRouteKey]) console.error(`Unknown RTBO route key: ${currentRouteKey}`);
if (skipLink && mainContent) skipLink.addEventListener("click", () => mainContent.focus());

initializeNavigation();
initializeDialogs();
initializeConsent();
