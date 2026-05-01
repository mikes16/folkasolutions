import type { LegalContent } from "./types";

// Placeholder Aviso de Privacidad / Privacy Notice. Drafted to satisfy
// LFPDPPP (México) requirements for a published privacy notice and to be
// defensible under GDPR / CCPA principles for cross-border traffic. This
// is NOT a substitute for a lawyer-reviewed document; replace with the
// real one once legal review is complete.

export const privacyContent: LegalContent = {
  es: {
    updated: "30 de abril de 2026",
    intro:
      "Folka Coffee Solutions (\"Folka\") respeta tu privacidad. Este aviso explica qué datos recolectamos cuando visitas folkasolutions.com o nos compras, para qué los usamos, con quién los compartimos, y cómo puedes ejercer tus derechos. Para cualquier petición sobre tus datos, escríbenos a hola@folkasolutions.com.",
    sections: [
      {
        heading: "Responsable del tratamiento",
        paragraphs: [
          "Folka Coffee Solutions opera el sitio folkasolutions.com y es la responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).",
          "Para cualquier comunicación relacionada con privacidad: hola@folkasolutions.com.",
        ],
      },
      {
        heading: "Qué datos recolectamos",
        paragraphs: [
          "Datos que tú nos proporcionas: nombre, correo electrónico, teléfono, dirección de envío y de facturación cuando haces una compra; el contenido de tu mensaje cuando nos contactas por formulario, correo o WhatsApp; tu correo si te suscribes al newsletter.",
          "Datos de tu navegación: páginas visitadas, productos vistos, búsquedas realizadas, dispositivo y navegador, idioma, ubicación aproximada (a nivel ciudad), referente, y un identificador anónimo que vincula tus visitas. Estos datos los recolecta PostHog, nuestra herramienta de análisis. No grabamos sesiones (lo que tipeas, dónde haces clic en detalle) ni usamos heatmaps.",
          "Datos de transacción: el procesamiento de pagos lo realiza Shopify Payments y los proveedores aprobados (tarjetas, Apple Pay, Google Pay, Shop Pay). Folka no almacena números de tarjeta ni credenciales completas de pago. Recibimos confirmación, monto, divisa, y los productos comprados.",
          "Cookies: usamos cookies propias y de terceros para mantener tu sesión, recordar tu carrito, y medir cómo se usa el sitio. Puedes configurar tu navegador para rechazarlas, pero algunas funciones (como el carrito de compra) requieren cookies para funcionar.",
        ],
      },
      {
        heading: "Para qué usamos tus datos (finalidades primarias)",
        paragraphs: [
          "Procesar y enviar tu pedido, incluyendo comunicación con paquetería.",
          "Comunicarnos contigo sobre tu pedido, garantía o consulta.",
          "Cumplir obligaciones fiscales (factura electrónica, devoluciones, comprobantes).",
          "Operar y proteger el sitio (prevención de fraude, mantenimiento técnico, atención al cliente).",
        ],
      },
      {
        heading: "Finalidades secundarias (puedes oponerte)",
        paragraphs: [
          "Enviarte campañas de correo o WhatsApp con novedades, recomendaciones de producto o promociones.",
          "Analizar datos agregados de uso para mejorar el catálogo, la navegación, y la experiencia de compra.",
          "Si no deseas que tus datos se usen para estas finalidades secundarias, escríbenos a hola@folkasolutions.com indicándolo expresamente. Esto no afectará el procesamiento de tus pedidos.",
        ],
      },
      {
        heading: "Con quién compartimos tus datos",
        paragraphs: [
          "Shopify Inc.: aloja la tienda, procesa pagos, gestiona inventario y datos de cliente. Política de privacidad: shopify.com/legal/privacy.",
          "PostHog Inc.: análisis de uso del sitio. Política: posthog.com/privacy.",
          "Cloudinary Ltd.: entrega de imágenes y video del catálogo. Política: cloudinary.com/privacy.",
          "Empresas de paquetería: reciben tu nombre y dirección de envío únicamente para entregar el pedido.",
          "Autoridades fiscales o judiciales: cuando la ley mexicana lo exija.",
          "No vendemos tus datos personales a terceros bajo ninguna circunstancia.",
        ],
      },
      {
        heading: "Transferencias internacionales",
        paragraphs: [
          "Los proveedores listados arriba operan principalmente en Estados Unidos, Canadá e Irlanda. Al usar el sitio aceptas la transferencia de tus datos a esas jurisdicciones, las cuales pueden no ofrecer el mismo nivel de protección que la legislación mexicana. Aplicamos cláusulas contractuales de protección de datos con cada proveedor.",
        ],
      },
      {
        heading: "Por cuánto tiempo guardamos los datos",
        paragraphs: [
          "Datos de pedido y facturación: por el tiempo que exige la legislación fiscal mexicana (cinco años) más cualquier periodo de garantía aplicable.",
          "Datos de navegación analítica: máximo doce meses.",
          "Datos del newsletter: hasta que solicites tu baja.",
        ],
      },
      {
        heading: "Tus derechos ARCO",
        paragraphs: [
          "Como titular de tus datos personales tienes derecho a: acceder a la información que tenemos sobre ti, rectificar datos incorrectos o incompletos, cancelar el tratamiento (siempre que no haya obligación legal en contra), oponerte al tratamiento para finalidades secundarias, y revocar el consentimiento en cualquier momento.",
          "Para ejercer cualquiera de estos derechos, envía un correo a hola@folkasolutions.com adjuntando copia de identificación oficial vigente. Te respondemos en un plazo máximo de veinte días hábiles conforme a la LFPDPPP.",
        ],
      },
      {
        heading: "Seguridad de la información",
        paragraphs: [
          "Conexión HTTPS cifrada en todo el sitio.",
          "Acceso interno restringido a datos sensibles, basado en rol.",
          "Proveedores que cumplen con estándares relevantes como PCI-DSS para procesamiento de pagos.",
          "A pesar de estas medidas, ningún sistema en internet es invulnerable. Te pedimos elegir contraseñas robustas y notificarnos de inmediato si sospechas acceso no autorizado a tu cuenta.",
        ],
      },
      {
        heading: "Menores de edad",
        paragraphs: [
          "El sitio no está dirigido a menores de 18 años. Si crees que un menor nos ha proporcionado datos personales sin autorización de sus padres o tutores, escríbenos para eliminarlos.",
        ],
      },
      {
        heading: "Cambios al aviso",
        paragraphs: [
          "Podemos actualizar este aviso para reflejar cambios en la operación del sitio o en la legislación aplicable. La fecha de \"última actualización\" indica la versión vigente. Si los cambios son sustanciales te avisamos por correo o con un aviso visible en el sitio.",
        ],
      },
      {
        heading: "Contacto",
        paragraphs: [
          "Para cualquier petición, duda o queja sobre privacidad: hola@folkasolutions.com.",
        ],
      },
    ],
  },
  en: {
    updated: "April 30, 2026",
    intro:
      "Folka Coffee Solutions (\"Folka\") respects your privacy. This notice explains what data we collect when you visit folkasolutions.com or buy from us, what we use it for, who we share it with, and how you can exercise your rights. For any data request, contact us at hola@folkasolutions.com.",
    sections: [
      {
        heading: "Who controls your data",
        paragraphs: [
          "Folka Coffee Solutions operates folkasolutions.com and is the controller of your personal data under Mexican data protection law (LFPDPPP), and acts in accordance with the GDPR and CCPA principles for traffic from those jurisdictions.",
          "For any privacy-related request: hola@folkasolutions.com.",
        ],
      },
      {
        heading: "What data we collect",
        paragraphs: [
          "Data you provide: name, email, phone number, shipping and billing address when you place an order; the content of your message when you contact us by form, email or WhatsApp; your email if you subscribe to the newsletter.",
          "Browsing data: pages visited, products viewed, searches performed, device and browser, language, approximate location (city level), referrer, and an anonymous identifier that links your visits. This is collected by PostHog, our analytics tool. We do not record sessions (what you type, where you click in detail) and we do not use heatmaps.",
          "Transaction data: payment processing is handled by Shopify Payments and approved providers (cards, Apple Pay, Google Pay, Shop Pay). Folka does not store full card numbers or full payment credentials. We receive confirmation, amount, currency, and the items purchased.",
          "Cookies: we use first-party and third-party cookies to keep your session, remember your cart, and measure how the site is used. You can configure your browser to reject them, but some features (such as the cart) require cookies to work.",
        ],
      },
      {
        heading: "What we use your data for",
        paragraphs: [
          "Processing and shipping your order, including communication with carriers.",
          "Communicating with you about your order, warranty, or inquiry.",
          "Meeting tax and accounting obligations (invoices, returns, receipts).",
          "Operating and protecting the site (fraud prevention, technical maintenance, customer support).",
        ],
      },
      {
        heading: "Marketing uses (you can opt out)",
        paragraphs: [
          "Sending you email or WhatsApp campaigns with news, product recommendations, or promotions.",
          "Analyzing aggregate usage data to improve the catalog, navigation, and shopping experience.",
          "If you do not want your data used for these secondary purposes, write to hola@folkasolutions.com to opt out. This will not affect order processing.",
        ],
      },
      {
        heading: "Who we share your data with",
        paragraphs: [
          "Shopify Inc.: hosts the store, processes payments, manages inventory and customer data. Privacy policy: shopify.com/legal/privacy.",
          "PostHog Inc.: site usage analytics. Policy: posthog.com/privacy.",
          "Cloudinary Ltd.: image and video delivery for the catalog. Policy: cloudinary.com/privacy.",
          "Shipping carriers: receive your name and shipping address solely to deliver your order.",
          "Tax or judicial authorities: when required by Mexican law.",
          "We do not sell your personal data to third parties under any circumstances.",
        ],
      },
      {
        heading: "International transfers",
        paragraphs: [
          "The providers listed above operate primarily in the United States, Canada, and Ireland. By using the site you accept the transfer of your data to those jurisdictions, which may not offer the same level of protection as Mexican law. We apply contractual data protection clauses with each provider.",
        ],
      },
      {
        heading: "How long we keep data",
        paragraphs: [
          "Order and invoicing data: for the period required by Mexican tax law (five years) plus any applicable warranty period.",
          "Analytics browsing data: up to twelve months.",
          "Newsletter data: until you unsubscribe.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You have the right to: access the data we hold on you, correct inaccurate or incomplete data, request deletion (when not blocked by a legal obligation), object to use for secondary purposes, withdraw consent at any time, and request portability of your data in a common machine-readable format.",
          "To exercise any of these rights, email hola@folkasolutions.com with a copy of valid government-issued ID. We respond within twenty business days, in line with LFPDPPP.",
        ],
      },
      {
        heading: "Information security",
        paragraphs: [
          "HTTPS encryption across the entire site.",
          "Internal access to sensitive data is restricted by role.",
          "Providers that meet relevant standards (PCI-DSS for payment processing).",
          "Despite these measures, no system on the internet is invulnerable. Use a strong password and notify us immediately if you suspect unauthorized access to your account.",
        ],
      },
      {
        heading: "Children",
        paragraphs: [
          "The site is not directed at people under 18. If you believe a minor has provided personal data without parental consent, write to us to have it removed.",
        ],
      },
      {
        heading: "Changes to this notice",
        paragraphs: [
          "We may update this notice to reflect changes in how the site operates or in applicable law. The \"last updated\" date indicates the current version. If changes are substantial we will notify you by email or with a visible notice on the site.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "For any privacy request, question, or complaint: hola@folkasolutions.com.",
        ],
      },
    ],
  },
};
