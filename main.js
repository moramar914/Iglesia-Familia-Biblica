import './style.css'
import { churchData } from './data.js'

document.addEventListener("DOMContentLoaded", () => {
    // 1. Llenar Contenido Dinámico (Data Binding)

    // Footer / Logística / Ubicación
    const locElement = document.getElementById("church-location-new");
    const mailElement = document.getElementById("church-email-new");
    
    if (locElement) locElement.textContent = churchData.churchInfo.location;
    if (mailElement) mailElement.textContent = churchData.churchInfo.email;
    document.getElementById("year").textContent = new Date().getFullYear();

    // Enseñanza - Servicio En Vivo
    const liveUrl = churchData.servicio.liveUrl;
    const liveOffline = document.getElementById("live-offline");
    const liveOnline = document.getElementById("live-online");
    
    // Si la URL es el placeholder por defecto o está vacía, mostramos el banner offline
    if (!liveUrl || liveUrl.includes("CHANNEL_ID")) {
        if (liveOffline) liveOffline.classList.remove("hidden");
        if (liveOnline) liveOnline.classList.add("hidden");
    } else {
        if (liveOffline) liveOffline.classList.add("hidden");
        if (liveOnline) liveOnline.classList.remove("hidden");
        document.getElementById("live-video").src = liveUrl;
    }

    // Enseñanza - Series de YouTube (Pestañas)
    const seriesTabs = document.getElementById("series-tabs");
    const seriesContent = document.getElementById("series-content");

    if (seriesTabs && seriesContent && churchData.seriesEnseñanza) {
        // Función para renderizar los videos de una serie específica
        const renderVideos = (videos) => {
            seriesContent.innerHTML = '';
            const grid = document.createElement("div");
            grid.className = "series-grid";

            videos.forEach(video => {
                const card = document.createElement("a");
                card.href = video.url;
                card.target = "_blank";
                card.className = "video-card";
                card.innerHTML = `
                    <img src="${video.thumb}" alt="${video.title}" class="video-thumb" loading="lazy">
                    <div class="video-info">
                        <h4 class="video-title">${video.title}</h4>
                    </div>
                `;
                grid.appendChild(card);
            });
            seriesContent.appendChild(grid);
        };

        // Generar las pestañas
        churchData.seriesEnseñanza.forEach((serie, index) => {
            const btn = document.createElement("button");
            btn.className = "tab-btn";
            btn.textContent = serie.title;
            
            // La primera pestaña está activa por defecto
            if (index === 0) {
                btn.classList.add("active");
                renderVideos(serie.videos);
            }

            // Evento click de la pestaña
            btn.addEventListener("click", () => {
                // Remover clase active de todas las pestañas
                document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
                // Añadir clase active a la seleccionada
                btn.classList.add("active");
                // Renderizar los videos correspondientes
                renderVideos(serie.videos);
            });

            seriesTabs.appendChild(btn);
        });
    }

    // Devocionales (Inyección Dinámica como Páginas de Libro en Carrusel + Marcapáginas Inteligente)
    const devContainer = document.getElementById("devocionales-container");
    if (devContainer && churchData.devocionales) {
        devContainer.innerHTML = ''; // Limpiar cualquier residuo de prueba
        churchData.devocionales.forEach((dev, index) => {
            const article = document.createElement("article");
            article.className = "devocional-card"; // Quitar fade-up para visibilidad inmediata
            article.setAttribute("data-dev-id", dev.id); // Identificador para el marcapáginas
            
            // Creamos la estructura HTML interna del libro con contador y botón de compartir
            article.innerHTML = `
                <div class="devocional-number">Lectura #${index + 1}</div>
                <span class="devocional-meta">${dev.date} • ${dev.author}</span>
                <h3>${dev.title}</h3>
                <div class="devocional-body">
                    <p class="dropcap">${dev.content}</p>
                </div>
                <button class="btn-share-devotional" data-title="${dev.title}" aria-label="Compartir este devocional">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Compartir Lectura
                </button>
            `;
            devContainer.appendChild(article);
        });

        // 1. Lógica del Marcapáginas Inteligente (Autoguardado)
        // Vigila qué devocional está anclado en la pantalla
        const devObserverOp = {
            root: devContainer,
            threshold: 0.6 // Necesita ver al menos el 60% de la tarjeta para considerarla activa
        };

        const devObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const devId = entry.target.getAttribute("data-dev-id");
                    localStorage.setItem('iglesia-last-devo', devId); // Guardar en el navegador
                }
            });
        }, devObserverOp);

        // Poner a observar todas las tarjetas
        document.querySelectorAll(".devocional-card").forEach(card => devObserver.observe(card));

        // 2. Restauración de Lectura (Auto-Scroll)
        // Al terminar de cargar los devocionales, buscar si hay guardado
        setTimeout(() => {
            const lastReadID = localStorage.getItem('iglesia-last-devo');
            if (lastReadID) {
                const targetCard = document.querySelector(`.devocional-card[data-dev-id="${lastReadID}"]`);
                if (targetCard) {
                    // Deslizamiento silencioso hacia el separador de libros
                    devContainer.scrollTo({
                        left: targetCard.offsetLeft - devContainer.offsetLeft,
                        behavior: 'smooth'
                    });
                }
            }
        }, 500); // Pequeño retraso visual para que cargue la fuente y dimensiones previas


        // 3. Event Listeners para Web Share API
        const shareButtons = document.querySelectorAll('.btn-share-devotional');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const title = e.currentTarget.getAttribute('data-title');
                const shareData = {
                    title: `Devocional: ${title}`,
                    text: `Lee este hermoso devocional titulado "${title}" de la Iglesia Cristiana Bautista:`,
                    url: window.location.href.split('#')[0] + '#devocionales' // Link directo a la sección
                };

                try {
                    if (navigator.share) {
                        await navigator.share(shareData);
                    } else {
                        // Fallback: Copiar al portapapeles si no hay Web Share API (ej. PC antiguos)
                        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                        const originalHtml = btn.innerHTML;
                        btn.innerHTML = `<i class="fa-solid fa-check"></i> ¡Enlace copiado!`;
                        setTimeout(() => btn.innerHTML = originalHtml, 2500);
                    }
                } catch (err) {
                    console.log('Error al compartir o el usuario canceló:', err);
                }
            });
        });

        // Funcionalidad de las Flechas de Navegación (Desplazamiento)
        const btnPrev = document.getElementById("dev-prev");
        const btnNext = document.getElementById("dev-next");
        
        if (btnPrev && btnNext) {
            btnPrev.addEventListener("click", () => {
                // Desplaza a la izquierda el ancho aproximado de una tarjeta
                devContainer.scrollBy({ left: -350, behavior: 'smooth' });
            });
            
            btnNext.addEventListener("click", () => {
                // Desplaza a la derecha
                devContainer.scrollBy({ left: 350, behavior: 'smooth' });
            });
        }
    }



    // (Misiones y Servicio se manejan ahora dinámicamente o son estáticos)

    // (El QR y los detalles bancarios ahora son estáticos en el DOM)


    // 2. Interactividad y Animaciones (Scroll)

    // Navbar cambia de estilo al hacer scroll
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // =========================================
    // MODAL "CONÓCENOS MÁS" (PAPIRO)
    // =========================================
    const btnConocenos = document.getElementById("btn-conocenos");
    const modalConocenos = document.getElementById("conocenos-modal");
    const closeConocenos = document.getElementById("close-conocenos");

    if (btnConocenos && modalConocenos && closeConocenos) {
        // Abrir Modal
        btnConocenos.addEventListener("click", () => {
            modalConocenos.classList.add("active");
            document.body.style.overflow = "hidden"; // Prevenir scroll de la página de fondo
        });

        // Cerrar Modal (Botón X)
        closeConocenos.addEventListener("click", () => {
            modalConocenos.classList.remove("active");
            document.body.style.overflow = ""; // Restaurar scroll
        });

        // Cerrar Modal (Clickeando fuera del papiro)
        modalConocenos.addEventListener("click", (e) => {
            if (e.target === modalConocenos) {
                modalConocenos.classList.remove("active");
                document.body.style.overflow = "";
            }
        });

        // Cerrar Modal (Tecla Escape)
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modalConocenos.classList.contains("active")) {
                modalConocenos.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    // Animaciones Fade-Up con Intersection Observer (Transiciones modernas)
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target); // Animación sucede solo una vez
            }
        });
    }, observerOptions);

    document.querySelectorAll(".fade-up").forEach(el => {
        observer.observe(el);
    });

    // Navegación por secciones (SPA)
    const navLinksElems = document.querySelectorAll('.nav-panel-link, .nav-panel-sublink, .hero-btn, .logo');
    const sectionElems = document.querySelectorAll('.section');
    const heroSection = document.getElementById('inicio');

    function navigateTo(targetId) {
        if (targetId === '#inicio' || targetId === '#') {
            heroSection.classList.remove('hidden');
            sectionElems.forEach(sec => sec.classList.remove('active'));
            // Activar animaciones en el hero manualmente
            heroSection.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
        } else {
            heroSection.classList.add('hidden');
            sectionElems.forEach(sec => {
                if (`#${sec.id}` === targetId) {
                    sec.classList.add('active');
                    // ACTIVAR ANIMACIONES AUTOMÁTICAMENTE:
                    // Buscamos todos los elementos que deberían animarse dentro de esta sección
                    // y les añadimos la clase 'visible' de inmediato para evitar que se vea vacío.
                    sec.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
                } else {
                    sec.classList.remove('active');
                }
            });
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    navLinksElems.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                navigateTo(href);
                // Actualizar la URL de forma visual sin recargar
                history.pushState(null, null, href);
            }
        });
    });

    // Verificar hash actual al cargar la página para enlace directo
    if (window.location.hash) {
        navigateTo(window.location.hash);
    } else {
        navigateTo('#inicio');
    }

    // =========================================
    // HAMBURGER MENU
    // =========================================
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navOverlay   = document.getElementById('nav-overlay');
    const navBackdrop  = document.getElementById('nav-backdrop');
    const navCloseBtn  = document.getElementById('nav-close-btn');
    const navPanelLinks = document.querySelectorAll('.nav-panel-link, .nav-panel-sublink');

    function openMenu() {
        hamburgerBtn.classList.add('open');
        navOverlay.classList.add('open');
        navBackdrop.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        hamburgerBtn.classList.remove('open');
        navOverlay.classList.remove('open');
        navBackdrop.classList.remove('visible');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', () => {
        navOverlay.classList.contains('open') ? closeMenu() : openMenu();
    });

    navCloseBtn.addEventListener('click', closeMenu);
    navBackdrop.addEventListener('click', closeMenu);

    navPanelLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                closeMenu();
                navigateTo(href);
                history.pushState(null, null, href);
            }
        });
    });

    // =========================================
    // CALENDARIO DE OPORTUNIDADES DE SERVICIO
    // =========================================
    const calGrid        = document.getElementById('cal-grid');
    const calMonthLabel  = document.getElementById('cal-month-label');
    const calPrev        = document.getElementById('cal-prev');
    const calNext        = document.getElementById('cal-next');
    const calLegend      = document.getElementById('cal-legend');
    const calPopup       = document.getElementById('cal-popup');
    const calPopupInner  = document.getElementById('cal-popup-inner');

    if (calGrid) {
        const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                           'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const types = churchData.scheduleTypes;

        // Datos base (fallback demo)
        let scheduleData   = { ...churchData.scheduleDemo };
        let recurringRules = []; // [{targetDays:[1,3], type, person, hora}, ...]

        // ──────────────────────────────────────────────────────
        // MOTOR DE RECURRENCIA
        // En el Google Sheet, si la columna "fecha" contiene un nombre
        // de día en lugar de una fecha (ej: MIERCOLES,JUEVES o LUNES-VIERNES)
        // se tratará como una regla recurrente que aplica a TODOS los meses.
        //
        // Nombres válidos (sin tilde): 
        //   LUNES MARTES MIERCOLES JUEVES VIERNES SABADO DOMINGO
        //
        // Ejemplos de uso en el Sheet:
        //   MIERCOLES,JUEVES  | escuela      |        | 8:00 PM
        //   LUNES-VIERNES     | dev-hombres  |        | 9:30 PM
        //   DOMINGO           | servicio     |        | 10:00 AM
        // ──────────────────────────────────────────────────────
        const DAY_MAP = {
            'LUNES':0+1, 'MARTES':1+1, 'MIERCOLES':2+1, 'MIÉRCOLES':2+1,
            'JUEVES':3+1, 'VIERNES':4+1, 'SABADO':5+1, 'SÁBADO':5+1,
            'DOMINGO':0
        };
        // getDay() retorna: 0=Dom,1=Lun,2=Mar,3=Mié,4=Jue,5=Vie,6=Sáb
        const DAY_NUM = {
            'LUNES':1,'MARTES':2,'MIERCOLES':3,'MIÉRCOLES':3,
            'JUEVES':4,'VIERNES':5,'SABADO':6,'SÁBADO':6,'DOMINGO':0
        };
        const ALL_DAY_NAMES = Object.keys(DAY_NUM);

        function isDayPattern(str) {
            const upper = str.toUpperCase();
            return ALL_DAY_NAMES.some(d => upper.includes(d));
        }

        function parseDayPattern(pattern) {
            // Retorna array de números de getDay() para los días del patrón
            const upper = pattern.toUpperCase().trim();
            const days  = new Set();

            if (upper.includes('-')) {
                // Rango: LUNES-VIERNES
                const [startStr, endStr] = upper.split('-');
                const ORDER = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
                const si = ORDER.findIndex(d => startStr.trim().includes(d.slice(0,3)));
                const ei = ORDER.findIndex(d => endStr.trim().includes(d.slice(0,3)));
                if (si !== -1 && ei !== -1) {
                    for (let i = si; i <= ei; i++) days.add(DAY_NUM[ORDER[i]] ?? i % 7);
                }
            } else {
                // Lista separada por comas: MIERCOLES,JUEVES
                upper.split(',').forEach(part => {
                    const key = ALL_DAY_NAMES.find(d => part.trim().startsWith(d));
                    if (key !== undefined) days.add(DAY_NUM[key]);
                });
            }
            return [...days];
        }

        function getEffectiveSchedule(year, month) {
            const totalDays = new Date(year, month + 1, 0).getDate();
            // Copia profunda para no mutar scheduleData
            const effective = {};
            Object.entries(scheduleData).forEach(([k, v]) => { effective[k] = [...v]; });

            recurringRules.forEach(rule => {
                for (let d = 1; d <= totalDays; d++) {
                    const date    = new Date(year, month, d);
                    const dayNum  = date.getDay(); // 0=Dom…6=Sab
                    if (!rule.targetDays.includes(dayNum)) continue;
                    const dateStr = `${year}-${pad(month+1)}-${pad(d)}`;
                    if (!effective[dateStr]) effective[dateStr] = [];
                    // Evitar duplicados del mismo tipo recurrente
                    if (!effective[dateStr].some(e => e.type === rule.type && e.isRecurring)) {
                        effective[dateStr].push({ ...rule, isRecurring: true });
                    }
                }
            });
            return effective;
        }

        // ──────────────────────────────────────────────────────
        async function loadSheetData() {
            const url = churchData.scheduleSheetUrl;
            if (!url || url === 'PENDING_GOOGLE_SHEET_URL') return;
            try {
                const res = await fetch(url);
                const csv = await res.text();
                scheduleData   = {};
                recurringRules = [];
                const rows = csv.trim().split('\n').slice(1); // saltar header

                // Parser CSV que respeta campos entrecomillados (ej: "MIERCOLES,JUEVES")
                function parseCSVRow(row) {
                    const fields = [];
                    let current  = '';
                    let inQuotes = false;
                    for (let i = 0; i < row.length; i++) {
                        const ch = row[i];
                        if (ch === '"') {
                            inQuotes = !inQuotes;
                        } else if (ch === ',' && !inQuotes) {
                            fields.push(current.trim());
                            current = '';
                        } else {
                            current += ch;
                        }
                    }
                    fields.push(current.trim());
                    return fields;
                }

                rows.forEach(row => {
                    // Columnas: fecha | tipo | persona | hora
                    const [date, type, person, hora] = parseCSVRow(row);
                    if (!date || !type) return;

                    if (isDayPattern(date)) {
                        // 📆 Actividad recurrente por día de la semana
                        recurringRules.push({
                            targetDays: parseDayPattern(date),
                            type,
                            person: person || '',
                            hora:   hora   || ''
                        });
                    } else {
                        // 📅 Fecha específica
                        if (!scheduleData[date]) scheduleData[date] = [];
                        scheduleData[date].push({ type, person: person || '', hora: hora || '' });
                    }
                });
                renderCalendar();
            } catch(e) { console.warn('No se pudo cargar Google Sheet, usando datos demo'); }
        }

        let currentYear  = new Date().getFullYear();
        let currentMonth = new Date().getMonth(); // 0-based

        function pad(n) { return String(n).padStart(2,'0'); }

        function renderCalendar() {
            if (!calGrid) return;
            calGrid.innerHTML = '';
            const year  = currentYear;
            const month = currentMonth;
            calMonthLabel.textContent = `${MONTHS_ES[month]} ${year}`;

            // Combinar fechas específicas + actividades recurrentes para este mes
            const effectiveSchedule = getEffectiveSchedule(year, month);

            const totalDays = new Date(year, month + 1, 0).getDate();
            // Primer día del mes (Colombia: semana empieza en lunes)
            const firstDay  = new Date(year, month, 1);
            // getDay(): 0=Sun,1=Mon..6=Sat → offset para lunes primero
            let startOffset = firstDay.getDay(); // 0=Dom
            startOffset = (startOffset === 0) ? 6 : startOffset - 1;

            const today = new Date();
            const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

            // Celdas vacías al inicio
            for (let i = 0; i < startOffset; i++) {
                const empty = document.createElement('div');
                empty.className = 'cal-cell cal-empty';
                calGrid.appendChild(empty);
            }

            for (let d = 1; d <= totalDays; d++) {
                const dateStr = `${year}-${pad(month+1)}-${pad(d)}`;
                const dayOfWeek = (startOffset + d - 1) % 7; // 0=Lun..6=Dom
                const isSunday  = dayOfWeek === 6;
                const isToday   = dateStr === todayStr;

                const cell = document.createElement('div');
                cell.className = 'cal-cell' +
                    (isSunday ? ' cal-is-sunday' : '') +
                    (isToday  ? ' cal-today'     : '');

                const dayNum = document.createElement('span');
                dayNum.className = 'cal-day-num';
                dayNum.textContent = d;
                cell.appendChild(dayNum);

                const entries = effectiveSchedule[dateStr] || [];
                if (entries.length > 0) {
                    const iconsDiv = document.createElement('div');
                    iconsDiv.className = 'cal-icons';
                    const MAX_SHOW = 4;
                    entries.slice(0, MAX_SHOW).forEach(entry => {
                        const def = types[entry.type];
                        if (!def) return;
                        const btn = document.createElement('button');
                        btn.className = 'cal-icon-btn' + (def.category === 'evento' ? ' cal-evento' : '');
                        btn.style.background = def.bg;
                        btn.style.color = def.color;
                        btn.title = `${def.label}: ${entry.person}`;
                        btn.innerHTML = `<i class="fa-solid ${def.icon}" style="pointer-events:none;"></i>`;
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            showPopup(e, entry, def, dateStr, d, month, year);
                        });
                        iconsDiv.appendChild(btn);
                    });
                    if (entries.length > MAX_SHOW) {
                        const more = document.createElement('span');
                        more.className = 'cal-more';
                        more.textContent = `+${entries.length - MAX_SHOW}`;
                        iconsDiv.appendChild(more);
                    }
                    cell.appendChild(iconsDiv);
                }

                calGrid.appendChild(cell);
            }
        }

        function showPopup(e, entry, def, dateStr, day, month, year) {
            const rect = e.currentTarget.getBoundingClientRect();
            const horaHtml = entry.hora
                ? `<div class="cal-popup-hora"><i class="fa-regular fa-clock" style="margin-right:4px"></i>${entry.hora}</div>`
                : '';
            calPopupInner.innerHTML = `
                <div class="cal-popup-type" style="color:${def.color}">
                  <i class="fa-solid ${def.icon}" style="margin-right:6px"></i>${def.label}
                </div>
                ${entry.person ? `<div class="cal-popup-person">${entry.person}</div>` : ''}
                ${horaHtml}
                <div class="cal-popup-date">${day} de ${MONTHS_ES[month]} ${year}</div>
            `;
            
            // Primero hacerlo "invisible" pero renderizado para medirlo
            calPopup.style.visibility = 'hidden';
            calPopup.classList.add('visible');
            
            const popupW = calPopup.offsetWidth;
            const popupH = calPopup.offsetHeight;
            
            // Lógica de posicionamiento inteligente:
            // Intentar centrarlo horizontalmente respecto al icono por defecto
            let left = rect.left + (rect.width / 2) - (popupW / 2);
            let top  = rect.bottom + 10;
            
            // Si el popup se sale por la derecha, alinearlo a la derecha del icono o pegarlo al margen
            if (left + popupW > window.innerWidth - 20) {
                left = rect.right - popupW;
            }
            // Si se sale por la izquierda
            if (left < 20) {
                left = rect.left;
            }
            
            // Si el nombre es muy largo y el anfitrión está a la derecha, forzar margen derecho
            if (left + popupW > window.innerWidth - 10) {
                left = window.innerWidth - popupW - 10;
            }

            // Si se sale por abajo, mostrarlo ARRIBA del icon
            if (top + popupH > window.innerHeight - 20) {
                top = rect.top - popupH - 10;
            }
            
            // Casos extremos de móviles muy pequeños
            if (top < 10) top = 10;
            if (left < 10) left = 10;

            calPopup.style.left = left + 'px';
            calPopup.style.top  = top  + 'px';
            calPopup.style.visibility = 'visible';
        }

        // Cerrar popup al hacer clic fuera
        document.addEventListener('click', () => calPopup.classList.remove('visible'));
        calPopup.addEventListener('click', e => e.stopPropagation());

        // Navegación
        calPrev.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            renderCalendar();
        });
        calNext.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            renderCalendar();
        });

        // Leyenda en 3 columnas con distribución equitativa
        function renderLegend() {
            const calLegend = document.getElementById('cal-legend');
            if (!calLegend) return;
            calLegend.innerHTML = '';

            const entries = Object.entries(types);
            const N = entries.length;
            // Distribución equitativa en 3 columnas: [ceil, ceil, floor]
            const c1 = Math.ceil(N / 3);
            const c2 = Math.ceil((N - c1) / 2);
            const c3 = N - c1 - c2;
            const splits = [0, c1, c1 + c2, N];

            for (let col = 0; col < 3; col++) {
                const colDiv = document.createElement('div');
                colDiv.className = 'cal-legend-col';
                entries.slice(splits[col], splits[col + 1]).forEach(([key, def]) => {
                    const item = document.createElement('div');
                    item.className = 'cal-legend-item';
                    item.innerHTML = `
                        <span class="cal-legend-icon" style="background:${def.bg};color:${def.color}">
                          <i class="fa-solid ${def.icon}"></i>
                        </span>
                        ${def.label}
                    `;
                    colDiv.appendChild(item);
                });
                calLegend.appendChild(colDiv);
            }
        }

        loadSheetData();
        renderCalendar();
        renderLegend();
    }

    // --- MISIONES (AMOR EN ACCIÓN) ---
    const misionesGrid = document.getElementById("misiones-grid");
    if (misionesGrid && churchData.misiones) {
        churchData.misiones.forEach(mision => {
            const card = document.createElement("div");
            card.className = "mision-card";
            card.innerHTML = `
                <div class="mision-img-container">
                    <img src="${mision.image}" alt="${mision.title}" class="mision-img" loading="lazy">
                    <div class="mision-impact-badge">${mision.impact}</div>
                </div>
                <div class="mision-content">
                    <span class="mision-tagline">${mision.tagline}</span>
                    <h3>${mision.title}</h3>
                    <p class="mision-description">${mision.description}</p>
                </div>
            `;
            misionesGrid.appendChild(card);
        });
    }

    // --- MATERIAL DE APOYO ---
    const materialGrid = document.getElementById("material-grid");
    if (materialGrid && churchData.materialApoyo) {
        churchData.materialApoyo.forEach(item => {
            const card = document.createElement("div");
            card.className = "material-card fade-up"; // Agregamos fade-up
            card.innerHTML = `
                <span class="material-type">${item.type}</span>
                <div class="material-icon-box" style="color: ${item.color}">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="material-actions">
                    <a href="${item.url}" class="btn-apoyo btn-download" download="${item.title}.pdf" title="Descargar archivo">
                        <i class="fa-solid fa-download"></i> Descargar
                    </a>
                    <button class="btn-apoyo btn-share-alt" 
                            data-title="${item.title}" 
                            data-url="${item.url}" 
                            title="Compartir material">
                        <i class="fa-solid fa-share-nodes"></i> Compartir
                    </button>
                </div>
            `;
            materialGrid.appendChild(card);
            
            // Observar el nuevo card para la animación
            if (typeof observer !== 'undefined') {
                observer.observe(card);
            }
        });

        // Lógica de compartir (Web Share API)
        materialGrid.addEventListener("click", async (e) => {
            const shareBtn = e.target.closest(".btn-share-alt");
            if (shareBtn) {
                const title = shareBtn.getAttribute("data-title");
                let url = shareBtn.getAttribute("data-url");

                // Convertir URL relativa a absoluta para compartir fuera del sitio
                if (url && !url.startsWith('http')) {
                    // Normalizar ruta: quitar ./ inicial si existe
                    const cleanPath = url.startsWith('./') ? url.substring(2) : url;
                    
                    const baseUrl = window.location.href.split('#')[0];
                    const pathFix = baseUrl.endsWith('/') ? baseUrl : baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
                    url = pathFix + cleanPath;
                }

                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: `Material de Apoyo: ${title}`,
                            text: `Hola, quiero compartirte este material de la Iglesia Familia Bíblica: ${title}`,
                            url: url
                        });
                    } catch (err) {
                        console.log("Error al compartir:", err);
                    }
                } else {
                    // Fallback para dispositivos que no soportan Web Share
                    const shareText = encodeURIComponent(`Material de Apoyo: ${title} - ${url}`);
                    window.open(`https://wa.me/?text=${shareText}`, "_blank");
                }
            }
        });
    }

    // --- ALABANZA (Pistas y Karaokes de YouTube) ---
    const alabanzaGrid = document.getElementById("alabanza-grid");
    if (alabanzaGrid && churchData.alabanza) {
        churchData.alabanza.forEach(v => {
            const card = document.createElement("a");
            card.href = v.url;
            card.target = "_blank";
            card.className = "alabanza-video-card";
            card.innerHTML = `
                <img class="video-thumb" src="${v.thumb}" alt="${v.title}" loading="lazy">
                <div class="video-info">
                    <p class="video-title">${v.title}</p>
                </div>
            `;
            alabanzaGrid.appendChild(card);
        });
    }
});

