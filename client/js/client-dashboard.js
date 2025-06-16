document.addEventListener('DOMContentLoaded', async () => {
    // Загрузка заказов пользователя
    const loadOrders = async () => {
        try {
            const response = await fetch('/api/orders?user=current', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (!response.ok) throw new Error('Ошибка загрузки заказов');
            
            const orders = await response.json();
            renderOrders(orders);
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить заказы');
        }
    };
    
    // Отрисовка заказов
    const renderOrders = (orders) => {
        const container = document.getElementById('orders-container');
        container.innerHTML = '';
        
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.innerHTML = `
                <div class="order-header">
                    <div class="order-id">Заказ #${order.id}</div>
                    <div class="order-status ${order.status}">${getStatusText(order.status)}</div>
                    <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                
                <div class="order-body">
                    <div class="order-service">
                        <i class="${order.serviceIcon}"></i>
                        ${order.serviceName}
                    </div>
                    
                    <div class="order-details">
                        <div><strong>Адрес:</strong> ${order.address}</div>
                        <div><strong>Дата:</strong> ${new Date(order.scheduledDate).toLocaleString()}</div>
                        <div><strong>Мастер:</strong> ${order.master || 'Еще не назначен'}</div>
                        <div><strong>Стоимость:</strong> ${order.price} руб.</div>
                    </div>
                </div>
                
                <div class="order-footer">
                    <button class="btn btn-outline view-details" data-id="${order.id}">
                        Подробнее
                    </button>
                    
                    ${order.status === 'assigned' || order.status === 'in_progress' ? `
                    <button class="btn btn-primary track-order" data-id="${order.id}">
                        Отследить
                    </button>
                    ` : ''}
                    
                    ${order.status === 'completed' ? `
                    <button class="btn btn-outline leave-review" data-id="${order.id}">
                        Оставить отзыв
                    </button>
                    ` : ''}
                </div>
            `;
            
            container.appendChild(orderCard);
        });
        
        // Назначение обработчиков событий
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', () => {
                window.location.href = `order-details.html?id=${btn.dataset.id}`;
            });
        });
        
        document.querySelectorAll('.track-order').forEach(btn => {
            btn.addEventListener('click', () => {
                window.location.href = `tracking.html?orderId=${btn.dataset.id}`;
            });
        });
    };
    
    // Текст статуса
    const getStatusText = (status) => {
        const statuses = {
            'pending': 'Ожидает',
            'processing': 'В обработке',
            'assigned': 'Мастер назначен',
            'in_progress': 'Выполняется',
            'completed': 'Завершен',
            'cancelled': 'Отменен'
        };
        return statuses[status] || status;
    };
    
    // Инициализация
    await loadOrders();
});