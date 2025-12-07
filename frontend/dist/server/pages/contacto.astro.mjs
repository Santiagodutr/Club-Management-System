import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../chunks/astro/server_-MRgVDm6.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout, a as $$Navbar } from '../chunks/BaseLayout_CNFYT2Sv.mjs';
import { h as heroBackground } from '../chunks/fondoclub_BcBvP4tp.mjs';
/* empty css                                    */
export { renderers } from '../renderers.mjs';

const telefonoIcon = new Proxy({"src":"/_astro/telefono.RkvKHMew.png","width":512,"height":512,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/assets/telefono.png";
							}
							
							return target[name];
						}
					});

const emailIcon = new Proxy({"src":"/_astro/email.DtsyJ8Jl.png","width":512,"height":512,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/assets/email.png";
							}
							
							return target[name];
						}
					});

const ubicacionIcon = new Proxy({"src":"/_astro/ubicacion.C_Qgd54Z.png","width":512,"height":512,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/assets/ubicacion.png";
							}
							
							return target[name];
						}
					});

const horarioIcon = new Proxy({"src":"/_astro/horario.CkcXOaPZ.png","width":512,"height":512,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/assets/horario.png";
							}
							
							return target[name];
						}
					});

const $$Contacto = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Contacto - Club del Meta", "hideNavbar": true, "fullWidth": true, "data-astro-cid-2mxdoeuz": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="contact-hero" data-astro-cid-2mxdoeuz> <div class="contact-hero__background"${addAttribute(`background-image: linear-gradient(rgba(4, 14, 32, 0.6), rgba(4, 14, 32, 0.8)), url(${heroBackground.src});`, "style")} data-astro-cid-2mxdoeuz></div> <div class="navbar-wrapper" data-astro-cid-2mxdoeuz> ${renderComponent($$result2, "Navbar", $$Navbar, { "data-astro-cid-2mxdoeuz": true })} </div> <div class="contact-hero__content" data-astro-cid-2mxdoeuz> <h1 data-astro-cid-2mxdoeuz>Contáctanos</h1> <p data-astro-cid-2mxdoeuz>
¿Necesitas más información sobre nuestros salones o quieres reservar un espacio para tu evento? 
        Nuestro equipo está listo para asesorarte y hacer de tu celebración una experiencia inolvidable.
</p> </div> </section> <section class="contact-content" data-astro-cid-2mxdoeuz> <div class="contact-container" data-astro-cid-2mxdoeuz> <div class="map-section" data-astro-cid-2mxdoeuz> <h2 data-astro-cid-2mxdoeuz>Nuestra Ubicación</h2> <div class="map-container" data-astro-cid-2mxdoeuz> <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1989.645188052661!2d-73.63941951079238!3d4.163210806773625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3e2d9252257e01%3A0x13a9394f0ef8b23d!2sClub%20Meta!5e0!3m2!1ses!2sco!4v1762378314013!5m2!1ses!2sco" width="100%" height="500" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" data-astro-cid-2mxdoeuz></iframe> </div> </div> <div class="contact-info-section" data-astro-cid-2mxdoeuz> <h2 data-astro-cid-2mxdoeuz>Información de Contacto</h2> <div class="info-grid" data-astro-cid-2mxdoeuz> <div class="info-card" data-astro-cid-2mxdoeuz> <div class="info-icon" data-astro-cid-2mxdoeuz> <img${addAttribute(telefonoIcon.src, "src")} alt="Teléfono" data-astro-cid-2mxdoeuz> </div> <h3 data-astro-cid-2mxdoeuz>Teléfonos</h3> <p data-astro-cid-2mxdoeuz>(8) 6 64 11 15 - 312 4347893</p> <p data-astro-cid-2mxdoeuz>EVENTOS: 310 8874473 - 312 4350412</p> <p data-astro-cid-2mxdoeuz>COMPRAS: 310 8771304</p> <p data-astro-cid-2mxdoeuz>CARTERA: 313 2349780</p> <p data-astro-cid-2mxdoeuz>OPERACIONES: 313 4660698</p> </div> <div class="info-card" data-astro-cid-2mxdoeuz> <div class="info-icon" data-astro-cid-2mxdoeuz> <img${addAttribute(emailIcon.src, "src")} alt="Email" data-astro-cid-2mxdoeuz> </div> <h3 data-astro-cid-2mxdoeuz>Email</h3> <p data-astro-cid-2mxdoeuz><a href="mailto:comunicaciones@clubelmeta.com" data-astro-cid-2mxdoeuz>comunicaciones@clubelmeta.com</a></p> <p data-astro-cid-2mxdoeuz><a href="mailto:secretaria@clubelmeta.com" data-astro-cid-2mxdoeuz>secretaria@clubelmeta.com</a></p> </div> <div class="info-card" data-astro-cid-2mxdoeuz> <div class="info-icon" data-astro-cid-2mxdoeuz> <img${addAttribute(ubicacionIcon.src, "src")} alt="Ubicación" data-astro-cid-2mxdoeuz> </div> <h3 data-astro-cid-2mxdoeuz>Dirección</h3> <p data-astro-cid-2mxdoeuz>Calle 48A Carrera 30</p> <p data-astro-cid-2mxdoeuz>Barrio Ciudad Oriental</p> <p data-astro-cid-2mxdoeuz>Villavicencio - Meta</p> </div> <div class="info-card" data-astro-cid-2mxdoeuz> <div class="info-icon" data-astro-cid-2mxdoeuz> <img${addAttribute(horarioIcon.src, "src")} alt="Horario" data-astro-cid-2mxdoeuz> </div> <h3 data-astro-cid-2mxdoeuz>Horario de Atención</h3> <p data-astro-cid-2mxdoeuz>Lunes a Viernes: 8:00 AM - 6:00 PM</p> <p data-astro-cid-2mxdoeuz>Sábados: 9:00 AM - 2:00 PM</p> </div> </div> </div> </div> </section>  <a href="https://wa.me/573123439172" target="_blank" rel="noopener noreferrer" class="whatsapp-float" aria-label="Contactar por WhatsApp" data-astro-cid-2mxdoeuz> <svg viewBox="0 0 32 32" fill="currentColor" data-astro-cid-2mxdoeuz> <path d="M16 0C7.163 0 0 7.163 0 16c0 2.825.742 5.49 2.038 7.813L.054 31.19l7.649-1.925A15.94 15.94 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.219 22.706c-.35.987-2.056 1.831-2.844 1.95-.75.1-1.725.138-2.788-.175-.644-.188-1.469-.438-2.525-.856-4.419-1.756-7.3-6.225-7.519-6.512-.213-.281-1.75-2.325-1.75-4.437 0-2.113 1.106-3.15 1.5-3.581.394-.431.863-.538 1.15-.538.288 0 .575.006.825.013.269.013.631-.1.988.756.363.869 1.238 3.019 1.344 3.238.106.219.181.475.038.756-.144.288-.213.469-.425.719-.213.25-.444.556-.638.75-.213.212-.431.438-.181.863.25.419 1.113 1.831 2.388 2.969 1.637 1.462 3.019 1.919 3.45 2.138.431.219.681.181.931-.106.25-.288 1.075-1.256 1.363-1.688.288-.431.575-.363.969-.219.394.144 2.5 1.181 2.931 1.394.431.213.719.313.825.488.106.175.106 1.006-.244 1.994z" data-astro-cid-2mxdoeuz></path> </svg> </a>  ` })}`;
}, "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/contacto.astro", void 0);

const $$file = "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/contacto.astro";
const $$url = "/contacto";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Contacto,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
