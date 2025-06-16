document.addEventListener('DOMContentLoaded', () => {
    // Получение ID заказа из URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) {
        alert('Заказ не указан');
        window.location.href = 'orders.html';
        return;
    }
    
    document.getElementById('order-number').textContent = `#${orderId}`;
    
    // Инициализация карты
    const map = L.map('tracking-map').setView([43.585525, 39.723062], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Маркер клиента
    const clientMarker = L.marker([43.585525, 39.723062], {
        icon: L.divIcon({
            className: 'client-marker',
            html: '<div class="marker-pin"></div><div class="marker-label">Вы</div>',
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        })
    }).addTo(map);
    
    // Маркер мастера
    const masterMarker = L.marker([43.580000, 39.700000], {
        icon: L.divIcon({
            className: 'master-marker',
            html: '<div class="marker-pin"></div><div class="marker-label">Мастер</div>',
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        })
    }).addTo(map);
    
    // Линия маршрута
    const routeLine = L.polyline([
        [43.585525, 39.723062],
        [43.580000, 39.700000]
    ], {color: '#4361ee'}).addTo(map);
    
    // Подключение к WebSocket для трекинга
    const socket = new WebSocket(`wss://${window.location.host}/ws/tracking/${orderId}`);
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const newPosition = [data.latitude, data.longitude];
        
        // Обновление позиции мастера
        masterMarker.setLatLng(newPosition);
        
        // Обновление линии маршрута
        routeLine.setLatLngs([clientMarker.getLatLng(), newPosition]);
        
        // Расчет расстояния
        const distance = calculateDistance(
            clientMarker.getLatLng().lat, 
            clientMarker.getLatLng().lng,
            newPosition[0],
            newPosition[1]
        );
        
        // Расчет примерного времени прибытия (при средней скорости 50 км/ч)
        const timeMinutes = Math.round((distance / 50) * 60);
        document.querySelector('.distance').textContent = 
            `Прибудет через ~${timeMinutes} мин`;
    };
    
    socket.onclose = () => {
        console.log('WebSocket соединение закрыто');
    };
    
    // Функция расчета расстояния
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Радиус Земли в км
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c; // Расстояние в км
    }
    
    function deg2rad(deg) {
        return deg * (Math.PI/180);
    }
});