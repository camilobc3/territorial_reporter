# 1. Instalar Socket.IO client

Instalar en primer lugar:

```bash
npm install socket.io-client
```

---

# 2. Crear servicio websocket

``` sh
ng g s services/notification
```
## `notification.service.ts`

```ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private socket: Socket;

  constructor() {
    console.log('Inicializando NotificationService, conectando a WebSocket...');
    this.socket = io(environment.socketUrl, {
      transports: ['websocket']
    });
    console.log('Intentando conectar a WebSocket en', environment.socketUrl);

    this.socket.on('connect', () => {
      console.log('Conectado al servidor');
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error conexión:', error);
    });
  }

  onNewNotification(topic:string): Observable<any> {

    return new Observable(observer => {

      this.socket.on(topic, (data) => {
        observer.next(data);
      });

    });
  }
}
```

---

# 3. Consumir servicio en componente

## `app.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    interface notifications {
    id: number;
    img: string;
    title: string;
    subtitle: string;
    }

  constructor(
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    this.notificationService
      .onNewNotification("new_notification")
      .subscribe((data: any) => {

        console.log('Notificación recibida:', data);

        this.notifications.push(data.message);
      });
  }
}
```

---

# 4. Mostrar en HTML

## `app.component.html`

```html
<h1>Notificaciones</h1>

<ul>
  <li *ngFor="let notification of notifications">
    {{ notification }}
  </li>
</ul>
```

---

# 5. Levantar backend Flask

```bash
python app.py
```

---

# 6. Levantar Angular

```bash
ng serve
```

---

# 7. Resultado esperado

Cada 5 segundos aparecerá:

```txt
¡Tienes una nueva notificación!
```

---

# 8. Problema común → CORS

Ya lo tienes bien:

```python
socketio = SocketIO(app, cors_allowed_origins="*")
```

---

# 9. Importante para producción

Tu backend tiene este problema:

```python
@socketio.on("connect")
def handle_connect():
    socketio.start_background_task(send_notifications)
```

Cada cliente crea un loop infinito nuevo.

Debes hacerlo así:

```python
thread_started = False

@socketio.on("connect")
def handle_connect():
    global thread_started

    print("Cliente conectado")

    if not thread_started:
        socketio.start_background_task(send_notifications)
        thread_started = True
```

---

# 10. Si Angular y Flask están en máquinas distintas

Debes cambiar:

```ts
io('http://localhost:5000')
```

por:

```ts
io('http://IP_DEL_SERVIDOR:5000')
```

Ejemplo:

```ts
io('http://192.168.1.100:5000')
```

---

# 11. Extra: tipado correcto

Puedes tipar la respuesta:

```ts
interface Notification {
  message: string;
}
```

y usar:

```ts
Observable<Notification>
```

en lugar de `any`.
