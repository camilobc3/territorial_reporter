export interface User {
    id?: number;
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    website?: string;
    password?: string; // Solo para login, no se debe enviar al backend en otros casos
}