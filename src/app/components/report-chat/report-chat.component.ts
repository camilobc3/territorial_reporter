import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-report-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './report-chat.component.html',
  styleUrls: ['./report-chat.component.scss']
})
export class ReportChatComponent {

  @Input() messages: ChatMessage[] = [];
  @Input() loading: boolean = false;
  @Input() error: string = '';

  @Output() querySubmitted = new EventEmitter<string>();

  query: string = '';

  sendQuery(): void {
    const cleanQuery = this.query.trim();

    if (!cleanQuery) return;

    this.querySubmitted.emit(cleanQuery);

    this.query = '';
  }
}