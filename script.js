document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('bookingsBody');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    
    let allBookings = [];

    // 1. Laadi andmed Fetch API abil
    fetch('https://metshein.com/kordamine/json/broneeringud.json')
        .then(response => response.json())
        .then(data => {
            // Kohanda struktuuri vastavalt oodatavale JSON-ile
            // Andmed on tõenäoliselt array või objekti sees array nimega "broneeringud"
            allBookings = Array.isArray(data) ? data : (data.broneeringud || []);
            
            // 2. Kuva saadud andmed esmalt brauseri konsoolis
            console.log("Saadud broneeringud:", allBookings);
            
            // Renderda tabeli algne sisu
            renderTable(allBookings);
        })
        .catch(error => {
            console.error('Viga andmete laadimisel:', error);
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #ef4444;">Viga andmete laadimisel! Kontrolli ühendust.</td></tr>';
        });

    // 3. Leia HTML-lehelt tabeli element DOM-i abil ja renderda sisu
    function renderTable(bookingsToRender) {
        // Tühjenda algne sisu
        tableBody.innerHTML = '';
        
        if (bookingsToRender.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-muted);">Broneeringuid ei leitud.</td></tr>';
            return;
        }

        // 5. Broneeringute read peavad tekkima JavaScripti abil JSON-andmetest
        bookingsToRender.forEach((booking, index) => {
            const tr = document.createElement('tr');
            
            // Anni animatsioonile viide (staggered delay)
            tr.style.animationDelay = `${index * 0.05}s`;
            
            // Teenuse nimi
            const service = booking.teenus || '';
            
            // 6. Lisa igale tabelireale CSS-klass vastavalt teenusele
            let serviceClass = '';
            let serviceLower = service.toLowerCase();
            
            if (serviceLower.includes('juuksur')) serviceClass = 'row-juuksur';
            else if (serviceLower.includes('massaaž') || serviceLower.includes('massaaz')) serviceClass = 'row-massaaz';
            else if (serviceLower.includes('spa')) serviceClass = 'row-spa';
            else if (serviceLower.includes('kosmeetika')) serviceClass = 'row-kosmeetika';
            
            if (serviceClass) {
                tr.classList.add(serviceClass);
            }

            // 4. Kuva kõik broneeringud tabelis
            tr.innerHTML = `
                <td><strong>${booking.klient}</strong></td>
                <td><span class="service-badge">${booking.teenus}</span></td>
                <td>${formatDate(booking.kuupäev || booking.kuupaev)}</td>
                <td>${booking.aeg}</td>
            `;
            
            tableBody.appendChild(tr);
        });
    }

    // Helper: Formateeri kuupäev ilusamaks (vabatahtlik MEGA feature)
    function formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // Kui pole korrektne date, tagasta algne
            
            return date.toLocaleDateString('et-EE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    // --- MEGA Feature: Interaktiivne filter ja otsing ---
    
    // Filter nuppude loogika
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Eemalda active klass kõikidelt
            filterBtns.forEach(b => b.classList.remove('active'));
            // Lisa active klass vajutatud nupule
            btn.classList.add('active');
            
            applyFilters();
        });
    });
    
    // Otsingu loogika (live otsing)
    searchInput.addEventListener('input', () => {
        applyFilters();
    });

    // Tee teenuse tüüp tabelis klikitavaks (filtreerimine)
    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('service-badge')) {
            const serviceName = e.target.textContent.trim();
            // Leia vastav filtri nupp (või 'all' kui ei leia täpset vastet)
            const targetBtn = Array.from(filterBtns).find(b => b.getAttribute('data-filter') === serviceName);
            
            if (targetBtn) {
                // Uuenda nuppude staatust
                filterBtns.forEach(b => b.classList.remove('active'));
                targetBtn.classList.add('active');
                
                // Rakenda filtrid
                applyFilters();
                
                // Kerime üles, kui kasutaja on alla kerinud, et filtrit näha
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });
    
    function applyFilters() {
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        const searchTerm = searchInput.value.toLowerCase();
        
        const filtered = allBookings.filter(booking => {
            // Kontrolli teenuse filtrit
            const matchFilter = activeFilter === 'all' || booking.teenus === activeFilter;
            
            // Kontrolli otsingusõna kliendi nimes
            const matchSearch = booking.klient && booking.klient.toLowerCase().includes(searchTerm);
            
            return matchFilter && matchSearch;
        });
        
        renderTable(filtered);

        // Reklaami loogika
        const businessAds = {
            'Juuksur': { title: 'Jahutav Juuksur', desc: 'Värskenda oma stiili! Parimad professionaalid on valmis sinu juukseid hoolitsema. Broneeri aeg kohe!' },
            'Massaaž': { title: 'Maru Massaaž', desc: 'Lõõgastu peale pikka tööpäeva. Pakume süvakoe ja lõõgastavat massaaži. Tule ja naudi!' },
            'Spa': { title: 'Sulpsti Spa', desc: 'Koge täielikku harmooniat ja rahu. Meie veekeskus ja saunad ootavad sind!' },
            'Kosmeetika': { title: 'Kineetiline Kosmeetika', desc: 'Too esile oma loomulik ilu. Tipptasemel näohooldused ja kosmeetika.' }
        };

        const adSidebar = document.getElementById('adSidebar');
        const adContent = document.getElementById('adContent');
        
        if (activeFilter !== 'all' && businessAds[activeFilter]) {
            adSidebar.style.display = 'block';
            adContent.innerHTML = `
                <h3>${businessAds[activeFilter].title}</h3>
                <p>${businessAds[activeFilter].desc}</p>
                <a href="https://www.hkhk.edu.ee/et" target="_blank" rel="noopener noreferrer" class="ad-cta">Uuri lähemalt</a>
            `;
            // Trigger animation
            adSidebar.style.animation = 'none';
            adSidebar.offsetHeight; 
            adSidebar.style.animation = null;
        } else {
            adSidebar.style.display = 'none';
        }
    }

    // --- Uus Broneering Loogika ---
    const newBookingBtn = document.getElementById('newBookingBtn');
    const bookingModal = document.getElementById('bookingModal');
    const closeModal = document.getElementById('closeModal');
    const bookingForm = document.getElementById('bookingForm');

    newBookingBtn.addEventListener('click', () => {
        bookingModal.classList.add('show');
    });

    closeModal.addEventListener('click', () => {
        bookingModal.classList.remove('show');
    });

    // Sule modal kui klikitakse väljaspool
    window.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.classList.remove('show');
        }
    });

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newBooking = {
            klient: document.getElementById('bName').value,
            teenus: document.getElementById('bService').value,
            kuupaev: document.getElementById('bDate').value,
            aeg: document.getElementById('bTime').value
        };

        // Lisa uute broneeringute algusesse (et oleks tabeli tipus näha)
        allBookings.unshift(newBooking);
        
        // Renderda uuesti (rakendab ka hetkel aktiivsed filtrid ja otsingu)
        applyFilters();
        
        // Peida modal ja tühjenda vorm
        bookingModal.classList.remove('show');
        bookingForm.reset();
    });
});
