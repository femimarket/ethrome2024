import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { protectData } from '../iexec';
import { tlsVerify } from '../transgate';
import { TradeComponent } from './trade/trade.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,TradeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'webapp';


  connectWallet() {
    tlsVerify()
  }
}



