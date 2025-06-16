document.addEventListener('DOMContentLoaded', async () => {
    // Загрузка заявок
    const loadOrders = async (filters = {}) => {
        try {
            const query = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/admin/orders?${query}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            
            if (!response.ok) throw new Error('Ошибка загрузки заявок');
            
            const orders = await response.json();
            renderOrders(orders);
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить заявки');
        }
    };
    
    // Отрисовка заявок в таблице
    const renderOrders = (orders) => {
        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.id}</td>
                <td>${order.service}</td>
                <td>${order.client}</td>
                <td>${order.address}</td>
                <td>${new Date(order.datetime).toLocaleString()}</td>
                <td>${order.master || 'Не назначен'}</td>
                <td><span class="status-badge ${order.status}">${getStatusText(order.status)}</span></td>
                <td>${order.price} руб.</td>
                <td class="actions-cell">
                    <button class="btn-icon view-order" data-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon assign-master" data-id="${order.id}">
                        <i class="fas fa-user-cog"></i>
                    </button>
                    <button class="btn-icon edit-order" data-id="${order.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Назначение обработчиков
        document.querySelectorAll('.view-order').forEach(btn => {
            btn.addEventListener('click', () => {
                openOrderDetails(btn.dataset.id);
            });
        });
    };
    
    // Открытие деталей заказа
    const openOrderDetails = (orderId) => {
        // Реализация модального окна с деталями заказа
    };
    
    // Текст статуса
    const getStatusText = (status) => {
        const statuses = {
            'pending': 'Ожидает',
            'assigned': 'Назначена',
            'in_progress': 'В работе',
            'completed': 'Завершена',
            'cancelled': 'Отменена'
        };
        return statuses[status] || status;
    };
    
    // Инициализация
    await loadOrders();
});