Refactor the current codebase to rebrand and replace all business information from "Salón RoyMa" to "Salón Jardín LÍA Pachuca". Maintain the current architecture, styling, and GSAP animation logic, updating the visual assets, texts, contact details, reviews, and WhatsApp integrations across the files.

### New Business Information:
- **Business Name:** Salón Jardín LÍA Pachuca
- **Category:** Sala de banquetes / Salón y Jardín para eventos
- **Location / Address:** Calle 14 de febrero, C. 24 de Febrero 601, San Antonio el Desmonte, 42083 Pachuca de Soto, Hgo.
- **Google Plus Code:** 3635+QJ Pachuca de Soto, Hidalgo (Update Google Maps redirect button)
- **Direct Phone / WhatsApp:** +52 771 220 2862 (Replace all WhatsApp redirect links to use 527712202862)
- **Schedule / Attention Hours:** Abierto para visitas y coordinación · Cierre 6:00 PM
- **Rating:** 4.5 / 5 stars based on 75 Google Reviews

### Key Venue Highlights (Update in VenueFeatures & Hero):
1. **Jardín Encantador y Salón Elegante:** Espacio cuidado, limpio y con áreas verdes ideales para banquetes y sesiones fotográficas.
2. **Capacidad Óptima:** Salón íntimo y elegante, diseñado para celebraciones de poco más de 100 invitados.
3. **Coordinación Profesional:** Organización detallada de principio a fin, con atención dedicada de anfitriones y coordinadores (atención personalizada para resolver cada detalle del evento).
4. **Servicio de Banquete y Meseros:** Personal sumamente atento, servicial y comida con excelente calidad garantizada.

### Target Files & Modifications:

1. **`index.html`:**
   - Update `<title>` to: `Salón Jardín LÍA Pachuca | Sala de Banquetes y Eventos`.
   - Update meta description focusing on banquets and garden events in San Antonio el Desmonte, Pachuca.

2. **`src/components/Navbar.tsx` & `src/components/Footer.tsx`:**
   - Update logo/branding text to "Salón Jardín LÍA".
   - Update address, telephone, and social/WhatsApp link (`https://wa.me/527712202862`).

3. **`src/components/HeroSection.tsx`:**
   - Heading: "Salón Jardín LÍA"
   - Tagline: "Instalaciones elegantes, jardín encantador y coordinación profesional para hacer de tu evento una fecha inolvidable en Pachuca."
   - CTAs: "Cotizar Evento" & "Conocer Instalaciones".

4. **`src/components/VenueFeatures.tsx` / `Services.tsx`:**
   - Replace old lounge services with garden/banquet venue perks: "Jardín & Salón Elegante", "Capacidad +100 Personas", "Organización y Coordinación", "Servicio de Meseros y Banquete".

5. **`src/components/Testimonials.tsx`:**
   - Update rating counter to 4.5 stars (75 opiniones).
   - Add these real Google reviews:
     * **Martha Villegas (5 estrellas):** "Me encantó el lugar, es para poco más de 100 personas. El salón es muy elegante y el personal sumamente atento. Fui como invitada y sin duda lo contrataría."
     * **Adriana Angeles Ortega (5 estrellas):** "Hicieron de la fiesta de Sofi una noche mágica e inolvidable. Mario Alberto siempre estuvo atento ayudándonos en cada detalle y con gran disposición. Un recuerdo precioso."
     * **Daniela Ramirez (5 estrellas):** "Las instalaciones y el servicio del anfitrión fueron excelentes. Todo salió muy bien con nuestro evento."
     * **Invitado de Evento (5 estrellas):** "Excelente organización, los meseros muy amables, la comida estuvo muy buena y tienen excelente calidad en todo lo que prometen."

6. **`src/components/BusinessInfo.tsx`:**
   - Update card text: Address in San Antonio el Desmonte, Phone (771 220 2862), Plus Code link (3635+QJ), and opening hours notice (Cierra a las 6:00 PM)[cite: 1].

7. **`src/components/QuotationForm.tsx`:**
   - Keep form fields (Nombre, Teléfono, Tipo de Evento, Fecha, Invitados, Notas).
   - In the submission logic, update the WhatsApp notification target number to `527712202862`[cite: 1] and prefill text: *"¡Hola! Solicité una cotización en la web para Salón Jardín LÍA Pachuca para un evento de [Tipo] el día [Fecha]..."*