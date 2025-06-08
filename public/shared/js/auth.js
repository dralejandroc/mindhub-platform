// auth.js - Sistema de autenticación compartido para MindHub

class MindHubAuth {
    constructor() {
        this.tokenKey = 'mindhub_token';
        this.userKey = 'mindhub_user';
        this.init();
    }

    init() {
        // Verificar autenticación en páginas protegidas
        if (this.isProtectedPage()) {
            this.checkAuth();
        }
        
        // Verificar token periódicamente
        this.startTokenValidation();
    }

    isProtectedPage() {
        const protectedPaths = [
            '/sistema',
            '/clinimetrix',
            '/agenda',
            '/chart',
            '/rx',
            '/resources',
            '/forms',
            '/finance',
            '/configuracion'
        ];
        
        return protectedPaths.some(path => 
            window.location.pathname.startsWith(path)
        );
    }

    checkAuth() {
        const token = this.getToken();
        
        if (!token) {
            this.redirectToLogin();
            return false;
        }

        if (this.isTokenExpired(token)) {
            this.logout();
            return false;
        }

        return true;
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp < now;
        } catch (error) {
            console.error('Error al verificar token:', error);
            return true;
        }
    }

    async login(username, password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.setToken(result.token);
                this.setUser(result.user);
                return { success: true, user: result.user };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.redirectToLogin();
    }

    redirectToLogin() {
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    }

    redirectToSystem() {
        window.location.href = '/sistema';
    }

    startTokenValidation() {
        // Verificar token cada minuto
        // setInterval(() => {
            if (this.isProtectedPage()) {
                const token = this.getToken();
                if (token && this.isTokenExpired(token)) {
                    alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                    this.logout();
                }
            }
        }, 60000);
    }

    getUserInfo() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                username: payload.username,
                role: payload.role,
                userId: payload.userId,
                expiresAt: new Date(payload.exp * 1000)
            };
        } catch (error) {
            console.error('Error al obtener info del usuario:', error);
            return null;
        }
    }

    // Utility methods para módulos específicos
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }

    isDoctor() {
        const user = this.getUser();
        return user && (user.role === 'doctor' || user.role === 'admin');
    }

    // Método para hacer requests autenticados
    async authenticatedFetch(url, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            this.redirectToLogin();
            return;
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            this.logout();
            return;
        }

        return response;
    }
}

// Crear instancia global
window.MindHubAuth = new MindHubAuth();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MindHubAuth;
}