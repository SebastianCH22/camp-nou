// ==================== VARIABLES GLOBALES ====================
let cart = [];
let selectedStand = null;
let selectedSizes = {};   // ahora también guarda {player, number}

// Credenciales del login
const VALID_USERNAME = 'alumno';
const VALID_PASSWORD = '2025';

// ==================== LOGIN ====================
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const u = document.getElementById('username').value,
              p = document.getElementById('password').value,
              err = document.getElementById('errorMessage');

        if (u === VALID_USERNAME && p === VALID_PASSWORD) {
            window.location.href = 'main.html';
        } else {
            err.style.display = 'block';
            document.getElementById('password').value = '';
            setTimeout(() => err.style.display = 'none', 3000);
        }
    });
}

// ==================== NAVEGACIÓN ====================
if (document.querySelector('.main-content')) {

    /* ---------- 1.  INYECTAR SELECT E INPUT EN CADA CAMISETA  ---------- */
    const players = [
        {name:'Sin personalizar',  dorsal:''},
        {name:'Joan Garcia',        dorsal:'1'},
        {name:'Araujo',            dorsal:'4'},
        {name:'Cubarsí',             dorsal:'5'},
        {name:'A. Balde',       dorsal:'3'},
        {name:'Gavi',              dorsal:'6'},
        {name:'Ferran Torres',     dorsal:'7'},
        {name:'Pedri',             dorsal:'8'},
        {name:'Lewandowski',       dorsal:'9'},
        {name:'L. Yamal',         dorsal:'10'},
        {name:'Raphinha',          dorsal:'11'},
        {name:'Gerar Martin',           dorsal:'18'},
        {name:'Christensen',       dorsal:'15'},
        {name:'F. de Jong',        dorsal:'21'},
        {name:'Fermín',     dorsal:'16'},
        {name:'Rashford',       dorsal:'14'},
        {name:'Eric. G',       dorsal:'24'},
        {name:'Olmo',        dorsal:'20'},
        {name:'Koundé',            dorsal:'23'}
    ];

    document.querySelectorAll('.shirt-card').forEach(card => {
        const type = card.querySelector('.add-shirt-btn').dataset.type;

        const btnAdd = card.querySelector('.add-shirt-btn');   // botón que ya existe
        const wrapper = document.createElement('div');
        wrapper.className = 'player-custom';
        wrapper.innerHTML = `
            <label>Personaliza tu camiseta</label>
            <div class="player-line">
                <select class="player-list" data-type="${type}">
                    ${players.map(p=>`<option value="${p.name}" data-dorsal="${p.dorsal}">${p.name}${p.dorsal?' #'+p.dorsal:''}</option>`).join('')}
                </select>
                <input type="number" class="dorsal-input" data-type="${type}" min="0" max="99" placeholder="Nº" value="1" disabled>
            </div>
        `;
        card.insertBefore(wrapper, btnAdd);   // <- queda arriba del botón
    });

    /* ---------- 2.  CONTROLAR CAMBIOS  ---------- */
    document.addEventListener('change', e => {
        if (e.target.classList.contains('player-list')) {
            const card   = e.target.closest('.shirt-card');
            const type   = e.target.dataset.type;
            const dorsal = e.target.selectedOptions[0].dataset.dorsal;
            const input  = card.querySelector(`.dorsal-input[data-type="${type}"]`);

            input.value = dorsal || '1';   // dorsal en su campo
            input.disabled = !dorsal;

            if (!selectedSizes[type]) selectedSizes[type] = {};
            selectedSizes[type].player = e.target.value;
            selectedSizes[type].number = dorsal;
        }
        if (e.target.classList.contains('dorsal-input')) {
            const type = e.target.dataset.type;
            if (!selectedSizes[type]) selectedSizes[type] = {};
            selectedSizes[type].number = e.target.value;
        }
    });

    /* ---------- 3.  NAVEGACIÓN NORMAL  ---------- */
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');
        });
    });

    /* ---------- 4.  CERRAR SESIÓN  ---------- */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                cart = []; updateCart();
                window.location.href = 'index.html';
            }
        });
    }

    /* ---------- 5.  ENTRADAS  ---------- */
    document.querySelectorAll('.stand-zone').forEach(stand => {
        stand.addEventListener('click', function () {
            document.querySelectorAll('.stand-zone').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            selectedStand = { name: this.dataset.stand, price: parseInt(this.dataset.price) };
            document.getElementById('ticket-info').style.display = 'block';
            document.getElementById('selected-stand').textContent =
                this.dataset.stand.charAt(0).toUpperCase() + this.dataset.stand.slice(1);
            document.getElementById('selected-price').textContent = this.dataset.price;
        });
    });

    const addTicketBtn = document.getElementById('addTicketBtn');
    if (addTicketBtn) {
        addTicketBtn.addEventListener('click', () => {
            if (!selectedStand) return;
            const qty = parseInt(document.getElementById('ticket-quantity').value);
            cart.push({ type: 'ticket',
                        name: `Entrada - Tribuna ${selectedStand.name.charAt(0).toUpperCase()+selectedStand.name.slice(1)}`,
                        price: selectedStand.price, quantity: qty, total: selectedStand.price * qty });
            updateCart();
            alert('¡Entrada añadida al carrito! ¡Visca el Barça!');
        });
    }

    /* ---------- 6.  TALLAS  ---------- */
    document.querySelectorAll('.size-selector').forEach(selector => {
        const shirtType = selector.dataset.shirt;
        const buttons   = selector.querySelectorAll('.size-btn');
        buttons.forEach(btn =>
            btn.addEventListener('click', function () {
                buttons.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                if (!selectedSizes[shirtType]) selectedSizes[shirtType] = {};
                selectedSizes[shirtType].size = this.textContent;
            })
        );
    });

    /* ---------- 7.  AÑADIR CAMISETA  ---------- */
    document.querySelectorAll('.add-shirt-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            const type = this.dataset.type;

            const size   = selectedSizes[type]?.size;
            const player = selectedSizes[type]?.player;
            const number = selectedSizes[type]?.number;

            if (!size)   { alert('Por favor selecciona una talla para tu camiseta culé'); return; }

            const extra  = (player && number) ? ` (${player} #${number})` : '';
            const item   = { type: 'shirt',
                             name: `Camiseta ${name} - Talla ${size}${extra}`,
                             price, quantity: 1, total: price };
            cart.push(item);
            updateCart();
            alert('¡Camiseta añadida al carrito! ¡Visca Barça!');
        });
    });

    /* ---------- 8.  CARRITO  ---------- */
    window.removeFromCart = idx => { cart.splice(idx,1); updateCart(); };

    function updateCart() {
        const cartItems  = document.getElementById('cart-items');
        const cartCount  = document.getElementById('cart-count');
        const cartTotal  = document.getElementById('cart-total');

        if (!cartItems || !cartCount || !cartTotal) return;

        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,.7)">Tu carrito está vacío</p>';
            cartCount.textContent = '0';
            cartTotal.textContent = '0.00';
            return;
        }
        let html = '', total = 0;
        cart.forEach((it, i) => {
            html += `
                <div class="cart-item">
                    <strong>${it.name}</strong><br>
                    Cantidad: ${it.quantity} × Q${it.price.toFixed(2)} = Q${it.total.toFixed(2)}
                    <button onclick="removeFromCart(${i})" style="float:right;background:#a50044;color:white;border:none;padding:5px 10px;border-radius:3px;cursor:pointer;">
                        Eliminar
                    </button>
                </div>`;
            total += it.total;
        });
        cartItems.innerHTML = html;
        cartCount.textContent = cart.length;
        cartTotal.textContent = total.toFixed(2);
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) { alert('Tu carrito está vacío'); return; }
            const total = cart.reduce((s,it)=>s+it.total,0);
            alert(`🏆 ¡Gracias por tu compra culé!\n\nTotal: Q${total.toFixed(2)}\n\n¡Visca el Barça! ⚽\n\nSerás redirigido al pago...`);
            cart = []; updateCart();
        });
    }

    updateCart();
}