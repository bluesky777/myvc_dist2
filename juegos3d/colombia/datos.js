/* Vuelo por Colombia — contenido pedagógico y geografía del mapa.
   Coordenadas en grados [longitud, latitud] (oeste y sur negativos), aproximadas.
   Un docente puede cambiar misiones, datos y preguntas sin tocar el motor.
   En cada pregunta, `correcta` es el índice de la opción buena (el juego las baraja al mostrarlas). */
window.DATOS_COLOMBIA = {
  titulo: 'Vuelo por Colombia',
  frase: 'Conoce las regiones, las capitales y los ríos de Colombia volando sobre el mapa.',
  comoSeJuega: 'Arrastra el dedo (o usa las flechas) para girar y acelerar. Cumple la misión de arriba: llega a la región, aterriza en la ciudad o pasa por los aros del río.',

  regiones: {
    andina:    { nombre: 'Región Andina',    color: '#d29a5a', centro: [-74.6, 5.2] },
    caribe:    { nombre: 'Región Caribe',    color: '#f3cf63', centro: [-74.6, 9.9] },
    pacifica:  { nombre: 'Región Pacífica',  color: '#22a37f', centro: [-77.0, 5.0] },
    orinoquia: { nombre: 'Orinoquía',        color: '#b5d35a', centro: [-70.5, 5.0] },
    amazonia:  { nombre: 'Amazonía',         color: '#2f8a3f', centro: [-71.5, 0.0] },
    insular:   { nombre: 'Región Insular',   color: '#ff7f6b', centro: [-81.7, 12.6] }
  },

  /* Capital de cada departamento: [longitud, latitud]. `region` es la región natural donde queda la ciudad. */
  capitales: [
    { id: 'bogota',        ciudad: 'Bogotá',               depto: 'Colombia (Distrito Capital)', pos: [-74.07, 4.71], region: 'andina', pais: true },
    { id: 'medellin',      ciudad: 'Medellín',             depto: 'Antioquia',          pos: [-75.58, 6.24],  region: 'andina' },
    { id: 'cali',          ciudad: 'Cali',                 depto: 'Valle del Cauca',    pos: [-76.53, 3.45],  region: 'andina' },
    { id: 'barranquilla',  ciudad: 'Barranquilla',         depto: 'Atlántico',          pos: [-74.80, 10.96], region: 'caribe' },
    { id: 'cartagena',     ciudad: 'Cartagena',            depto: 'Bolívar',            pos: [-75.48, 10.39], region: 'caribe' },
    { id: 'santamarta',    ciudad: 'Santa Marta',          depto: 'Magdalena',          pos: [-74.20, 11.24], region: 'caribe' },
    { id: 'riohacha',      ciudad: 'Riohacha',             depto: 'La Guajira',         pos: [-72.91, 11.54], region: 'caribe' },
    { id: 'valledupar',    ciudad: 'Valledupar',           depto: 'Cesar',              pos: [-73.25, 10.46], region: 'caribe' },
    { id: 'monteria',      ciudad: 'Montería',             depto: 'Córdoba',            pos: [-75.88, 8.75],  region: 'caribe' },
    { id: 'sincelejo',     ciudad: 'Sincelejo',            depto: 'Sucre',              pos: [-75.40, 9.30],  region: 'caribe' },
    { id: 'bucaramanga',   ciudad: 'Bucaramanga',          depto: 'Santander',          pos: [-73.12, 7.12],  region: 'andina' },
    { id: 'cucuta',        ciudad: 'Cúcuta',               depto: 'Norte de Santander', pos: [-72.51, 7.89],  region: 'andina' },
    { id: 'tunja',         ciudad: 'Tunja',                depto: 'Boyacá',             pos: [-73.37, 5.54],  region: 'andina' },
    { id: 'manizales',     ciudad: 'Manizales',            depto: 'Caldas',             pos: [-75.51, 5.07],  region: 'andina' },
    { id: 'pereira',       ciudad: 'Pereira',              depto: 'Risaralda',          pos: [-75.70, 4.81],  region: 'andina' },
    { id: 'armenia',       ciudad: 'Armenia',              depto: 'Quindío',            pos: [-75.68, 4.53],  region: 'andina' },
    { id: 'ibague',        ciudad: 'Ibagué',               depto: 'Tolima',             pos: [-75.23, 4.44],  region: 'andina' },
    { id: 'neiva',         ciudad: 'Neiva',                depto: 'Huila',              pos: [-75.28, 2.93],  region: 'andina' },
    { id: 'popayan',       ciudad: 'Popayán',              depto: 'Cauca',              pos: [-76.61, 2.44],  region: 'andina' },
    { id: 'pasto',         ciudad: 'Pasto',                depto: 'Nariño',             pos: [-77.28, 1.21],  region: 'andina' },
    { id: 'quibdo',        ciudad: 'Quibdó',               depto: 'Chocó',              pos: [-76.66, 5.69],  region: 'pacifica' },
    { id: 'villavicencio', ciudad: 'Villavicencio',        depto: 'Meta',               pos: [-73.63, 4.14],  region: 'orinoquia' },
    { id: 'yopal',         ciudad: 'Yopal',                depto: 'Casanare',           pos: [-72.40, 5.34],  region: 'orinoquia' },
    { id: 'arauca',        ciudad: 'Arauca',               depto: 'Arauca',             pos: [-70.76, 7.08],  region: 'orinoquia' },
    { id: 'puertocarreno', ciudad: 'Puerto Carreño',       depto: 'Vichada',            pos: [-67.49, 6.19],  region: 'orinoquia' },
    { id: 'inirida',       ciudad: 'Inírida',              depto: 'Guainía',            pos: [-67.92, 3.87],  region: 'amazonia' },
    { id: 'sanjose',       ciudad: 'San José del Guaviare', depto: 'Guaviare',          pos: [-72.64, 2.57],  region: 'amazonia' },
    { id: 'mitu',          ciudad: 'Mitú',                 depto: 'Vaupés',             pos: [-70.23, 1.25],  region: 'amazonia' },
    { id: 'florencia',     ciudad: 'Florencia',            depto: 'Caquetá',            pos: [-75.61, 1.61],  region: 'amazonia' },
    { id: 'mocoa',         ciudad: 'Mocoa',                depto: 'Putumayo',           pos: [-76.65, 1.15],  region: 'amazonia' },
    { id: 'leticia',       ciudad: 'Leticia',              depto: 'Amazonas',           pos: [-69.94, -4.21], region: 'amazonia' },
    { id: 'sanandres',     ciudad: 'San Andrés',           depto: 'San Andrés y Providencia', pos: [-81.70, 12.58], region: 'insular' }
  ],

  /* Misiones en orden. tipo: 'region' (entrar a la región), 'capital' (aterrizar en la ciudad) o 'rio' (pasar por los aros).
     salida: [longitud, latitud, rumbo en grados (0 = norte, 90 = este)]. tiempo: segundos para no perder la estrella del reloj. */
  misiones: [
    { id: 'm1', tipo: 'region', region: 'caribe', salida: [-74.1, 4.9, 0], tiempo: 70,
      pide: 'Vuela a la región del desierto de La Guajira y la Sierra Nevada de Santa Marta.',
      dato: 'La región Caribe está al norte, junto al mar. Allí nació el vallenato, en Valledupar, y está la Sierra Nevada de Santa Marta, la montaña junto al mar más alta del mundo.',
      pregunta: { texto: '¿Qué música nació en la región Caribe?', opciones: ['El vallenato', 'El joropo', 'El currulao'], correcta: 0 } },

    { id: 'm2', tipo: 'capital', ciudad: 'bogota', salida: [-74.6, 9.0, 180], tiempo: 70,
      pide: 'Aterriza en la capital de Colombia.',
      dato: 'Bogotá es la capital de Colombia. Está en la cordillera Oriental, a unos 2.600 metros sobre el nivel del mar. Por eso hace frío casi todo el año.',
      pregunta: { texto: '¿En qué cordillera está Bogotá?', opciones: ['En la cordillera Oriental', 'En la cordillera Central', 'En la cordillera Occidental'], correcta: 0 } },

    { id: 'm3', tipo: 'region', region: 'pacifica', salida: [-74.1, 4.9, 270], tiempo: 60,
      pide: 'Vuela a la región donde más llueve, entre la selva y el océano Pacífico.',
      dato: 'En la región Pacífica llueve casi todos los días: el Chocó es uno de los lugares más lluviosos del planeta. Entre julio y octubre llegan las ballenas jorobadas a tener sus crías.',
      pregunta: { texto: '¿Qué animales llegan al Pacífico colombiano a tener sus crías?', opciones: ['Las ballenas jorobadas', 'Los osos polares', 'Los camellos'], correcta: 0 } },

    { id: 'm4', tipo: 'capital', ciudad: 'medellin', salida: [-76.9, 5.5, 90], tiempo: 60,
      pide: 'Aterriza en la capital de Antioquia.',
      dato: 'Medellín es la capital de Antioquia. Le dicen «la ciudad de la eterna primavera». En agosto celebra la Feria de las Flores, con el desfile de silleteros.',
      pregunta: { texto: '¿Qué se celebra en Medellín cada agosto?', opciones: ['La Feria de las Flores', 'El Carnaval de Barranquilla', 'El Festival Vallenato'], correcta: 0 } },

    { id: 'm5', tipo: 'rio', rio: 'magdalena', tiempo: 90,
      pide: 'Sigue el río Magdalena hasta el mar. Pasa por los aros.',
      dato: 'El Magdalena es el río más importante de Colombia. Nace en el Macizo Colombiano, en el Huila, y llega al mar Caribe en Bocas de Ceniza, junto a Barranquilla. Recorre más de 1.500 kilómetros.',
      pregunta: { texto: '¿Dónde desemboca el río Magdalena?', opciones: ['En el mar Caribe', 'En el océano Pacífico', 'En el río Amazonas'], correcta: 0 } },

    { id: 'm6', tipo: 'region', region: 'orinoquia', salida: [-75.6, 6.2, 120], tiempo: 70,
      pide: 'Vuela a las llanuras donde se baila joropo y se cría ganado.',
      dato: 'La Orinoquía son los Llanos Orientales: tierras planas y calientes con ríos que van al Orinoco. Allí se canta y se baila el joropo con arpa, cuatro y maracas.',
      pregunta: { texto: '¿Con qué instrumentos se toca el joropo?', opciones: ['Arpa, cuatro y maracas', 'Marimba de chonta y cununo', 'Gaita y tambor alegre'], correcta: 0 } },

    { id: 'm7', tipo: 'capital', ciudad: 'cali', salida: [-73.4, 4.2, 270], tiempo: 70,
      pide: 'Aterriza en la capital del Valle del Cauca.',
      dato: 'Cali es la capital del Valle del Cauca. Es famosa por la salsa: muchos la llaman la capital mundial de la salsa. Está en el valle del río Cauca, entre dos cordilleras.',
      pregunta: { texto: '¿Entre qué cordilleras está el valle del río Cauca?', opciones: ['La Occidental y la Central', 'La Central y la Oriental', 'La Oriental y la Sierra Nevada'], correcta: 0 } },

    { id: 'm8', tipo: 'region', region: 'amazonia', salida: [-76.4, 3.6, 120], tiempo: 70,
      pide: 'Vuela a la selva donde vive el delfín rosado.',
      dato: 'La Amazonía es la región más grande de Colombia: ocupa cerca de un tercio del país. Es una selva húmeda llena de ríos, y en el río Amazonas vive el delfín rosado.',
      pregunta: { texto: '¿Cuál es la región natural más grande de Colombia?', opciones: ['La Amazonía', 'La región Caribe', 'La región Insular'], correcta: 0 } },

    { id: 'm9', tipo: 'capital', ciudad: 'leticia', salida: [-73.0, 0.6, 150], tiempo: 80,
      pide: 'Aterriza en la capital del Amazonas.',
      dato: 'Leticia es la capital del Amazonas y está a orillas del río Amazonas. Es frontera con dos países, Brasil y Perú: allí puedes pasar caminando de Colombia a Brasil.',
      pregunta: { texto: '¿Con qué países tiene frontera Leticia?', opciones: ['Con Brasil y Perú', 'Con Venezuela y Panamá', 'Con Ecuador y Panamá'], correcta: 0 } },

    { id: 'm10', tipo: 'region', region: 'insular', salida: [-75.4, 10.2, 300], tiempo: 70,
      pide: 'Vuela a las islas del mar Caribe donde muchos raizales hablan creole.',
      dato: 'La región Insular son las islas de Colombia. Las más conocidas son San Andrés, Providencia y Santa Catalina, en el mar Caribe, con «el mar de los siete colores». En el Pacífico están Gorgona y Malpelo.',
      pregunta: { texto: '¿Qué lengua hablan muchos raizales de San Andrés, además del español?', opciones: ['El creole', 'El portugués', 'El francés'], correcta: 0 } },

    { id: 'm11', tipo: 'rio', rio: 'cauca', tiempo: 90,
      pide: 'Sigue el río Cauca hasta que se une con el Magdalena.',
      dato: 'El Cauca es el afluente más largo del Magdalena. Nace en el Macizo Colombiano, cerca de donde nace el Magdalena, y pasa por el valle donde está Cali.',
      pregunta: { texto: '¿Dónde nacen los ríos Magdalena y Cauca?', opciones: ['En el Macizo Colombiano', 'En la Sierra Nevada de Santa Marta', 'En los Llanos Orientales'], correcta: 0 } },

    { id: 'm12', tipo: 'capital', ciudad: 'cartagena', salida: [-74.0, 8.2, 330], tiempo: 60,
      pide: 'Aterriza en la capital de Bolívar.',
      dato: 'Cartagena de Indias es la capital de Bolívar. Su ciudad amurallada se construyó para defenderse de los piratas y hoy es Patrimonio de la Humanidad.',
      pregunta: { texto: '¿Para qué se construyeron las murallas de Cartagena?', opciones: ['Para defenderse de los piratas', 'Para guardar el agua de lluvia', 'Para encerrar el ganado'], correcta: 0 } },

    { id: 'm13', tipo: 'region', region: 'andina', salida: [-68.5, 5.6, 270], tiempo: 70,
      pide: 'Vuela a la región de las tres cordilleras, donde se cultiva el café.',
      dato: 'En la región Andina vive la mayor parte de los colombianos. La cruzan tres cordilleras: Occidental, Central y Oriental. En el Eje Cafetero se cultiva café en las montañas.',
      pregunta: { texto: '¿Cuántas cordilleras cruzan Colombia?', opciones: ['Tres', 'Dos', 'Cinco'], correcta: 0 } },

    { id: 'm14', tipo: 'capital', ciudad: 'pasto', salida: [-75.4, 3.6, 220], tiempo: 60,
      pide: 'Aterriza en la capital de Nariño.',
      dato: 'Pasto es la capital de Nariño y está cerca del volcán Galeras. En enero celebra el Carnaval de Negros y Blancos, Patrimonio de la Humanidad.',
      pregunta: { texto: '¿Qué carnaval se celebra en Pasto?', opciones: ['El Carnaval de Negros y Blancos', 'El Carnaval de Barranquilla', 'La Feria de Cali'], correcta: 0 } }
  ],

  /* ---------- Geografía del mapa (aproximada, para dibujar) ---------- */
  mapa: {
    /* Silueta de Colombia continental, en el sentido de las agujas del reloj desde Punta Gallinas. */
    contorno: [
      [-71.67, 12.46], [-71.25, 12.15], [-71.32, 11.85], [-72.2, 11.12], [-72.7, 10.4], [-72.95, 9.7], [-73.05, 9.2],
      [-72.75, 8.95], [-72.35, 8.6], [-72.48, 7.9], [-72.4, 7.4], [-71.9, 7.0], [-71.0, 7.05], [-70.1, 7.0],
      [-69.4, 6.15], [-68.5, 6.2], [-67.5, 6.25], [-67.6, 5.5], [-67.85, 4.8], [-67.8, 4.2], [-67.9, 3.85],
      [-67.6, 3.0], [-67.3, 2.2], [-67.1, 1.6], [-66.85, 1.22], [-67.2, 1.05], [-68.2, 1.75], [-69.45, 1.07],
      [-69.8, 0.6], [-69.65, 0.0], [-69.45, -0.6], [-69.4, -1.2], [-69.95, -4.22], [-70.75, -3.75], [-70.1, -2.6],
      [-71.2, -2.3], [-72.3, -2.45], [-73.1, -1.8], [-73.6, -1.2], [-74.6, -0.3], [-75.2, -0.05], [-75.6, 0.1],
      [-76.4, 0.35], [-77.0, 0.75], [-77.7, 0.85], [-78.6, 1.25], [-78.85, 1.45], [-78.75, 1.8], [-78.1, 2.55],
      [-77.6, 2.7], [-77.3, 3.3], [-77.15, 3.85], [-77.45, 4.25], [-77.35, 5.0], [-77.45, 5.6], [-77.35, 6.25],
      [-77.75, 6.9], [-77.9, 7.25], [-77.75, 7.75], [-77.4, 8.2], [-77.36, 8.67], [-77.05, 8.4], [-76.85, 8.0],
      [-76.7, 8.2], [-76.78, 8.5], [-76.43, 8.85], [-76.0, 9.3], [-75.65, 9.45], [-75.55, 9.8], [-75.5, 10.4],
      [-75.25, 10.8], [-74.85, 11.1], [-74.3, 11.0], [-74.2, 11.28], [-73.6, 11.27], [-72.9, 11.6], [-72.4, 11.85],
      [-72.05, 12.3]
    ],
    /* Panamá, para que no se vea mar donde hay tierra. */
    panama: [[-77.36, 8.67], [-77.9, 7.22], [-78.4, 7.6], [-78.6, 8.3], [-79.6, 8.85], [-80.6, 8.0], [-81.5, 8.1],
      [-82.9, 8.3], [-82.9, 9.4], [-81.0, 8.9], [-80.0, 9.35], [-79.0, 9.55], [-78.0, 9.2]],
    /* Límites aproximados entre regiones (líneas que el motor interpola). */
    limites: {
      caribe:    [[-78, 8.2], [-77.5, 8.2], [-76.3, 7.9], [-75.6, 7.6], [-74.8, 7.9], [-74.0, 8.3], [-73.5, 8.9], [-73.2, 9.6], [-72.8, 10.0], [-72.3, 10.8], [-71, 11.0]],
      pacifica:  [[0.0, -78], [0.9, -77.7], [2.0, -77.3], [3.5, -76.8], [5.0, -76.35], [6.0, -76.2], [7.0, -76.3], [8.2, -76.9]],
      piedemonte:[[-1, -77.5], [0.6, -77.2], [1.1, -76.85], [1.6, -75.8], [3.0, -74.4], [4.1, -73.75], [5.3, -72.55], [6.0, -72.45], [7.2, -72.25], [8, -72.2]],
      guaviare:  [[-75, 2.9], [-74.5, 2.9], [-72.64, 2.65], [-71.0, 2.9], [-69.0, 3.5], [-67.9, 3.95], [-66, 4.2]]
    },
    /* Cordilleras: línea de cumbres [lon, lat] y altura relativa. */
    cordilleras: [
      { nombre: 'Cordillera Occidental', alto: 1.5, puntos: [[-77.9, 0.95], [-77.5, 1.4], [-77.1, 2.4], [-76.75, 3.5], [-76.45, 4.6], [-76.2, 6.0], [-76.25, 7.0], [-76.1, 7.8]] },
      { nombre: 'Cordillera Central',    alto: 2.2, puntos: [[-77.6, 0.9], [-77.0, 1.3], [-76.4, 1.9], [-76.0, 2.6], [-75.6, 3.6], [-75.4, 4.6], [-75.4, 5.8], [-75.5, 6.8], [-75.1, 7.8]] },
      { nombre: 'Cordillera Oriental',   alto: 1.9, puntos: [[-76.2, 1.8], [-75.3, 2.3], [-74.7, 3.2], [-74.1, 4.3], [-73.7, 5.2], [-73.0, 6.3], [-72.8, 7.2], [-72.95, 8.3], [-73.0, 9.2], [-72.8, 10.2]] }
    ],
    picos: [
      { nombre: 'Sierra Nevada de Santa Marta', pos: [-73.7, 10.85], alto: 2.9, ancho: 0.38 },
      { nombre: 'Serranía de La Macarena', pos: [-73.9, 2.5], alto: 0.9, ancho: 0.3 }
    ],
    rios: {
      magdalena: { nombre: 'Río Magdalena', puntos: [[-76.55, 1.93], [-76.0, 2.25], [-75.6, 2.6], [-75.3, 2.95], [-75.0, 3.5], [-74.85, 4.3], [-74.75, 5.2], [-74.4, 6.2], [-73.86, 7.07], [-73.85, 7.8], [-74.0, 8.9], [-74.45, 9.24], [-74.75, 9.3], [-74.8, 10.0], [-74.78, 10.6], [-74.85, 11.1]] },
      cauca:     { nombre: 'Río Cauca',     puntos: [[-76.4, 2.0], [-76.6, 2.45], [-76.5, 3.0], [-76.45, 3.5], [-76.2, 4.2], [-75.9, 4.9], [-75.75, 5.6], [-75.75, 6.3], [-75.4, 7.0], [-75.2, 7.9], [-74.85, 8.6], [-74.55, 9.2]] }
    },
    /* Islas de la región Insular: [lon, lat], tamaño de dibujo (exagerado para que se vean). */
    islas: [
      { nombre: 'San Andrés',  pos: [-81.70, 12.55], r: 0.28 },
      { nombre: 'Providencia', pos: [-81.37, 13.35], r: 0.2 },
      { nombre: 'Gorgona',     pos: [-78.18, 2.97],  r: 0.13 },
      { nombre: 'Malpelo',     pos: [-81.6, 4.0],    r: 0.13 }
    ]
  }
};
