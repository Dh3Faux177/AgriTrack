import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AgriBotService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions'; // ✅ OpenAI API
  private apiKey = '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'; // ✅ Replace with your actual API Key

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: "gpt-3.5-turbo", // ✅ Use GPT-3.5 or GPT-4
      messages: [{ role: "user", content: message }],
      max_tokens: 100
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(response => response?.choices?.[0]?.message?.content || "I'm sorry, I didn't understand that."),
      catchError(error => {
        console.error('AgriBot API Error:', error);
        return throwError(() => new Error('Error: Unable to connect to AgriBot.'));
      })
    );
  }
}