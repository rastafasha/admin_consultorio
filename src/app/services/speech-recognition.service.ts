import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {

  private recognition: any;
  private isListening = false;
  
  // Canal por donde viaja la transcripción en tiempo real
  private transcriptionSource = new Subject<string>();
  transcription$ = this.transcriptionSource.asObservable();

  constructor() {
    this.initSpeech();
  }

  private initSpeech() {
    const { webkitSpeechRecognition }: any = window as any;
    if (webkitSpeechRecognition) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-VE'; // Configurado para acento de Venezuela

      this.recognition.onresult = (event: any) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        this.transcriptionSource.next(transcript);
      };

      this.recognition.onerror = (err: any) => console.error('Error de voz:', err);
    }
  }

  toggleListening(start: boolean) {
    if (!this.recognition) return false;
    
    this.isListening = start;
    if (this.isListening) {
      this.recognition.start();
    } else {
      this.recognition.stop();
    }
    return true;
  }
}
