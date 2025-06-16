// client/js/master-app.js

document.addEventListener('DOMContentLoaded', () => {
    // Переключение видимости карты
    const mapToggle = document.getElementById('map-toggle');
    const mapContainer = document.getElementById('map-container');
    
    mapToggle.addEventListener('click', () => {
        mapContainer.classList.toggle('active');
        mapToggle.innerHTML = mapContainer.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-map"></i>';
    });
    
    // Инициализация карты
    function initMap() {
        if (typeof L !== 'undefined') {
            const map = L.map('orders-map').setView([43.585525, 39.723062], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Добавляем маркеры заказов
            L.marker([43.585525, 39.723062]).addTo(map)
                .bindPopup('Установка розетки<br>800 руб.')
                .openPopup();
                
            L.marker([43.580000, 39.700000]).addTo(map)
                .bindPopup('Ремонт протечки<br>1,200 руб.');
        } else {
            console.warn('Leaflet not loaded');
        }
    }
    
    // Инициализация карты
    initMap();
});