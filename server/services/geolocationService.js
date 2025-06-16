const axios = require('axios');

module.exports = {
  getCoordinates: async (address) => {
    try {
      const response = await axios.get('https://geocode-maps.yandex.ru/1.x/', {
        params: {
          geocode: `Сочи, ${address}`,
          apikey: process.env.YANDEX_GEOCODER_KEY,
          format: 'json'
        }
      });
      
      const featureMember = response.data.response.GeoObjectCollection.featureMember;
      if (featureMember.length === 0) {
        throw new Error('Адрес не найден');
      }
      
      const [lng, lat] = featureMember[0].GeoObject.Point.pos.split(' ');
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    } catch (error) {
      console.error('Ошибка геокодирования:', error);
      throw error;
    }
  },
  
  calculateDistance: (coords1, coords2) => {
    const R = 6371; // Радиус Земли в км
    const dLat = deg2rad(coords2.lat - coords1.lat);
    const dLon = deg2rad(coords2.lng - coords1.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(coords1.lat)) * Math.cos(deg2rad(coords2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Расстояние в км
  },
  
  findNearestMasters: async (address, serviceId) => {
    const coords = await this.getCoordinates(address);
    
    // Здесь будет сложная логика поиска мастеров с учетом:
    // - Специализации
    // - Текущей загруженности
    // - Рейтинга
    // - Рабочего графика
    
    // Для демо возвращаем фиктивных мастеров
    return [
      { id: 1, name: 'Иван Петров', distance: 1.2, rating: 4.8 },
      { id: 2, name: 'Мария Сидорова', distance: 0.8, rating: 4.9 },
      { id: 3, name: 'Алексей Иванов', distance: 2.1, rating: 4.7 }
    ];
  }
};

function deg2rad(deg) {
  return deg * (Math.PI/180);
}