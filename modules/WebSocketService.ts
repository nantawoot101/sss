import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  private readonly url = 'ws://localhost:9090'; // URL ของ WebSocket server ของคุณ

  constructor() {
    this.socket$ = webSocket(this.url);
  }

  public connect(): void {
    this.socket$.next({ type: 'connect', payload: 'hello server' });
  }

  public sendMessage(message: string, userId: number): void {
    this.socket$.next({ type: 'message', payload: { message, userId } });
  }

  public onMessage(): Observable<any> {
    return this.socket$.asObservable();
  }

  public disconnect(): void {
    this.socket$.complete();
  }
}
