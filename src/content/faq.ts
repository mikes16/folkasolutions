export interface FaqItem {
  question: string;
  answer: string[];
}

export interface FaqCategory {
  title: string;
  items: FaqItem[];
}

export type FaqContent = Record<"es" | "en", FaqCategory[]>;

export const faqContent: FaqContent = {
  es: [
    {
      title: "Compras y pagos",
      items: [
        {
          question: "¿Necesito crear una cuenta para comprar?",
          answer: [
            "No. Puedes comprar como invitado. Si creas una cuenta podrás ver tu historial de pedidos y agilizar futuras compras.",
          ],
        },
        {
          question: "¿Qué métodos de pago aceptan?",
          answer: [
            "Aceptamos Visa, Mastercard, American Express, Discover, Diners Club, Apple Pay, Google Pay y Shop Pay. Todas las transacciones se procesan de forma segura a través de Shop Pay — Folka no almacena información de tarjetas.",
            "Para pedidos grandes o comerciales también aceptamos transferencia y depósito bancario. Escríbenos a hola@folkasolutions.com para coordinarlo.",
          ],
        },
        {
          question: "¿Puedo solicitar factura?",
          answer: [
            "Sí. Debes solicitarla al momento de la compra o dentro del mismo mes fiscal, enviando un correo a hola@folkasolutions.com con tus datos fiscales completos: nombre/razón social, RFC, domicilio fiscal, uso del CFDI, forma de pago y Constancia de Situación Fiscal actualizada.",
            "Para clientes en el extranjero emitimos factura en moneda nacional conforme al régimen fiscal mexicano.",
          ],
        },
      ],
    },
    {
      title: "Envíos y tiempos de entrega",
      items: [
        {
          question: "¿Cuánto tarda en llegar mi pedido?",
          answer: [
            "Los tiempos varían entre 30 días naturales y 8 meses, dependiendo del producto y su disponibilidad. Productos en existencia se envían en días; máquinas comerciales o en backorder pueden tardar varios meses.",
            "El tiempo se cuenta a partir de la confirmación del pago. Te notificamos cada etapa del pedido por correo o WhatsApp.",
          ],
        },
        {
          question: "¿Envían a Estados Unidos y Latinoamérica?",
          answer: [
            "Sí. Enviamos a México, Estados Unidos y países de Latinoamérica. El usuario es responsable de verificar si el producto puede importarse legalmente y cubrir impuestos o trámites aduanales aplicables.",
          ],
        },
        {
          question: "¿Qué hago si mi paquete llega dañado?",
          answer: [
            "Si la caja presenta señales de maltrato, anótalo en el manifiesto del repartidor antes de firmar. Si no te lo permiten, NO recibas el paquete.",
            "Tienes 24 horas después de recibir el envío para reportar daños o faltantes. Escríbenos a hola@folkasolutions.com con fotos claras del problema.",
          ],
        },
      ],
    },
    {
      title: "Garantía y servicio técnico",
      items: [
        {
          question: "¿Las máquinas traen garantía?",
          answer: [
            "Sí. Como importadores oficiales, cada equipo que vendemos cuenta con garantía de fábrica respaldada directamente por el fabricante. Nosotros gestionamos el proceso de garantía por ti.",
            "La garantía se revoca automáticamente si se detecta mal uso, falta de mantenimiento, instalación incorrecta, uso con agua no filtrada o condiciones eléctricas inadecuadas.",
          ],
        },
        {
          question: "¿Ofrecen servicio técnico?",
          answer: [
            "Sí. Coffee Worx Tech, nuestro brazo de servicio, atiende cafés comerciales y home baristas. Damos cobertura nacional en México con soporte remoto para todo el país.",
            "Hacemos mantenimiento preventivo, atención de averías, instalación, rebuilds, filtración de agua y soporte remoto. Puedes solicitar servicio desde nuestra página de Garantía y Servicio.",
          ],
        },
        {
          question: "¿Instalan los equipos comerciales?",
          answer: [
            "Sí. Ofrecemos instalación profesional de máquinas, molinos y sistemas de agua. Nuestro equipo de consultoría también acompaña proyectos de cafés desde el concepto hasta la puesta en marcha.",
          ],
        },
      ],
    },
    {
      title: "Devoluciones",
      items: [
        {
          question: "¿Puedo devolver un producto?",
          answer: [
            "El producto debe estar sin uso, con etiquetas, en su empaque original y con comprobante de compra. Contacta hola@folkasolutions.com para iniciar la solicitud — evaluamos cada caso y, si procede, enviamos instrucciones y dirección de retorno.",
            "No se aceptan devoluciones de productos perecederos, personalizados, de cuidado personal, ni artículos en oferta o tarjetas de regalo.",
          ],
        },
        {
          question: "¿Cómo funcionan los reembolsos?",
          answer: [
            "Los reembolsos autorizados se procesan en 15 a 30 días hábiles y se aplica un cargo del 35% por concepto de restocking, salvo que el error sea imputable a Folka.",
            "Si el pedido ya fue liberado por el proveedor o la bodega, no procede reembolso.",
          ],
        },
      ],
    },
    {
      title: "Proyectos comerciales y consultoría",
      items: [
        {
          question: "¿Ayudan a montar un café desde cero?",
          answer: [
            "Sí. Trabajamos con cafés independientes desde el concepto hasta la instalación: selección de equipo, diseño de barra, capacitación de baristas y soporte postventa. Escríbenos a comercial@folkasolutions.com para agendar una asesoría.",
          ],
        },
        {
          question: "¿Dan entrenamiento de barista?",
          answer: [
            "Sí. Ofrecemos programas de entrenamiento y educación para baristas y operadores de café. Los programas se coordinan directamente con el equipo de Folka.",
          ],
        },
      ],
    },
  ],
  en: [
    {
      title: "Orders & Payments",
      items: [
        {
          question: "Do I need an account to buy?",
          answer: [
            "No. You can check out as a guest. Creating an account lets you view order history and speed up future purchases.",
          ],
        },
        {
          question: "What payment methods do you accept?",
          answer: [
            "We accept Visa, Mastercard, American Express, Discover, Diners Club, Apple Pay, Google Pay, and Shop Pay. All transactions are processed securely via Shop Pay — Folka does not store card information.",
            "For large or commercial orders we also accept wire transfer and bank deposit. Email hola@folkasolutions.com to coordinate.",
          ],
        },
        {
          question: "Can I request an invoice?",
          answer: [
            "Yes. You must request it at the time of purchase or within the same fiscal month, by emailing hola@folkasolutions.com with your tax details.",
            "For international customers we issue an invoice in Mexican pesos under Mexican tax regulations. Please provide full name/business name, country of residence, fiscal address, Tax ID/VAT/EIN, and proof of payment.",
          ],
        },
      ],
    },
    {
      title: "Shipping & Delivery",
      items: [
        {
          question: "How long will my order take?",
          answer: [
            "Delivery ranges from 30 days to 8 months depending on the product and availability. In-stock items ship in days; commercial machines or backorders can take several months.",
            "The clock starts when payment is confirmed. We notify you at every step by email or WhatsApp.",
          ],
        },
        {
          question: "Do you ship to the US and Latin America?",
          answer: [
            "Yes. We ship to Mexico, the United States, and Latin America. It's your responsibility to verify whether the product can be legally imported and to cover any applicable taxes or customs fees.",
          ],
        },
        {
          question: "What if my package arrives damaged?",
          answer: [
            "If the box shows signs of damage, note it on the courier's manifest before signing. If the driver won't allow it, do NOT accept the package.",
            "You have 24 hours after delivery to report damage or missing items. Email hola@folkasolutions.com with clear photos of the issue.",
          ],
        },
      ],
    },
    {
      title: "Warranty & Service",
      items: [
        {
          question: "Do the machines come with warranty?",
          answer: [
            "Yes. As official importers, every piece of equipment ships with factory warranty backed directly by the manufacturer. We handle the warranty process for you.",
            "Warranty is automatically voided in cases of misuse, lack of maintenance, incorrect installation, use with unfiltered water, or inadequate electrical conditions.",
          ],
        },
        {
          question: "Do you offer technical service?",
          answer: [
            "Yes. Coffee Worx Tech — our service arm — supports commercial cafés and home baristas. We provide nationwide coverage in Mexico with remote support across the country.",
            "We handle preventive maintenance, emergency breakdowns, installation, rebuilds, water filtration, and remote diagnostics. Request service from our Warranty & Service page.",
          ],
        },
        {
          question: "Do you install commercial equipment?",
          answer: [
            "Yes. We offer professional installation of machines, grinders, and water systems. Our consulting team also walks café projects from concept to launch.",
          ],
        },
      ],
    },
    {
      title: "Returns",
      items: [
        {
          question: "Can I return a product?",
          answer: [
            "The product must be unused, with tags, in its original packaging, and with proof of purchase. Contact hola@folkasolutions.com to start the request — we evaluate each case and send return instructions if approved.",
            "We don't accept returns on perishable goods, custom products, personal care items, sale items, or gift cards.",
          ],
        },
        {
          question: "How do refunds work?",
          answer: [
            "Approved refunds are processed within 15 to 30 business days and a 35% restocking fee applies, unless the error is on Folka's side.",
            "If the order has already been released by the supplier or warehouse, refunds are not possible.",
          ],
        },
      ],
    },
    {
      title: "Commercial Projects & Consulting",
      items: [
        {
          question: "Do you help open a café from scratch?",
          answer: [
            "Yes. We work with independent cafés from concept to installation: equipment selection, bar design, barista training, and post-sale support. Email comercial@folkasolutions.com to book a consultation.",
          ],
        },
        {
          question: "Do you offer barista training?",
          answer: [
            "Yes. We run training and education programs for baristas and café operators. Programs are coordinated directly with the Folka team.",
          ],
        },
      ],
    },
  ],
};
