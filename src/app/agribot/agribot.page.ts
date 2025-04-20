import { Component } from '@angular/core';
import { AgriBotService } from 'src/app/service/agribot.service';

@Component({
  selector: 'app-agribot',
  standalone: false,
  templateUrl: './agribot.page.html',
  styleUrls: ['./agribot.page.scss'],
})
export class AgriBotPage {
  userMessage: string = '';
  messages: { role: string, text: string }[] = [
    { role: 'bot', text: 'Hello! How can I assist you today?' }
  ];

  constructor(private agribotService: AgriBotService) {}

  async sendMessage() {
    if (!this.userMessage.trim()) return;
  
    // ✅ Add user message to chat
    this.messages.push({ role: 'user', text: this.userMessage });
  
    // ✅ Show "Thinking..." message
    this.messages.push({ role: 'bot', text: 'Thinking...' });
  
    try {
      // ✅ Call AgriBot API
      const response = await this.agribotService.sendMessage(this.userMessage).toPromise();
  
      // ✅ Remove "Thinking..." and add bot response
      this.messages.pop();
      this.messages.push({ role: 'bot', text: response ?? "No response received from AgriBot" });
  
    } catch (error) {
      console.error('AgriBot API Error:', error);
      this.messages.pop();
      this.messages.push({ role: 'bot', text: 'Error: Unable to connect to AgriBot. Please try again later.' });
    }
  
    // ✅ Clear input field
    this.userMessage = '';
  }  
}